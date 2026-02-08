from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import cv2
import time
from ultralytics import YOLO
import yt_dlp
from . import crud, models, schemas
from .database import SessionLocal, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Input CORS configuration
# Cyberpunk Theme: Dark #0A0A0A + Neon Green #39FF14 is for Frontend, 
# but we need to allow the frontend to access the API.
origins = ["*"] # Allow all for now, narrow down in production

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Load YOLO model once
# Using yolov8n.pt as requested
model = YOLO("yolo26x.pt")

# Global dictionary to store stats by camera_id
camera_stats = {}

@app.post("/cameras/", response_model=schemas.CameraResponse)
def create_camera(camera: schemas.CameraCreate, db: Session = Depends(get_db)):
    return crud.create_camera(db=db, camera=camera)

@app.get("/cameras/", response_model=List[schemas.CameraResponse])
def read_cameras(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    cameras = crud.get_cameras(db, skip=skip, limit=limit)
    return cameras

@app.delete("/cameras/{camera_id}")
def delete_camera(camera_id: int, db: Session = Depends(get_db)):
    success = crud.delete_camera(db, camera_id)
    if not success:
        raise HTTPException(status_code=404, detail="Camera not found")
    return {"status": "success", "message": "Camera deleted"}

# Track history per camera: {camera_id: {seen_ids: set(), start_time: float}}
track_history = {}

def video_generator(source_url: str, camera_id: int):
    cap = None
    try:
        if "youtube.com" in source_url or "youtu.be" in source_url:
             ydl_opts = {'format': 'best', 'quiet': True}
             with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                 info = ydl.extract_info(source_url, download=False)
                 video_url = info.get('url')
                 if not video_url:
                     print(f"Error: Could not extract video URL from {source_url}")
                     return
                 cap = cv2.VideoCapture(video_url)
        else:
             cap = cv2.VideoCapture(source_url)
        
        if not cap or not cap.isOpened():
             print(f"Error opening video source: {source_url}")
             return

        # Initialize tracking history for this camera
        if camera_id not in track_history:
            track_history[camera_id] = {
                "seen_ids": set(),
                "start_time": time.time()
            }

        prev_time = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # YOLO Track (persist=True keeps IDs across frames)
            results = model.track(frame, persist=True, stream=True, conf=0.3)
            
            for result in results:
                # Instantaneous counts
                counts = {"car": 0, "motorcycle": 0, "bus": 0, "truck": 0}
                
                # Check for tracks
                if result.boxes.id is not None:
                    ids = result.boxes.id.cpu().numpy().astype(int)
                    for box, obj_id in zip(result.boxes, ids):
                        cls_id = int(box.cls[0])
                        label = model.names[cls_id]
                        if label in counts:
                            counts[label] += 1
                        
                        # Accumulate unique IDs for flow calculation
                        track_history[camera_id]["seen_ids"].add(obj_id)
                else:
                    # Fallback to normal detection if tracking failed
                    for box in result.boxes:
                        cls_id = int(box.cls[0])
                        label = model.names[cls_id]
                        if label in counts:
                            counts[label] += 1

                # Calculate Traffic Flow metrics
                elapsed_minutes = (time.time() - track_history[camera_id]["start_time"]) / 60
                total_unique = len(track_history[camera_id]["seen_ids"])
                flow_rate = round(total_unique / elapsed_minutes) if elapsed_minutes > 0 else 0
                
                # Update global stats
                camera_stats[camera_id] = {
                    **counts,
                    "total_vehicles": total_unique,
                    "flow_rate": flow_rate # vehicles per minute
                }

                annotated_frame = result.plot()
                
                # Calculate FPS
                curr_time = time.time()
                fps = 1 / (curr_time - prev_time) if (curr_time - prev_time) > 0 else 0
                prev_time = curr_time
                
                # Overlay Stats on frame
                y_offset = 30
                cv2.putText(annotated_frame, f"FPS: {int(fps)}", (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(annotated_frame, f"Total: {total_unique}", (10, y_offset + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
                cv2.putText(annotated_frame, f"Flow: {flow_rate} v/m", (10, y_offset + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                
                # Encode JPG
                (flag, encodedImage) = cv2.imencode(".jpg", annotated_frame)
                if not flag:
                    continue
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')

    except Exception as e:
        print(f"Error in video_generator: {e}")
    finally:
        if cap:
            cap.release()

@app.get("/video_feed/{camera_id}")
def video_feed(camera_id: int, db: Session = Depends(get_db)):
    camera = crud.get_camera(db, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    return StreamingResponse(video_generator(camera.source_url, camera_id), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/stats/{camera_id}")
def get_stats(camera_id: int):
    if camera_id in camera_stats:
        return camera_stats[camera_id]
    return {"car": 0, "motorcycle": 0, "bus": 0, "truck": 0, "total_vehicles": 0, "flow_rate": 0}

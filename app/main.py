from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
import cv2
import time
import threading
import numpy as np
from ultralytics import YOLO
import yt_dlp
from . import crud, models, schemas
from .database import SessionLocal, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS configuration
origins = ["*"]

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

# ==================== CONFIG ====================
JPEG_QUALITY = 75
DETECT_CONF = 0.3
# ================================================

# Load YOLO model
print("Loading YOLO model...")
model = YOLO("yolo26x.pt")

# Global stats
camera_stats = {}
track_history = {}

# Active streams storage
active_streams: Dict[int, 'CameraStream'] = {}


class CameraStream:
    """
    Simplified camera stream - single detection thread with latest frame only.
    No complex buffering to minimize latency.
    """
    
    def __init__(self, camera_id: int, source_url: str):
        self.camera_id = camera_id
        self.source_url = source_url
        self.cap = None
        self.running = False
        
        # Latest encoded frame (ready to stream)
        self.output_frame = None
        self.frame_ready = threading.Event()
        
        # Stats
        self.fps = 0
        
        # Initialize tracking
        if camera_id not in track_history:
            track_history[camera_id] = {
                "seen_ids": set(),
                "start_time": time.time()
            }
    
    def start(self):
        """Start the processing thread."""
        # Open video source
        if "youtube.com" in self.source_url or "youtu.be" in self.source_url:
            ydl_opts = {'format': 'best[height<=720]', 'quiet': True}
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(self.source_url, download=False)
                    video_url = info.get('url')
                    if not video_url:
                        return False
                    self.cap = cv2.VideoCapture(video_url)
            except Exception as e:
                print(f"YouTube error: {e}")
                return False
        else:
            self.cap = cv2.VideoCapture(self.source_url)
        
        if not self.cap or not self.cap.isOpened():
            return False
        
        # Minimize capture buffer latency
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        self.running = True
        
        # Single thread: read -> detect -> encode
        self.process_thread = threading.Thread(target=self._process_loop, daemon=True)
        self.process_thread.start()
        
        return True
    
    def stop(self):
        self.running = False
        self.frame_ready.set()  # Unblock any waiting
        if self.cap:
            self.cap.release()
    
    def _process_loop(self):
        """Main processing loop: capture -> detect -> encode."""
        prev_time = time.time()
        
        while self.running:
            # Read frame
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(0.01)
                continue
            
            # Run detection
            results = model(frame, conf=DETECT_CONF, verbose=False)
            
            # Process results and draw
            counts = {"car": 0, "motorcycle": 0, "bus": 0, "truck": 0}
            
            for result in results:
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    label = model.names[cls_id]
                    if label in counts:
                        counts[label] += 1
                    
                    # Draw bounding box
                    x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                    conf = float(box.conf[0])
                    
                    # Color by type
                    color = (0, 255, 0) if label == "car" else (255, 165, 0) if label == "motorcycle" else (0, 0, 255)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    
                    # Label
                    cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 5), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            # Update stats
            total = sum(counts.values())
            elapsed = (time.time() - track_history[self.camera_id]["start_time"]) / 60
            camera_stats[self.camera_id] = {
                **counts,
                "total_vehicles": total,
                "flow_rate": round(total / elapsed) if elapsed > 0 else 0
            }
            
            # Calculate FPS
            curr_time = time.time()
            self.fps = 1 / (curr_time - prev_time) if (curr_time - prev_time) > 0 else 0
            prev_time = curr_time
            
            # Draw FPS
            cv2.putText(frame, f"FPS: {int(self.fps)}", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Count: {total}", (10, 60), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
            
            # Encode to JPEG
            _, encoded = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
            
            # Update output frame (atomic operation)
            self.output_frame = encoded
            self.frame_ready.set()
    
    def get_frame(self):
        """Get latest encoded frame."""
        self.frame_ready.wait(timeout=0.1)
        self.frame_ready.clear()
        return self.output_frame


def video_generator(camera_id: int, source_url: str):
    """Stream generator - yields frames as fast as they're ready."""
    # Get or create stream
    if camera_id not in active_streams:
        stream = CameraStream(camera_id, source_url)
        if not stream.start():
            yield b''
            return
        active_streams[camera_id] = stream
    
    stream = active_streams[camera_id]
    
    try:
        while stream.running:
            frame_data = stream.get_frame()
            
            if frame_data is not None:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + bytearray(frame_data) + b'\r\n')
            
    except GeneratorExit:
        pass


@app.post("/cameras/", response_model=schemas.CameraResponse)
def create_camera(camera: schemas.CameraCreate, db: Session = Depends(get_db)):
    return crud.create_camera(db=db, camera=camera)

@app.get("/cameras/", response_model=List[schemas.CameraResponse])
def read_cameras(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_cameras(db, skip=skip, limit=limit)

@app.delete("/cameras/{camera_id}")
def delete_camera(camera_id: int, db: Session = Depends(get_db)):
    if camera_id in active_streams:
        active_streams[camera_id].stop()
        del active_streams[camera_id]
    
    if not crud.delete_camera(db, camera_id):
        raise HTTPException(status_code=404, detail="Camera not found")
    return {"status": "success"}

@app.get("/video_feed/{camera_id}")
def video_feed(camera_id: int, db: Session = Depends(get_db)):
    camera = crud.get_camera(db, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    return StreamingResponse(
        video_generator(camera_id, camera.source_url), 
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/stats/{camera_id}")
def get_stats(camera_id: int):
    if camera_id in camera_stats:
        return camera_stats[camera_id]
    return {"car": 0, "motorcycle": 0, "bus": 0, "truck": 0, "total_vehicles": 0, "flow_rate": 0}


# ==================== TRAFFIC HISTORY ENDPOINTS ====================

@app.get("/traffic/hourly")
def get_hourly_traffic(camera_id: int = None, hours: int = 24, db: Session = Depends(get_db)):
    """Get hourly traffic data for charts."""
    return crud.get_hourly_traffic(db, camera_id=camera_id, hours=hours)

@app.get("/traffic/daily")
def get_daily_traffic(camera_id: int = None, days: int = 7, db: Session = Depends(get_db)):
    """Get daily traffic data for weekly trends chart."""
    return crud.get_daily_traffic(db, camera_id=camera_id, days=days)

@app.post("/traffic/log/{camera_id}")
def log_traffic(camera_id: int, db: Session = Depends(get_db)):
    """Manually trigger traffic logging for a camera."""
    if camera_id in camera_stats:
        crud.create_traffic_log(db, camera_id, camera_stats[camera_id])
        return {"status": "logged"}
    return {"status": "no_data"}


# Background task to log traffic every 30 seconds
def traffic_logger():
    """Background thread that logs traffic data periodically."""
    while True:
        time.sleep(30)  # Log every 30 seconds
        try:
            db = SessionLocal()
            for camera_id, stats in camera_stats.items():
                if stats.get("total_vehicles", 0) > 0:
                    crud.create_traffic_log(db, camera_id, stats)
            db.close()
        except Exception as e:
            print(f"Traffic logging error: {e}")

# Start traffic logger thread on startup
@app.on_event("startup")
def startup_event():
    logger_thread = threading.Thread(target=traffic_logger, daemon=True)
    logger_thread.start()
    print("Traffic logger started")

@app.on_event("shutdown")
def shutdown_event():
    for stream in active_streams.values():
        stream.stop()
    active_streams.clear()


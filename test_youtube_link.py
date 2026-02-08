import cv2
import time
from cap_from_youtube import cap_from_youtube
from ultralytics import YOLO

# 1. Khởi tạo mô hình YOLOv8
model = YOLO('yolo26x.pt') 

# 2. Link YouTube bạn cung cấp
youtube_url = "https://www.youtube.com/watch?v=AcndFyZebdc"

# 3. Mở stream với độ phân giải mong muốn
import yt_dlp

ydl_opts = {
    'format': 'best[ext=mp4]/best',
    'quiet': True,
    'no_warnings': True,
}

try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(youtube_url, download=False)
        video_url = info_dict.get('url', None)

    if not video_url:
        print("Could not extract video URL.")
        exit()

    cap = cv2.VideoCapture(video_url)
except Exception as e:
    print(f"Error extracting video stream: {e}")
    exit()

prev_time = time.time()

while cap.isOpened():
    success, frame = cap.read()
    if success:
        # 4. Thực hiện detect (Ví dụ: chỉ detect người và xe)
        # classes=[0, 2, 3, 5, 7] (0: person, 2: car, 3: motorcycle, 5: bus, 7: truck)
        results = model.predict(frame, conf=0.25, classes=[0, 2, 3, 5, 7])
        
        # 5. Vẽ kết quả lên khung hình
        annotated_frame = results[0].plot()
        
        # Calculate and display FPS
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time)
        prev_time = curr_time
        cv2.putText(annotated_frame, f"FPS: {fps:.2f}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # 6. Hiển thị lên cửa sổ (Hoặc gửi lên giao diện Web của bạn)
        cv2.imshow("Da Nang Hospital Camera - AI Detect", annotated_frame)
    
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        break

cap.release()
cv2.destroyAllWindows()
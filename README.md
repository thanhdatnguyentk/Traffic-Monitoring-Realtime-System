# SmartCity AI - Traffic Monitoring System

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-18+-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/YOLOv8-Ultralytics-purple" alt="YOLO">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

A real-time traffic monitoring and vehicle counting system powered by AI (YOLOv8) with a modern React dashboard.

## ✨ Features

- **🎯 Real-time Vehicle Detection**: Using YOLOv8 for accurate vehicle detection (cars, motorcycles, buses, trucks)
- **📊 Traffic Flow Analysis**: Calculate traffic flow rate (vehicles/minute) using object tracking
- **📹 Multi-Camera Support**: Add and manage multiple camera sources (YouTube Live, RTSP, local files)
- **🗺️ Interactive Map**: Leaflet-based map with camera locations and Windy.com weather radar
- **🌤️ Live Weather**: Real-time weather data from Open-Meteo API
- **💾 Database Storage**: SQLite database for camera and statistics persistence
- **📱 Responsive Dashboard**: Modern React UI with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Lightweight database
- **YOLOv8 (Ultralytics)** - AI object detection
- **OpenCV** - Video processing
- **yt-dlp** - YouTube stream extraction

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React-Leaflet** - Interactive maps
- **Lucide React** - Icons

## 📁 Project Structure

```
test_snitch/
├── app/                    # Backend (FastAPI)
│   ├── __init__.py
│   ├── main.py            # API routes & video processing
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── crud.py            # Database operations
│   └── database.py        # Database connection
├── frontend/              # Frontend (React)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── views/         # Page views
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── yolo26x.pt             # YOLO model weights
├── requirements.txt       # Python dependencies
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or pnpm

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartcity-ai.git
   cd smartcity-ai
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   .\venv\Scripts\activate   # Windows
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server**
   ```bash
   py -3.10 -m uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:5173`

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cameras/` | List all cameras |
| POST | `/cameras/` | Add new camera |
| DELETE | `/cameras/{id}` | Delete camera |
| GET | `/video_feed/{id}` | Stream video with AI detection |
| GET | `/stats/{id}` | Get real-time detection stats |

## 🎮 Usage

1. **Add a Camera**: Click "+ Add Camera" on the Dashboard
2. **Enter Source URL**: 
   - YouTube Live: `https://www.youtube.com/watch?v=VIDEO_ID`
   - RTSP Stream: `rtsp://username:password@ip:port/stream`
   - Local file: `path/to/video.mp4`
3. **View Detection**: The AI will automatically detect and count vehicles
4. **Monitor Stats**: View real-time statistics in the dashboard panels

## ⚙️ Configuration

### Settings Page Options

- **AI Detection**
  - Confidence Threshold (0.1 - 0.9)
  - Model Type (YOLOv8n, YOLOv8s, YOLOv8m, YOLOv8l, YOLOv11)
  - GPU Acceleration

- **Display**
  - Show FPS overlay
  - Show Bounding Boxes
  - Dark Mode

- **Notifications**
  - High Traffic Alerts
  - Camera Offline Alerts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Leaflet](https://leafletjs.com/)
- [Windy.com](https://windy.com/)
- [Open-Meteo](https://open-meteo.com/)

---

<p align="center">
  Made with fun ^^
</p>
# Traffic-Monitoring-Realtime-System

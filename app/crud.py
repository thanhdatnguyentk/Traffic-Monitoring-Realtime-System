from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from . import models, schemas

def get_camera(db: Session, camera_id: int):
    return db.query(models.Camera).filter(models.Camera.id == camera_id).first()

def get_cameras(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Camera).offset(skip).limit(limit).all()

def create_camera(db: Session, camera: schemas.CameraCreate):
    db_camera = models.Camera(**camera.dict())
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    return db_camera

def delete_camera(db: Session, camera_id: int):
    db_camera = db.query(models.Camera).filter(models.Camera.id == camera_id).first()
    if db_camera:
        db.delete(db_camera)
        db.commit()
        return True
    return False


# ==================== TRAFFIC LOG CRUD ====================

def create_traffic_log(db: Session, camera_id: int, stats: dict):
    """Create a traffic log entry."""
    db_log = models.TrafficLog(
        camera_id=camera_id,
        car_count=stats.get("car", 0),
        motorcycle_count=stats.get("motorcycle", 0),
        bus_count=stats.get("bus", 0),
        truck_count=stats.get("truck", 0),
        total_count=stats.get("total_vehicles", 0),
        flow_rate=stats.get("flow_rate", 0.0)
    )
    db.add(db_log)
    db.commit()
    return db_log


def get_hourly_traffic(db: Session, camera_id: int = None, hours: int = 24):
    """Get traffic data aggregated by hour for the last N hours."""
    since = datetime.now() - timedelta(hours=hours)
    
    query = db.query(
        func.strftime('%H:00', models.TrafficLog.timestamp).label('hour'),
        func.sum(models.TrafficLog.total_count).label('vehicles')
    ).filter(
        models.TrafficLog.timestamp >= since
    )
    
    if camera_id:
        query = query.filter(models.TrafficLog.camera_id == camera_id)
    
    results = query.group_by(
        func.strftime('%H', models.TrafficLog.timestamp)
    ).order_by('hour').all()
    
    return [{"hour": r.hour, "vehicles": r.vehicles or 0} for r in results]


def get_daily_traffic(db: Session, camera_id: int = None, days: int = 7):
    """Get traffic data aggregated by day for the last N days."""
    since = datetime.now() - timedelta(days=days)
    
    query = db.query(
        func.strftime('%w', models.TrafficLog.timestamp).label('day_of_week'),
        func.sum(models.TrafficLog.total_count).label('vehicles')
    ).filter(
        models.TrafficLog.timestamp >= since
    )
    
    if camera_id:
        query = query.filter(models.TrafficLog.camera_id == camera_id)
    
    results = query.group_by(
        func.strftime('%w', models.TrafficLog.timestamp)
    ).all()
    
    # Convert to day names
    day_names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    day_data = {str(i): 0 for i in range(7)}
    
    for r in results:
        if r.day_of_week:
            day_data[r.day_of_week] = r.vehicles or 0
    
    return [{"name": day_names[int(k)], "vehicles": v} for k, v in sorted(day_data.items())]


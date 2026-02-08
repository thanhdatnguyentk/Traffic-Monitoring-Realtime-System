from sqlalchemy.orm import Session
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

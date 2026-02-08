from app.database import SessionLocal, engine, Base
from app.models import Camera

def test_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Creating test camera...")
        new_camera = Camera(name="Test Cam", source_url="http://test.com/video", location="Test Location")
        db.add(new_camera)
        db.commit()
        db.refresh(new_camera)
        print(f"Created camera: {new_camera.id} - {new_camera.name}")
        
        print("Querying camera...")
        cam = db.query(Camera).filter(Camera.source_url == "http://test.com/video").first()
        if cam:
            print(f"Found camera: {cam.name} at {cam.location}")
        else:
            print("Camera not found!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_db()

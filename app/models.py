from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func
from .database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    source_url = Column(String, unique=True, index=True)
    location = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TrafficLog(Base):
    """Stores hourly traffic data for historical charts."""
    __tablename__ = "traffic_logs"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    car_count = Column(Integer, default=0)
    motorcycle_count = Column(Integer, default=0)
    bus_count = Column(Integer, default=0)
    truck_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    flow_rate = Column(Float, default=0.0)


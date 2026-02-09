from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class CameraBase(BaseModel):
    name: str
    source_url: str
    location: Optional[str] = None

class CameraCreate(CameraBase):
    pass

class CameraResponse(CameraBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TrafficLogResponse(BaseModel):
    id: int
    camera_id: int
    timestamp: datetime
    car_count: int
    motorcycle_count: int
    bus_count: int
    truck_count: int
    total_count: int
    flow_rate: float

    class Config:
        from_attributes = True


class HourlyTrafficData(BaseModel):
    hour: str
    vehicles: int


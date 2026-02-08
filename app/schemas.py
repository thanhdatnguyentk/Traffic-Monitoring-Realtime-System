from pydantic import BaseModel
from datetime import datetime
from typing import Optional

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

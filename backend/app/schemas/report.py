from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReportCreate(BaseModel):
    photo_url: Optional[str] = None   # set by backend after upload
    location: str
    description: str
    water_source: str


class ReportUpdate(BaseModel):
    location: str
    description: str
    water_source: str
    status: str

class ReportStatusUpdate(BaseModel):
    status: str
    
class ReportResponse(BaseModel):
    id: int
    user_id: int
    photo_url: Optional[str] = None
    location: str
    description: str
    water_source: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
from pydantic import BaseModel
from datetime import datetime


class ReportCreate(BaseModel):

    user_id: int
    photo_url: str
    location: str
    description: str
    water_source: str


class ReportUpdate(BaseModel):

    location: str
    description: str
    water_source: str
    status: str


class ReportResponse(BaseModel):

    id: int
    user_id: int
    photo_url: str
    location: str
    description: str
    water_source: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
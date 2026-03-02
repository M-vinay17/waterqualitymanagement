from pydantic import BaseModel
from datetime import datetime


class WaterStationCreate(BaseModel):

    name: str
    location: str
    latitude: float
    longitude: float
    managed_by: str


class WaterStationUpdate(BaseModel):

    name: str
    location: str
    latitude: float
    longitude: float
    managed_by: str


class WaterStationResponse(BaseModel):

    id: int
    name: str
    location: str
    latitude: float
    longitude: float
    managed_by: str
    created_at: datetime

    class Config:
        from_attributes = True
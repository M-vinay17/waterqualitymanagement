from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WaterStationCreate(BaseModel):
    name: str
    location: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    managed_by: str

class WaterStationOut(BaseModel):
    id: int
    name: str
    location: str
    latitude: float
    longitude: float
    managed_by: str
    created_at: datetime

    class Config:
        from_attributes = True   # allows ORM → dict conversion

class StationReadingCreate(BaseModel):
    station_id: int
    parameter: str
    value: float

class StationReadingOut(BaseModel):
    id: int
    station_id: int
    parameter: str
    value: float
    recorded_at: datetime

    class Config:
        from_attributes = True

# For map — latest reading + status per station
class StationWithLatestReading(BaseModel):
    station: WaterStationOut
    latest_reading: Optional[StationReadingOut] = None
    safety_status: str = "unknown"   # green / yellow / red / unknown
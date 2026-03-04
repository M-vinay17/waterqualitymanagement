from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


# -------------------------------
# Water Station Schemas
# -------------------------------
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

    model_config = ConfigDict(from_attributes=True)


# -------------------------------
# Station Reading Schemas
# -------------------------------
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

    model_config = ConfigDict(from_attributes=True)


# -------------------------------
# Map Response Schema
# -------------------------------
class StationWithLatestReading(BaseModel):
    station: WaterStationOut
    latest_reading: Optional[StationReadingOut] = None
    safety_status: str = "unknown"


# -------------------------------
# Simple Water Reading Schemas
# -------------------------------
class WaterReadingBase(BaseModel):

    station_name: str
    latitude: float
    longitude: float

    ph: float
    turbidity: float
    dissolved_oxygen: float

    temperature: Optional[float] = None
    arsenic: Optional[float] = None
    iron: Optional[float] = None
    ecoli: Optional[float] = None

    status: str


class WaterReadingCreate(WaterReadingBase):
    pass


class WaterReadingResponse(WaterReadingBase):

    id: int
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)
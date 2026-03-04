from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


# =====================================================
# Water Station Schemas
# =====================================================

class WaterStationCreate(BaseModel):
    name: str
    location: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    managed_by: str
    external_id: Optional[str] = None
    external_source: Optional[str] = None


class WaterStationOut(BaseModel):
    id: int
    name: str
    location: str
    latitude: float
    longitude: float
    managed_by: str
    external_id: Optional[str] = None
    external_source: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# Station Reading Schemas
# =====================================================

class StationReadingCreate(BaseModel):
    station_id: int
    parameter: str
    value: float
    unit: Optional[str] = None
    recorded_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    source: Optional[str] = "local"
    quality_flag: Optional[str] = None


class StationReadingOut(BaseModel):
    id: int
    station_id: int
    parameter: str
    value: float
    unit: Optional[str] = None
    recorded_at: datetime
    source: Optional[str] = "local"
    quality_flag: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# Map Response Schema
# =====================================================

class StationWithLatestReading(BaseModel):
    station: WaterStationOut
    latest_reading: Optional[StationReadingOut] = None
    safety_status: str = "unknown"


# =====================================================
# Simple Water Reading Schemas
# =====================================================

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
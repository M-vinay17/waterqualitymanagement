from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict
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


# =====================================================
# India Gov Schemas  ← NEW
# Used by routes/water.py India Gov endpoints
# =====================================================

class IndiaGovParameterOut(BaseModel):
    """One water quality parameter — e.g. ph, do, bod"""
    value: Optional[float] = None
    unit: Optional[str] = ""


class IndiaGovStationOut(BaseModel):
    """
    Station from data.gov.in
    Used by: GET /water/india/stations
    """
    name: str
    location: str
    latitude: float
    longitude: float
    managed_by: str
    external_id: str
    external_source: str
    state: Optional[str] = None
    district: Optional[str] = None
    river: Optional[str] = None


class IndiaGovReadingOut(BaseModel):
    """
    One reading record from data.gov.in
    Contains station info + all water quality parameters
    Used by: GET /water/india/readings
    """
    # Station info
    name: str
    location: str
    latitude: float
    longitude: float
    managed_by: str
    external_id: str
    state: Optional[str] = None
    district: Optional[str] = None
    river: Optional[str] = None
    recorded_at: datetime

    # All water quality parameters
    parameters: Dict[str, IndiaGovParameterOut]


class IndiaGovStationsResponse(BaseModel):
    """
    Full response for GET /water/india/stations
    """
    source: str = "INDIA_GOV"
    state: str
    district: str
    count: int
    stations: list[IndiaGovStationOut]


class IndiaGovReadingsResponse(BaseModel):
    """
    Full response for GET /water/india/readings
    """
    source: str = "INDIA_GOV"
    state: str
    district: str
    count: int
    readings: list[IndiaGovReadingOut]


class IndiaGovFetchResponse(BaseModel):
    """
    Response for GET /water/fetch-india (save to DB)
    """
    message: str
    state: str
    district: str
    readings_saved: int
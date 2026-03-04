from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class WaterReadingBase(BaseModel):

    station_name: str
    latitude: float
    longitude: float

    ph: float
    turbidity: float
    dissolved_oxygen: float

    # NEW PARAMETERS
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
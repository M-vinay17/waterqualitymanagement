from pydantic import BaseModel, ConfigDict

class WaterReadingBase(BaseModel):
    station_name: str
    latitude: float
    longitude: float
    ph: float
    turbidity: float
    dissolved_oxygen: float
    status: str


class WaterReadingCreate(WaterReadingBase):
    pass


class WaterReadingResponse(WaterReadingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
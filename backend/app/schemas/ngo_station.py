from pydantic import BaseModel


class NGOStationCreate(BaseModel):

    name: str
    latitude: float
    longitude: float
    managed_by: str
    description : str
    contact:str


class NGOStationOut(NGOStationCreate):

    id: int

    class Config:
        from_attributes = True
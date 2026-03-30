from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.ngo_station import NGOStation
from app.schemas.ngo_station import NGOStationCreate, NGOStationOut


router = APIRouter(
   
    tags=["NGO Stations"]
)


@router.get("/ngo-stations", response_model=list[NGOStationOut])
def get_ngo_stations(db: Session = Depends(get_db)):

    return db.query(NGOStation).all()


@router.post("/ngo-stations", response_model=NGOStationOut)
def create_ngo_station(station: NGOStationCreate, db: Session = Depends(get_db)):

    new_station = NGOStation(**station.dict())

    db.add(new_station)

    db.commit()

    db.refresh(new_station)

    return new_station
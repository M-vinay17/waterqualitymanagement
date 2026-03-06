from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.water_station import (
    WaterStationCreate,
    WaterStationUpdate,
    WaterStationResponse
)

from app.models.water_station import WaterStation

from app.core.database import get_db


router = APIRouter(
    prefix="/water-stations",
    tags=["Water Stations"]
)


# CREATE
@router.post("/", response_model=WaterStationResponse)
def create_station(station: WaterStationCreate, db: Session = Depends(get_db)):

    new_station = WaterStation(**station.dict())

    db.add(new_station)

    db.commit()

    db.refresh(new_station)

    return new_station


# GET ALL
@router.get("/", response_model=list[WaterStationResponse])
def get_all_stations(db: Session = Depends(get_db)):

    return db.query(WaterStation).all()


# GET ONE
@router.get("/{station_id}", response_model=WaterStationResponse)
def get_station(station_id: int, db: Session = Depends(get_db)):

    station = db.query(WaterStation).filter(
        WaterStation.id == station_id
    ).first()

    if not station:

        raise HTTPException(status_code=404, detail="Station not found")

    return station


# UPDATE
@router.put("/{station_id}")
def update_station(
    station_id: int,
    station_data: WaterStationUpdate,
    db: Session = Depends(get_db)
):

    station = db.query(WaterStation).filter(
        WaterStation.id == station_id
    ).first()

    if not station:

        raise HTTPException(status_code=404, detail="Station not found")

    for key, value in station_data.dict().items():

        setattr(station, key, value)

    db.commit()

    return {"message": "Water station updated successfully"}


# DELETE
@router.delete("/{station_id}")
def delete_station(station_id: int, db: Session = Depends(get_db)):

    station = db.query(WaterStation).filter(
        WaterStation.id == station_id
    ).first()

    if not station:

        raise HTTPException(status_code=404, detail="Station not found")

    db.delete(station)

    db.commit()

    return {"message": "Water station deleted successfully"}
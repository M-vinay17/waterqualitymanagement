from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.water_station import WaterStation
from app.models.station_readings import StationReading
from app.models.user import User

from app.schemas.water import (
    WaterStationCreate,
    WaterStationOut,
    StationReadingCreate,
    StationReadingOut,
    StationWithLatestReading
)

from app.services.epa_service import fetch_epa_data


router = APIRouter(prefix="/water", tags=["Water"])


# -------------------------------------------------
# Safety Logic
# -------------------------------------------------
def get_safety_status(parameter: str, value: float) -> str:
    if parameter.lower() == "ph":
        if value < 6.5 or value > 8.5:
            return "red"
        elif value < 7.0 or value > 8.0:
            return "yellow"
        return "green"

    return "unknown"


# -------------------------------------------------
# Create Water Station
# -------------------------------------------------
@router.post("/stations", response_model=WaterStationOut, status_code=201)
def create_station(
    station: WaterStationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "authority"]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or authority can create stations"
        )

    db_station = WaterStation(**station.dict())
    db.add(db_station)
    db.commit()
    db.refresh(db_station)

    return db_station


# -------------------------------------------------
# Create Station Reading
# -------------------------------------------------
@router.post("/readings", response_model=StationReadingOut, status_code=201)
def create_reading(
    reading: StationReadingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "authority"]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or authority can add readings"
        )

    station = db.query(WaterStation).filter(
        WaterStation.id == reading.station_id
    ).first()

    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    db_reading = StationReading(**reading.dict())
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)

    return db_reading


# -------------------------------------------------
# Fetch EPA API Data and Store in DB
# -------------------------------------------------
@router.get("/fetch-epa")
async def fetch_and_store_epa_data(
    state: str,
    parameter: str,
    db: Session = Depends(get_db)
):
    data = await fetch_epa_data(state, parameter)

    if not data or "Results" not in data or not data["Results"]:
        return {"message": "No EPA data found"}

    saved_readings = []

    for item in data["Results"][:5]:  # limit for safety

        # Try to find station by name
        station_name = item.get("MonitoringLocationName", "EPA Station")

        station = db.query(WaterStation).filter(
            WaterStation.name == station_name
        ).first()

        # If station not exists → create it
        if not station:
            station = WaterStation(
                name=station_name,
                location=item.get("MonitoringLocationName", "Unknown"),
                latitude=float(item.get("LatitudeMeasure", 0) or 0),
                longitude=float(item.get("LongitudeMeasure", 0) or 0),
                managed_by="EPA"
            )
            db.add(station)
            db.commit()
            db.refresh(station)

        value = item.get("ResultMeasureValue")
        if not value:
            continue

        reading = StationReading(
            station_id=station.id,
            parameter=parameter,
            value=float(value),
            recorded_at=datetime.utcnow()
        )

        db.add(reading)
        db.commit()
        db.refresh(reading)

        saved_readings.append(reading)

    return {
        "message": "EPA data fetched and stored",
        "saved_readings": saved_readings
    }


# -------------------------------------------------
# Get All Stations
# -------------------------------------------------
@router.get("/stations", response_model=List[WaterStationOut])
def get_all_stations(db: Session = Depends(get_db)):
    return db.query(WaterStation).all()


# -------------------------------------------------
# Get Single Station
# -------------------------------------------------
@router.get("/stations/{station_id}", response_model=WaterStationOut)
def get_station(station_id: int, db: Session = Depends(get_db)):
    station = db.query(WaterStation).filter(
        WaterStation.id == station_id
    ).first()

    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    return station


# -------------------------------------------------
# Get All Readings
# -------------------------------------------------
@router.get("/readings", response_model=List[StationReadingOut])
def get_all_readings(db: Session = Depends(get_db)):
    return db.query(StationReading).all()


# -------------------------------------------------
# Stations with Latest Reading (Map Endpoint)
# -------------------------------------------------
@router.get("/stations/latest", response_model=List[StationWithLatestReading])
def get_stations_with_latest_readings(db: Session = Depends(get_db)):

    stations = db.query(WaterStation).all()
    result = []

    for station in stations:

        latest = (
            db.query(StationReading)
            .filter(StationReading.station_id == station.id)
            .order_by(desc(StationReading.recorded_at))
            .first()
        )

        status = "unknown"
        if latest:
            status = get_safety_status(latest.parameter, latest.value)

        result.append({
            "station": station,
            "latest_reading": latest,
            "safety_status": status
        })

    return result
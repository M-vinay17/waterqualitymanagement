from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime
from app.services.ws_manager import manager as ws_manager
from app.services.predictive_engine import analyse_station




from app.core.database import get_db
from app.core.security import get_current_user

from app.models.water_station import WaterStation
from app.models.station_readings import StationReading
from app.models.water_reading import WaterReading
from app.models.user import User

from app.schemas.water import (
    WaterStationCreate,
    WaterStationOut,
    StationReadingCreate,
    StationReadingOut,
    StationWithLatestReading,
    WaterReadingCreate,
    WaterReadingResponse
)

from app.services.india_gov_service import (
    get_india_stations,
    get_india_readings,
    check_india_gov_status
)

router = APIRouter(prefix="/water", tags=["Water"])


# ---------------------------------------------------------
# Safety Status Logic
# ---------------------------------------------------------

def get_safety_status(parameter: str, value: float) -> str:

    SAFE_RANGES = {
        "ph":             (6.5,  8.5,   7.0,  8.0),
        "turbidity":      (0,    4.0,   0,    1.0),
        "do":             (6.0,  14.0,  8.0,  12.0),
        "lead":           (0,    0.01,  0,    0.005),
        "arsenic":        (0,    0.01,  0,    0.005),
        "iron":           (0,    0.3,   0,    0.1),
        "nitrate":        (0,    10.0,  0,    5.0),
        "temperature":    (5,    35.0,  10,   30.0),
        "tds":            (0,    500,   0,    300),
        "fluoride":       (0,    1.5,   0,    1.0),
        "manganese":      (0,    0.05,  0,    0.02),
        "chlorine":       (0.2,  4.0,   0.5,  2.0),
        "bod":            (0,    3.0,   0,    1.5),
        "total_coliform": (0,    50.0,  0,    10.0),
        "conductivity":   (0,    1500,  0,    800),
    }

    key = parameter.lower()

    if key not in SAFE_RANGES:
        return "unknown"

    safe_min, safe_max, ideal_min, ideal_max = SAFE_RANGES[key]

    if value < safe_min or value > safe_max:
        return "red"
    elif value < ideal_min or value > ideal_max:
        return "yellow"

    return "green"


# ---------------------------------------------------------
# CREATE WATER STATION
# ---------------------------------------------------------

@router.post("/stations", response_model=WaterStationOut, status_code=201)
def create_station(
    station: WaterStationCreate,
    db: Session = Depends(get_db)
):
    db_station = WaterStation(**station.model_dump())

    db.add(db_station)
    db.commit()
    db.refresh(db_station)

    return db_station


# ---------------------------------------------------------
# CREATE STATION READING
# ---------------------------------------------------------

@router.post("/readings", response_model=StationReadingOut, status_code=201)
async def create_reading(                         # ← def → async def
    reading: StationReadingCreate,
    background_tasks: BackgroundTasks,            # ← new parameter
    db: Session = Depends(get_db)
):
    station = db.query(WaterStation).filter(
        WaterStation.id == reading.station_id
    ).first()

    if not station:
        raise HTTPException(404, "Station not found")

    db_reading = StationReading(**reading.model_dump())
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)

   
    background_tasks.add_task(
        run_engine_and_broadcast,
        reading.station_id,
        db
    )

    return db_reading


# ---------------------------------------------------------
# GET ALL STATIONS
# ---------------------------------------------------------

@router.get("/stations", response_model=List[WaterStationOut])
def get_all_stations(db: Session = Depends(get_db)):
    return db.query(WaterStation).all()


# ---------------------------------------------------------
# GET ALL READINGS
# ---------------------------------------------------------

@router.get("/readings", response_model=List[StationReadingOut])
def get_all_readings(db: Session = Depends(get_db)):
    return db.query(StationReading).all()


# ---------------------------------------------------------
# STATIONS WITH LATEST READING
# ---------------------------------------------------------

@router.get("/stations/latest", response_model=List[StationWithLatestReading])
def get_stations_with_latest_readings(db: Session = Depends(get_db)):

    stations = db.query(WaterStation).all()
    result   = []

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
            "station":        station,
            "latest_reading": latest,
            "safety_status":  status
        })

    return result


# ---------------------------------------------------------
# SIMPLE WATER READING
# ---------------------------------------------------------

@router.post("/", response_model=WaterReadingResponse)
def add_reading(reading: WaterReadingCreate, db: Session = Depends(get_db)):
    new_reading = WaterReading(**reading.model_dump())
    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)
    return new_reading


@router.get("/", response_model=list[WaterReadingResponse])
def get_simple_readings(db: Session = Depends(get_db)):
    return db.query(WaterReading).all()


# =========================================================
# INDIA GOV — LIST STATIONS
# =========================================================

@router.get("/india/stations")
async def fetch_india_stations(
    state: str = "State name",
    limit: int = 100
):
    """
    Fetch water monitoring stations from data.gov.in.
    Filter by state.

    Examples:
      ?state=Andhra Pradesh
      ?state=Telangana
    """
    stations = await get_india_stations(
        state=state,
        limit=limit
    )

    return {
        "source":   "INDIA_GOV",
        "state":    state,
        "count":    len(stations),
        "stations": stations
    }


# =========================================================
# INDIA GOV — LIST READINGS
# =========================================================

@router.get("/india/readings")
async def fetch_india_readings(
    state: str = "State name",
    limit: int = 100
):
    """
    Fetch water quality readings from data.gov.in.
    Filter by state.
    """
    readings = await get_india_readings(
        state=state,
        limit=limit
    )

    return {
        "source":   "INDIA_GOV",
        "state":    state,
        "count":    len(readings),
        "readings": readings
    }


# =========================================================
# INDIA GOV — FETCH AND SAVE TO DATABASE
# =========================================================

@router.get("/fetch-india")
async def fetch_and_store_india_data(
    state: str  = "Andhra Pradesh",
    db: Session = Depends(get_db)
):
    """
    Fetch water quality data from data.gov.in
    and save to PostgreSQL database.

    Each parameter (ph, do, bod ...) saved as
    separate StationReading row.
    """
    readings = await get_india_readings(
        state=state,
        limit=100
    )

    if not readings:
        return {"message": f"No data found for {state}"}

    saved = []

    for r in readings:

        # Upsert WaterStation
        station = db.query(WaterStation).filter(
            WaterStation.external_id     == r["external_id"],
            WaterStation.external_source == "india_gov"
        ).first()

        if not station:
            station = WaterStation(
                name=r["name"],
                location=r["location"],
                latitude=r["latitude"],
                longitude=r["longitude"],
                managed_by=r["managed_by"],
                external_id=r["external_id"],
                external_source=r["external_source"]
            )
            db.add(station)
            db.commit()
            db.refresh(station)

        # Save one StationReading row per parameter
        for param_name, param_info in r["parameters"].items():

            if param_info["value"] is None:
                continue

            reading = StationReading(
                station_id=station.id,
                parameter=param_name,
                value=param_info["value"],
                unit=param_info.get("unit", ""),
                recorded_at=r["recorded_at"],
                source="india_gov",
                quality_flag="good"
            )
            db.add(reading)
            saved.append(param_name)

    db.commit()

    return {
        "message":        "Data saved successfully",
        "state":          state,
        "readings_saved": len(saved)
    }


# =========================================================
# INDIA GOV — API STATUS CHECK
# =========================================================

@router.get("/india/status")
async def check_india_api_status():
    """
    Check if data.gov.in API is online.
    """
    status = await check_india_gov_status()
    return {
        "checked_at": datetime.utcnow().isoformat(),
        "api": status
    }

    # =========================================================
# DEBUG — RAW FIELD NAMES
# =========================================================

@router.get("/india/debug")
async def debug_raw_fields(state: str = "Andhra Pradesh"):
    """Returns first raw record to see actual API field names"""
    from app.services.india_gov_service import _fetch_raw
    raw = await _fetch_raw(state=state, limit=1)
    if not raw or not raw.get("records"):
        return {"error": "no records", "raw": raw}
    return {
        "field_names": list(raw["records"][0].keys()),
        "sample_record": raw["records"][0]
    }

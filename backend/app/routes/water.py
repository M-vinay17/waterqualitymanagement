from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime
import asyncio

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

# External services
from app.services.epa_service import (
    get_epa_stations,
    get_epa_readings,
    check_epa_status
)
from app.services.usgs_service import (
    get_usgs_stations,
    get_usgs_readings,
    get_usgs_daily_values,
    check_usgs_status
)
from app.services.who_service import (
    get_who_country_stats,
    get_who_global_indicator,
    list_who_water_indicators,
    check_who_status
)
from app.services.india_gov_service import (   # ← NEW
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
        "bod":            (0,    3.0,   0,    1.5),           # ← NEW
        "total_coliform": (0,    50.0,  0,    10.0),          # ← NEW
        "conductivity":   (0,    1500,  0,    800),           # ← NEW
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["admin", "authority"]:
        raise HTTPException(403, "Only admin or authority can create stations")

    db_station = WaterStation(**station.model_dump())
    db.add(db_station)
    db.commit()
    db.refresh(db_station)
    return db_station


# ---------------------------------------------------------
# CREATE STATION READING
# ---------------------------------------------------------

@router.post("/readings", response_model=StationReadingOut, status_code=201)
def create_reading(
    reading: StationReadingCreate,
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
# EPA ROUTES
# =========================================================

@router.get("/fetch-epa")
async def fetch_and_store_epa_data(
    state: str,
    parameter: str,
    db: Session = Depends(get_db)
):
    state_code = f"US:{state}" if not state.startswith("US:") else state
    stations   = await get_epa_stations(state_code=state_code, limit=10)

    if not stations:
        return {"message": "No EPA stations found"}

    site_id      = None
    readings     = []
    station_data = None

    for s in stations:
        sid      = s["external_id"]
        readings = await get_epa_readings(site_id=sid, parameter=parameter)
        if readings:
            site_id      = sid
            station_data = s
            break

    if not readings:
        return {"message": "No EPA readings found for these stations"}

    station = db.query(WaterStation).filter(
        WaterStation.external_id     == site_id,
        WaterStation.external_source == "epa"
    ).first()

    if not station:
        station = WaterStation(
            name=station_data["name"],
            location=station_data["location"],
            latitude=station_data["latitude"],
            longitude=station_data["longitude"],
            managed_by="US EPA",
            external_id=site_id,
            external_source="epa"
        )
        db.add(station)
        db.commit()
        db.refresh(station)

    saved = []
    for r in readings[:5]:
        reading = StationReading(
            station_id=station.id,
            parameter=r["parameter"],
            value=r["value"],
            unit=r.get("unit", ""),
            recorded_at=r["recorded_at"],
            source="epa",
            quality_flag=r.get("quality_flag", "good")
        )
        db.add(reading)
        saved.append(reading)

    db.commit()

    return {
        "message":        "EPA data fetched successfully",
        "station_id":     site_id,
        "readings_saved": len(saved)
    }


@router.get("/epa/stations")
async def fetch_epa_stations(state_code: str = "US:06", limit: int = 30):
    stations = await get_epa_stations(state_code=state_code, limit=limit)
    return {"source": "EPA", "count": len(stations), "stations": stations}


# =========================================================
# USGS ROUTES
# =========================================================

@router.get("/usgs/stations")
async def fetch_usgs_stations(state_code: str = "NY", limit: int = 30):
    stations = await get_usgs_stations(state_code=state_code, limit=limit)
    return {"source": "USGS", "count": len(stations), "stations": stations}


@router.get("/usgs/readings/{site_id}")
async def fetch_usgs_readings(
    site_id: str,
    parameter: str = None,
    days_back: int = 7
):
    readings = await get_usgs_readings(
        site_id=site_id, parameter=parameter, days_back=days_back
    )
    return {"source": "USGS", "site_id": site_id, "count": len(readings), "readings": readings}


# =========================================================
# WHO ROUTES
# =========================================================

@router.get("/who/country/{country_code}")
async def fetch_who_country_stats(country_code: str = "IND"):
    return await get_who_country_stats(country_code.upper())


@router.get("/who/global")
async def fetch_who_global_data(
    indicator: str = "WSH_WATER_SAFELY_MANAGED",
    year: int = None,
    limit: int = 200
):
    data = await get_who_global_indicator(
        indicator_code=indicator, year=year, limit=limit
    )
    return {"source": "WHO", "indicator": indicator, "count": len(data), "data": data}


# =========================================================
# INDIA GOV ROUTES  ← NEW
# Dataset : Agency-wise Surface Water Quality (CPCB)
# =========================================================

@router.get("/india/stations")
async def fetch_india_stations(
    state: str = "Andhra Pradesh",
    limit: int = 30
):
    """
    List water monitoring stations from data.gov.in.
    Default state: Andhra Pradesh
    """
    stations = await get_india_stations(state=state, limit=limit)
    return {
        "source": "INDIA_GOV",
        "state":  state,
        "count":  len(stations),
        "stations": stations
    }


@router.get("/india/readings")
async def fetch_india_readings(
    state: str = "Andhra Pradesh",
    limit: int = 50
):
    """
    List raw readings from data.gov.in.
    Default state: Andhra Pradesh
    """
    readings = await get_india_readings(state=state, limit=limit)
    return {
        "source":   "INDIA_GOV",
        "state":    state,
        "count":    len(readings),
        "readings": readings
    }


@router.get("/fetch-india")
async def fetch_and_store_india_data(
    state: str = "Andhra Pradesh",
    db: Session = Depends(get_db)
):
    """
    Fetch data.gov.in water quality data and save to PostgreSQL.
    Follows same pattern as /fetch-epa.

    Each reading parameter (ph, do, bod ...) is saved as a
    separate StationReading row — matching your parameter/value/unit model.
    """
    readings = await get_india_readings(state=state, limit=100)

    if not readings:
        return {"message": f"No India Gov data found for: {state}"}

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
        # Skips parameters with None value
        for param_name, param_info in r["parameters"].items():

            if param_info["value"] is None:
                continue

            reading = StationReading(
                station_id=station.id,
                parameter=param_name,               # e.g. "ph"
                value=param_info["value"],           # e.g. 7.2
                unit=param_info.get("unit", ""),     # e.g. ""
                recorded_at=r["recorded_at"],
                source="india_gov",
                quality_flag="good"
            )
            db.add(reading)
            saved.append(param_name)

    db.commit()

    return {
        "message":        "India Gov data fetched and saved successfully",
        "state":          state,
        "readings_saved": len(saved)
    }


# =========================================================
# EXTERNAL API STATUS
# =========================================================

@router.get("/external/status")
async def check_all_api_status():

    epa, usgs, who, india = await asyncio.gather(
        check_epa_status(),
        check_usgs_status(),
        check_who_status(),
        check_india_gov_status()    # ← NEW
    )

    return {
        "checked_at": datetime.utcnow().isoformat(),
        "apis": [epa, usgs, who, india]
    }
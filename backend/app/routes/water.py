from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.water_reading import WaterReading
from app.schemas.water import WaterReadingCreate, WaterReadingResponse

router = APIRouter(
    prefix="/water",
    tags=["Water Readings"]
)


# Add new water reading
@router.post("/", response_model=WaterReadingResponse)
def add_reading(reading: WaterReadingCreate, db: Session = Depends(get_db)):

    new_reading = WaterReading(**reading.model_dump())

    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)

    return new_reading


# Get all readings
@router.get("/", response_model=list[WaterReadingResponse])
def get_all_readings(db: Session = Depends(get_db)):

    return db.query(WaterReading).all()


# Get readings by station
@router.get("/station/{station_name}", response_model=list[WaterReadingResponse])
def get_station_readings(station_name: str, db: Session = Depends(get_db)):

    readings = db.query(WaterReading).filter(
        WaterReading.station_name == station_name
    ).all()

    return readings


# Latest reading of a station
@router.get("/latest/{station_name}", response_model=WaterReadingResponse)
def get_latest_reading(station_name: str, db: Session = Depends(get_db)):

    reading = db.query(WaterReading).filter(
        WaterReading.station_name == station_name
    ).order_by(WaterReading.id.desc()).first()

    return reading
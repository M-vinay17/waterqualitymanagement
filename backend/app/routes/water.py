from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.water_reading import WaterReading
from app.schemas.water import WaterReadingCreate, WaterReadingResponse

router = APIRouter(
    prefix="/water",
    tags=["Water Readings"]
)

@router.post("/")
def add_reading(reading: WaterReadingCreate, db: Session = Depends(get_db)):

    new_reading = WaterReading(**reading.model_dump())

    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)

    return new_reading


@router.get("/", response_model=list[WaterReadingResponse])
def get_all_readings(db: Session = Depends(get_db)):
    return db.query(WaterReading).all()
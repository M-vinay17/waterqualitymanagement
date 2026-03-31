from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.water_reading import WaterReading   # ✅ USE THIS

router = APIRouter(
    prefix="/api/v1/stations/readings",
    tags=["Readings"]
)

WHO_THRESHOLDS = {
    "ph": [6.5, 8.5],
    "turbidity": 5,
    "dissolved_oxygen": 5,
    "arsenic": 0.01
}


@router.get("/aggregate")
def get_aggregate_readings(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    start_date = datetime.utcnow() - timedelta(days=days)

    day = func.date_trunc("day", WaterReading.recorded_at)

    def aggregate_param(column):
        results = (
            db.query(
                day.label("date"),
                func.avg(column).label("avg_value")
            )
            .filter(WaterReading.recorded_at >= start_date)
            .group_by(day)
            .order_by(day)
            .all()
        )

        return [
            {
                "date": r.date.strftime("%Y-%m-%d"),
                "avg_value": float(r.avg_value) if r.avg_value else 0
            }
            for r in results
        ]

    return {
        "ph": aggregate_param(WaterReading.ph),
        "turbidity": aggregate_param(WaterReading.turbidity),
        "dissolved_oxygen": aggregate_param(WaterReading.dissolved_oxygen),
        "arsenic": aggregate_param(WaterReading.arsenic),
        "who_threshold": WHO_THRESHOLDS
    }
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.predictive_engine import analyse_station
from app.models.alert import Alert
from app.models.water_station import WaterStation
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/alerts/predictive/generate")
def generate_predictive_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["authority", "admin"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")

    stations = db.query(WaterStation).all()
    generated = 0
    skipped = 0

    for station in stations:
        results = analyse_station(station.id, db)
        for alert_data in results:
            # 24h dedup check
            existing = db.query(Alert).filter(
                Alert.station_id == station.id,
                Alert.parameter == alert_data["parameter"],
                Alert.source == "predictive",
                Alert.issued_at >= datetime.utcnow() - timedelta(hours=24)
            ).first()

            if existing:
                skipped += 1
                continue

            new_alert = Alert(
                station_id=station.id,
                parameter=alert_data["parameter"],
                rule_triggered=alert_data["rule_triggered"],
                message=alert_data["alert_message"],
                source="predictive",
                issued_at=datetime.utcnow()
            )
            db.add(new_alert)
            generated += 1

    db.commit()
    return {"generated": generated, "skipped": skipped}


@router.get("/alerts/predictive")
def get_predictive_alerts(
    location: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Alert).filter(Alert.source == "predictive")

    if location:
        query = query.filter(Alert.location.ilike(f"%{location}%"))

    alerts = query.order_by(Alert.issued_at.desc()).limit(10).all()
    return alerts
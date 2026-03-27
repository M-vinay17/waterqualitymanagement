# app/services/predictive_engine.py

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import StationReading

WHO_THRESHOLDS = {
    "turbidity": {"max": 4.0},
    "do":        {"min": 6.0},
    "lead":      {"max": 0.01},
    "arsenic":   {"max": 0.01},
    "ph":        {"min": 6.5, "max": 8.5},  # range, not a single bound
}

def analyse_station(station_id: int, db: Session) -> list[dict]:
    alerts = []
    since = datetime.utcnow() - timedelta(days=7)

    for parameter, thresholds in WHO_THRESHOLDS.items():
        readings = (
            db.query(StationReading)
            .filter(
                StationReading.station_id == station_id,
                StationReading.parameter == parameter,
                StationReading.recorded_at >= since,
            )
            .order_by(StationReading.recorded_at.desc())
            .all()
        )

        if len(readings) < 3:
            continue  # not enough data — skip

        values = [r.value for r in readings]
        avg = sum(values) / len(values)
        last_3 = values[:3]  # already desc order → most recent 3

        rule = _check_rules(parameter, avg, last_3, thresholds)

        if rule:
            alerts.append({
                "station_id": station_id,
                "parameter": parameter,
                "rule_triggered": rule,
                "current_avg": round(avg, 4),
                "threshold": thresholds,
                "alert_message": _build_message(parameter, rule, avg, thresholds),
            })

    return alerts
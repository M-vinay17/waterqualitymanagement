# app/services/predictive_engine.py

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.station_readings import StationReading

# WHO safe thresholds
WHO_THRESHOLDS = {
    "turbidity": {"max": 4.0},
    "do":        {"min": 6.0},
    "lead":      {"max": 0.01},
    "arsenic":   {"max": 0.01},
    "ph":        {"min": 6.5, "max": 8.5},
}


# ---------------------------------------------------------
# MAIN ANALYSIS FUNCTION
# ---------------------------------------------------------
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
            continue  # not enough data

        values = [r.value for r in readings]
        avg = sum(values) / len(values)
        last_3 = values[:3]

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


# ---------------------------------------------------------
# RULE ENGINE
# ---------------------------------------------------------
def _check_rules(parameter, avg, last_3, thresholds):

    # MAX limit breach
    if "max" in thresholds and avg > thresholds["max"]:
        return "exceeds_max"

    # MIN limit breach
    if "min" in thresholds and avg < thresholds["min"]:
        return "below_min"

    # Range violation (for pH etc)
    if "min" in thresholds and "max" in thresholds:
        if avg < thresholds["min"] or avg > thresholds["max"]:
            return "out_of_range"

    # Increasing trend
    if len(last_3) >= 3:
        if last_3[0] > last_3[1] > last_3[2]:
            return "increasing_trend"

    # Decreasing trend
    if len(last_3) >= 3:
        if last_3[0] < last_3[1] < last_3[2]:
            return "decreasing_trend"

    return None


# ---------------------------------------------------------
# ALERT MESSAGE BUILDER
# ---------------------------------------------------------
def _build_message(parameter, rule, avg, thresholds):

    if rule == "exceeds_max":
        return f"{parameter.upper()} exceeds safe limit! Avg={avg}, Max={thresholds.get('max')}"

    if rule == "below_min":
        return f"{parameter.upper()} below safe level! Avg={avg}, Min={thresholds.get('min')}"

    if rule == "out_of_range":
        return f"{parameter.upper()} out of safe range! Avg={avg}"

    if rule == "increasing_trend":
        return f"{parameter.upper()} increasing rapidly. Check water quality!"

    if rule == "decreasing_trend":
        return f"{parameter.upper()} decreasing trend detected."

    return "Unknown water quality alert"
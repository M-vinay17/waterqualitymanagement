from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.dependencies.role_guard import require_role
from app.models.alert import Alert, AlertSource, AlertType
from app.models.user import User
from app.schemas.alert import AlertCreate, AlertOut
from app.services.predictive_engine import analyse_station
from app.services.ws_manager import manager

router = APIRouter()


# ─────────────────────────────────────────────
# WebSocket — B2-4
# ─────────────────────────────────────────────

@router.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ─────────────────────────────────────────────
# Helper — broadcast alert to all WS clients
# ─────────────────────────────────────────────

async def broadcast_alert(alert: Alert):
    await manager.broadcast({
        "type": "new_alert",
        "payload": {
            "id":         alert.id,
            "type":       alert.type,
            "message":    alert.message,
            "location":   alert.location,
            "issued_at":  alert.issued_at.isoformat(),
            "source":     alert.source,
            "station_id": alert.station_id,
            "parameter":  alert.parameter,
        }
    })


# ─────────────────────────────────────────────
# POST /alerts — create manual alert  (existing)
# ─────────────────────────────────────────────

@router.post("/", response_model=AlertOut)
async def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_alert = Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)

    # broadcast to WebSocket clients
    await broadcast_alert(db_alert)

    return db_alert


# ─────────────────────────────────────────────
# GET /alerts — list all alerts  (existing)
# ─────────────────────────────────────────────

@router.get("/", response_model=list[AlertOut])
def get_alerts(
    active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Alert)
    # active param: no "resolved" column in model, so return all by default
    return query.order_by(Alert.issued_at.desc()).all()


# ─────────────────────────────────────────────
# GET /alerts/latest — polling fallback for FE-3
# ─────────────────────────────────────────────

@router.get("/latest", response_model=list[AlertOut])
def get_latest_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Alert)
        .order_by(Alert.issued_at.desc())
        .limit(10)
        .all()
    )


# ─────────────────────────────────────────────
# GET /alerts/predictive — B2-3
# ─────────────────────────────────────────────

@router.get("/predictive", response_model=list[AlertOut])
def get_predictive_alerts(
    location: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts = (
        db.query(Alert)
        .filter(
            Alert.source == AlertSource.predictive,
            Alert.location.ilike(f"%{location}%"),
        )
        .order_by(Alert.issued_at.desc())
        .limit(10)
        .all()
    )
    return alerts


# ─────────────────────────────────────────────
# POST /alerts/predictive/generate — B2-2
# ─────────────────────────────────────────────

@router.post("/predictive/generate")
async def generate_predictive_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("authority", "admin")),
):
    from app.models.station import WaterStation  # local import to avoid circular

    stations  = db.query(WaterStation).all()
    generated = 0
    skipped   = 0

    for station in stations:
        results = analyse_station(station.id, db)

        for r in results:
            # Deduplication — skip if same station+parameter alerted within 24 h
            existing = (
                db.query(Alert)
                .filter(
                    Alert.station_id == r["station_id"],
                    Alert.parameter  == r["parameter"],
                    Alert.source     == AlertSource.predictive,
                    Alert.issued_at  >= datetime.utcnow() - timedelta(hours=24),
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            db_alert = Alert(
                type       = AlertType.predictive,
                message    = r["alert_message"],
                location   = station.location,   # adjust field name if different
                source     = AlertSource.predictive,
                station_id = r["station_id"],
                parameter  = r["parameter"],
                issued_at  = datetime.utcnow(),
            )
            db.add(db_alert)
            db.commit()
            db.refresh(db_alert)

            generated += 1

            # broadcast to WebSocket clients
            await broadcast_alert(db_alert)

    return {"generated": generated, "skipped": skipped}


# ─────────────────────────────────────────────
# Background task — called from readings endpoint (B2-5)
# ─────────────────────────────────────────────

async def run_predictive_check(station_id: int, station_location: str, db: Session):
    """
    Fire-and-forget task — called from POST /stations/readings.
    Runs predictive engine for the station and broadcasts any new alerts.
    """
    results = analyse_station(station_id, db)

    for r in results:
        # Deduplication
        existing = (
            db.query(Alert)
            .filter(
                Alert.station_id == r["station_id"],
                Alert.parameter  == r["parameter"],
                Alert.source     == AlertSource.predictive,
                Alert.issued_at  >= datetime.utcnow() - timedelta(hours=24),
            )
            .first()
        )
        if existing:
            continue

        db_alert = Alert(
            type       = AlertType.predictive,
            message    = r["alert_message"],
            location   = station_location,
            source     = AlertSource.predictive,
            station_id = r["station_id"],
            parameter  = r["parameter"],
            issued_at  = datetime.utcnow(),
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)

        await broadcast_alert(db_alert)


# ─────────────────────────────────────────────
# GET /alerts/{alert_id}  (existing)
# ─────────────────────────────────────────────

@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


# ─────────────────────────────────────────────
# PUT /alerts/{alert_id}  (existing)
# ─────────────────────────────────────────────

@router.put("/{alert_id}", response_model=AlertOut)
def update_alert(
    alert_id: int,
    alert: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    for key, value in alert.model_dump().items():
        setattr(db_alert, key, value)

    db.commit()
    db.refresh(db_alert)
    return db_alert


# ─────────────────────────────────────────────
# DELETE /alerts/{alert_id}  (existing)
# ─────────────────────────────────────────────

@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    db.delete(db_alert)
    db.commit()
    return {"message": "Alert deleted"}
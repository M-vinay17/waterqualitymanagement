from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from datetime import datetime
import enum

from app.core.database import Base


class AlertType(str, enum.Enum):
    boil_notice   = "boil_notice"
    contamination = "contamination"
    outage        = "outage"
    predictive    = "predictive"    # ← new: for predictive alerts


class AlertSource(str, enum.Enum):          # ← new enum
    manual     = "manual"
    predictive = "predictive"


class Alert(Base):
    __tablename__ = "alerts"

    id         = Column(Integer, primary_key=True, index=True)
    type       = Column(Enum(AlertType), nullable=False)
    message    = Column(Text, nullable=False)
    location   = Column(String, nullable=False)
    issued_at  = Column(DateTime, default=datetime.utcnow)

    # ── new columns ────────────────────────────────────────────
    source     = Column(
                    Enum(AlertSource),
                    nullable=False,
                    default=AlertSource.manual,
                    server_default="manual"   # safe for existing rows
                 )
    station_id = Column(Integer, ForeignKey("water_stations.id"), nullable=True)
    parameter  = Column(String, nullable=True)   # e.g. "ph", "turbidity"
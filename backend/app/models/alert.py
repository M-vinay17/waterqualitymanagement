from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from datetime import datetime
import enum

from app.core.database import Base


class AlertType(str, enum.Enum):
    boil_notice = "boil_notice"
    contamination = "contamination"
    outage = "outage"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(AlertType), nullable=False)
    message = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.core.database import Base


class Collaboration(Base):
    __tablename__ = "collaborations"

    id            = Column(Integer, primary_key=True, index=True)
    ngo_name      = Column(String, nullable=False)
    project_name  = Column(String, nullable=False)
    contact_email = Column(String, nullable=False)

    ngo_user_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    station_id    = Column(Integer, ForeignKey("water_stations.id"), nullable=True)

    status        = Column(String, default="active")  # active / inactive

    created_at    = Column(DateTime, default=datetime.utcnow)
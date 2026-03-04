from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime

class StationReading(Base):
    __tablename__ = "station_readings"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("water_stations.id", ondelete="CASCADE"), nullable=False)
    parameter = Column(String, nullable=False)          # e.g. "pH", "turbidity", "DO"
    value = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
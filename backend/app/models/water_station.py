from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base
from datetime import datetime

class WaterStation(Base):           # ← singular name is more common
    __tablename__ = "water_stations"  # ← snake_case is standard

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)  # e.g. "Chennai, Tamil Nadu"
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    managed_by = Column(String, nullable=False)  # e.g. "CPCB", "NGO XYZ"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
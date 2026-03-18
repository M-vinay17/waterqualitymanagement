from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base
from datetime import datetime


class WaterStation(Base):

    __tablename__ = "water_stations"

    id = Column(Integer, primary_key=True, index=True)

    name     = Column(String, nullable=False)
    location = Column(String, nullable=False)

    latitude  = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    managed_by = Column(String, nullable=False)

    # External API integration
    external_id     = Column(String, nullable=True)
    external_source = Column(String, nullable=True)

    # ✅ CPCB / india_gov_service fields
    state    = Column(String, nullable=True)
    district = Column(String, nullable=True)
    river    = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
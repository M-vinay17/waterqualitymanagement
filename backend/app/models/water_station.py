from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base


class WaterStation(Base):

    __tablename__ = "water_stations"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    location = Column(String, nullable=False)

    latitude = Column(Numeric, nullable=False)

    longitude = Column(Numeric, nullable=False)

    managed_by = Column(String, nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
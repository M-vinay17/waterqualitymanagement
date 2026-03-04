from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class WaterReading(Base):
    __tablename__ = "water_readings"

    id = Column(Integer, primary_key=True, index=True)

    station_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    ph = Column(Float, nullable=False)
    turbidity = Column(Float, nullable=False)
    dissolved_oxygen = Column(Float, nullable=False)

    # NEW PARAMETERS (Milestone 2)
    temperature = Column(Float, nullable=True)
    arsenic = Column(Float, nullable=True)
    iron = Column(Float, nullable=True)
    ecoli = Column(Float, nullable=True)

    status = Column(String, nullable=False)

    # NEW FIELD
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
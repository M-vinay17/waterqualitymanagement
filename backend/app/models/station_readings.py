from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime


class StationReading(Base):

    __tablename__ = "station_readings"

    id = Column(Integer, primary_key=True, index=True)

    station_id = Column(
        Integer,
        ForeignKey("water_stations.id", ondelete="CASCADE"),
        nullable=False
    )

    parameter = Column(String, nullable=False)   # pH, turbidity, DO etc
    value = Column(Float, nullable=False)

    unit = Column(String, nullable=True)         # mg/L, NTU etc

    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    source = Column(String, default="local")     # local / epa / usgs

    quality_flag = Column(String, nullable=True) # good / suspect / bad
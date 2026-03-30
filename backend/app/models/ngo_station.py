from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base


class NGOStation(Base):

    __tablename__ = "ngo_stations"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    latitude = Column(Float, nullable=False)

    longitude = Column(Float, nullable=False)

    managed_by = Column(String, nullable=False)

    description = Column(String)

    contact = Column(String)

    
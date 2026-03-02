from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func

from app.core.database import Base


class Report(Base):

    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    photo_url = Column(String)

    location = Column(String, nullable=False)

    description = Column(Text, nullable=False)

    water_source = Column(String, nullable=False)

    status = Column(String, default="pending")

    created_at = Column(TIMESTAMP, server_default=func.now())
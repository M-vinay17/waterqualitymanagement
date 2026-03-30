from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func

from app.core.database import Base


class Collaboration(Base):

    __tablename__ = "collaborations"

    id = Column(Integer, primary_key=True, index=True)

    project_name = Column(String, nullable=False)

    ngo_name = Column(String, nullable=False)

    contact_email = Column(String, nullable=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
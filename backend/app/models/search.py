from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Search(Base):

    __tablename__ = "searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    parameter = Column(String)
    value = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
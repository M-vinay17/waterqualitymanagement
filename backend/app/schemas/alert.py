from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class AlertType(str, Enum):
    boil_notice = "boil_notice"
    contamination = "contamination"
    outage = "outage"


class AlertCreate(BaseModel):
    type: AlertType
    message: str
    location: str


class AlertOut(BaseModel):
    id: int
    type: AlertType
    message: str
    location: str
    issued_at: datetime

    class Config:
        orm_mode = True
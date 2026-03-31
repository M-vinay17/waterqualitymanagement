from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class AlertType(str, Enum):
    boil_notice   = "boil_notice"
    contamination = "contamination"
    outage        = "outage"
    predictive    = "predictive"       # ← new


class AlertSource(str, Enum):          # ← new
    manual     = "manual"
    predictive = "predictive"


class AlertCreate(BaseModel):
    type:       AlertType
    message:    str
    location:   str
    station_id: int | None = None      # ← new, optional for manual alerts
    parameter:  str | None = None      # ← new, optional for manual alerts
    source:     AlertSource = AlertSource.manual   # ← new, defaults to manual


class AlertOut(BaseModel):
    id:         int
    type:       AlertType
    message:    str
    location:   str
    issued_at:  datetime
    source:     AlertSource            # ← new
    station_id: int | None = None      # ← new
    parameter:  str | None = None      # ← new

    class Config:
        from_attributes = True
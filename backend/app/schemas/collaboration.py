from pydantic import BaseModel, EmailStr
from datetime import datetime


class CollaborationCreate(BaseModel):
    ngo_name: str
    project_name: str
    contact_email: EmailStr
    station_id: int  


class CollaborationUpdate(BaseModel):
    ngo_name: str | None = None
    project_name: str | None = None
    contact_email: EmailStr | None = None
    status: str | None = None


class CollaborationOut(BaseModel):
    id: int
    ngo_name: str
    project_name: str
    contact_email: EmailStr
    status: str
    created_at: datetime
    report_count: int

    class Config:
        from_attributes = True
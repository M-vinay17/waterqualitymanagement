from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class CollaborationCreate(BaseModel):
    """Schema for creating a new collaboration"""
    ngo_name: str
    project_name: str
    contact_email: EmailStr
    station_id: Optional[int] = None   # ✅ Optional — FE form lo lekapothe 422 vastundi


class CollaborationUpdate(BaseModel):
    """Schema for updating an existing collaboration"""
    ngo_name: Optional[str] = None
    project_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    status: Optional[str] = None   # e.g., "active", "inactive"


class CollaborationOut(BaseModel):
    """Response schema for collaboration (used in GET endpoints)"""
    id: int
    ngo_name: str
    project_name: str
    contact_email: EmailStr
    station_id: Optional[int] = None   # ✅ Optional — DB lo null unte error raadu
    status: str
    created_at: datetime
    report_count: int

    class Config:
        from_attributes = True


class CollaborationResponse(BaseModel):
    """Simple response schema without extra computed fields"""
    id: int
    ngo_name: str
    project_name: str
    contact_email: str
    status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
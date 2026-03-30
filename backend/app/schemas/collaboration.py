from pydantic import BaseModel, EmailStr

class CollaborationCreate(BaseModel):
    project_name: str
    ngo_name: str
    contact_email: EmailStr


class CollaborationResponse(BaseModel):
    id: int
    project_name: str
    ngo_name: str
    contact_email: str

    class Config:
        from_attributes = True
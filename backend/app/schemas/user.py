from pydantic import BaseModel, EmailStr

# Used when creating a new user
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


# Used when updating user
class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    role: str


# Used when returning user data (response)
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True   # For Pydantic v2
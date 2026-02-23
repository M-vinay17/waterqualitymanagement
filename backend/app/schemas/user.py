from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "citizen"  # Optional, default citizen

class User(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True  # For ORM mode

class Token(BaseModel):
    access_token: str
    token_type: str
from pydantic import BaseModel, EmailStr


class UserRoleUpdate(BaseModel):
    role: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut        # ← THIS fixes the role issue


class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    role: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
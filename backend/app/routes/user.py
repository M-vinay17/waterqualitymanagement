# backend/app/routes/user.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Annotated

from app.core import security, database
from app.models.user import User
from app.schemas.user import UserCreate, User as UserOut, Token
from app.services.user import (
    create_user,
    get_user_by_email,
    authenticate_user,
)

router = APIRouter(tags=["users"])  # ← delete prefix="/users"

# OAuth2 scheme - this tells Swagger where to send login request
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


# Dependency to get current authenticated user
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(database.get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = security.jwt.decode(
            token,
            security.SECRET_KEY,
            algorithms=[security.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except security.JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    
    return user


@router.post("/register", response_model=UserOut)
def register(
    user: UserCreate,
    db: Session = Depends(database.get_db)
):
    """
    Register a new user
    """
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    return create_user(db, user)


@router.post("/login", response_model=Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(database.get_db)
):
    """
    Login and get JWT access token
    Use 'username' field = email
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Get current authenticated user info
    (Used in dashboard to show name & role)
    """
    return current_user


@router.post("/logout")
def logout():
    """
    Logout - mostly handled on frontend by removing token
    """
    return {"message": "Logged out successfully"}
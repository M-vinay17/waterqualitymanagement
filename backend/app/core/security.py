from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# These should move to .env later
SECRET_KEY = "your-super-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme - tells FastAPI where to find the login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")  # matches your login endpoint name

class TokenData(BaseModel):
    email: Optional[str] = None   # we use email as identifier (sub)

# Helper functions (from your old code)
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Create JWT token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Main dependency - gets current user from token
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    # db: Session = Depends(get_db)   ← uncomment when you connect to real DB
) -> dict:
    """
    This function:
    - Validates the JWT token
    - Extracts email
    - For now returns a fake/dummy user dict (with role)
    - Later: query real User from database using email
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    # Fake user for testing (replace with real DB query later)
    # Example: user = db.query(User).filter(User.email == token_data.email).first()
    fake_user = fake_get_user(email=token_data.email)

    if fake_user is None:
        raise credentials_exception

    return fake_user


# Fake user lookup - only for development/testing
# When you have real User model + DB → remove this and use DB query
def fake_get_user(email: str) -> Optional[dict]:
    # Simulate DB users (you can add more test users here)
    test_users = {
        "test@citizen.com": {"id": 1, "email": "test@citizen.com", "role": "citizen"},
        "test@authority.com": {"id": 2, "email": "test@authority.com", "role": "authority"},
        "admin@example.com": {"id": 3, "email": "admin@example.com", "role": "admin"},
    }
    return test_users.get(email)
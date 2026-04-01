from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.models.user import User
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    print("TYPE:", type(user.password))
    print("VALUE:", user.password)

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):

    # Step 1 — check if email exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials. Email or password is incorrect.")

    # Step 2 — email found, now verify password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Wrong password. Please try again.")

    # Step 3 — both correct, issue token
    token = create_access_token({"sub": db_user.email, "role": db_user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role
        }
    }
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.models.user import User
from app.core.database import get_db
from app.core.security import hash_password, get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ✅ GET CURRENT USER (JWT) — /me must be ABOVE /{user_id}
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ✅ CREATE USER
@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
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

    return new_user


# ✅ GET ALL USERS
@router.get("/", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# ✅ GET SINGLE USER — /{user_id} must be BELOW /me
@router.get("/{user_id}", response_model=UserResponse)
def get_single_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ✅ UPDATE USER
@router.put("/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name  = user_data.name
    user.email = user_data.email
    user.role  = user_data.role

    db.commit()

    return {"message": "User updated successfully"}


# ✅ DELETE USER
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}
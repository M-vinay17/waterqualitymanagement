from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserRoleUpdate
from app.models.user import User
from app.core.database import get_db
from app.core.security import hash_password, get_current_user
from app.dependencies.role_guard import require_role




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
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    users = (
        db.query(User)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return users

@router.get("/test-ngo")
def test_ngo(user=Depends(require_role("ngo", "admin"))):
    return {"message": "NGO/Admin access granted"}


@router.patch("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ❗ Prevent self-downgrade
    if user.id == current_user.id and data.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="Admin cannot downgrade their own role"
        )

    # Validate role
    allowed_roles = ["citizen", "ngo", "authority", "admin"]
    if data.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")

    user.role = data.role

    db.commit()
    db.refresh(user)

    return user


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


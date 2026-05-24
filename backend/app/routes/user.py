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

# ==================== PUBLIC / PROTECTED ROUTES ====================

# ✅ GET CURRENT USER
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ✅ DEBUG ROLE (Helpful for troubleshooting)
@router.get("/debug-role")
def debug_role(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_admin": current_user.role == "admin"
    }


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


# ✅ GET ALL USERS - IMPROVED (with search support)
@router.get("/", response_model=list[UserResponse])
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: str = Query(None, description="Search by name or email"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))   # Only Admin can access
):
    query = db.query(User)

    # Search functionality
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (User.name.ilike(search_term)) | 
            (User.email.ilike(search_term))
        )

    users = query.offset(skip).limit(limit).all()
    return users


# ✅ TEST NGO / ADMIN ACCESS
@router.get("/test-ngo")
def test_ngo(current_user: User = Depends(require_role("ngo", "admin"))):
    return {"message": "Access granted", "role": current_user.role}


# ✅ UPDATE USER ROLE (Only Admin)
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

    # Prevent self-downgrade
    if user.id == current_user.id and data.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="Admins cannot downgrade their own role"
        )

    allowed_roles = ["citizen", "ngo", "authority", "admin"]
    if data.role not in allowed_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Allowed: {allowed_roles}")

    user.role = data.role
    db.commit()
    db.refresh(user)

    return user


# ✅ GET SINGLE USER - Must be below /me and /debug-role
@router.get("/{user_id}", response_model=UserResponse)
def get_single_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # At least logged in
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ✅ UPDATE USER (Admin only)
@router.put("/{user_id}")
def update_user(
    user_id: int, 
    user_data: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = user_data.name
    user.email = user_data.email
    user.role = user_data.role

    db.commit()
    db.refresh(user)

    return {"message": "User updated successfully"}


# ✅ DELETE USER (Admin only + prevent self delete)
@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}
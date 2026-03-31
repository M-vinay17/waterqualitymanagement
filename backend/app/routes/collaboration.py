from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.collaboration import Collaboration
from app.models.user import User
from app.models.report import Report
from app.schemas.collaboration import (
    CollaborationCreate,
    CollaborationUpdate,
    CollaborationOut
)
from app.dependencies.role_guard import require_role
from app.core.security import get_current_user

router = APIRouter(
    prefix="/api/v1/collaborations",
    tags=["Collaborations"]
)

# 🔹 CREATE (NGO / ADMIN ONLY)
@router.post("/", response_model=CollaborationOut)
def create_collaboration(
    data: CollaborationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("ngo", "admin"))
):
    new_collab = Collaboration(
        ngo_name=data.ngo_name,
        project_name=data.project_name,
        contact_email=data.contact_email,
        ngo_user_id=user.id,
        station_id=data.station_id
    )

    db.add(new_collab)
    db.commit()
    db.refresh(new_collab)

    return {
        **new_collab.__dict__,
        "report_count": 0
    }


# 🔹 GET ALL (FILTERED)
@router.get("/", response_model=list[CollaborationOut])
def get_collaborations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = db.query(Collaboration)

    # NGO sees only their data
    if user.role != "admin":
        query = query.filter(Collaboration.ngo_user_id == user.id)

    collaborations = query.all()

    result = []
    for c in collaborations:
        count = db.query(Report).filter(
            Report.station_id == c.station_id
        ).count()

        result.append({
            **c.__dict__,
            "report_count": count
        })

    return result


# 🔹 GET BY ID
@router.get("/{collab_id}", response_model=CollaborationOut)
def get_collaboration(
    collab_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    collab = db.query(Collaboration).filter(
        Collaboration.id == collab_id
    ).first()

    if not collab:
        raise HTTPException(status_code=404, detail="Not found")

    # Owner or admin only
    if user.role != "admin" and collab.ngo_user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    count = db.query(Report).filter(
        Report.station_id == collab.station_id
    ).count()

    return {
        **collab.__dict__,
        "report_count": count
    }


# 🔹 UPDATE (OWNER OR ADMIN)
@router.patch("/{collab_id}", response_model=CollaborationOut)
def update_collaboration(
    collab_id: int,
    data: CollaborationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    collab = db.query(Collaboration).filter(
        Collaboration.id == collab_id
    ).first()

    if not collab:
        raise HTTPException(status_code=404, detail="Not found")

    # Owner or admin only
    if user.role != "admin" and collab.ngo_user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(collab, key, value)

    db.commit()
    db.refresh(collab)

    count = db.query(Report).filter(
        Report.station_id == collab.station_id
    ).count()

    return {
        **collab.__dict__,
        "report_count": count
    }


# 🔹 DELETE (OWNER OR ADMIN)
@router.delete("/{collab_id}")
def delete_collaboration(
    collab_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    collab = db.query(Collaboration).filter(
        Collaboration.id == collab_id
    ).first()

    if not collab:
        raise HTTPException(status_code=404, detail="Not found")

    # Owner or admin only
    if user.role != "admin" and collab.ngo_user_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(collab)
    db.commit()

    return {"message": "Deleted successfully"}
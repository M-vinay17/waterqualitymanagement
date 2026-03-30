from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.collaboration import Collaboration
from app.schemas.collaboration import CollaborationCreate

router = APIRouter(prefix="/collaborations")


@router.post("/")
def create_collaboration(data: CollaborationCreate, db: Session = Depends(get_db)):

    new_collab = Collaboration(
        project_name=data.project_name,
        ngo_name=data.ngo_name,
        contact_email=data.contact_email
    )

    db.add(new_collab)
    db.commit()
    db.refresh(new_collab)

    return new_collab


@router.get("/")
def get_collaborations(db: Session = Depends(get_db)):
    return db.query(Collaboration).all()

@router.delete("/collaborations/{collab_id}")
def delete_collaboration(collab_id: int, db: Session = Depends(get_db)):

    collaboration = db.query(Collaboration).filter(Collaboration.id == collab_id).first()

    if not collaboration:
        raise HTTPException(status_code=404, detail="Collaboration not found")

    db.delete(collaboration)
    db.commit()

    return {"message": "Collaboration deleted successfully"}
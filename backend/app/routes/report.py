from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import shutil, os, uuid

from app.schemas.report import ReportUpdate, ReportResponse
from app.models.report import Report
from app.core.database import get_db
from app.core.security import get_current_user
router = APIRouter(prefix="/reports", tags=["Reports"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# CREATE — multipart/form-data with optional photo
@router.post("/", response_model=ReportResponse)
def create_report(
    water_source: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    photo_url = None
    if photo:
        ext = photo.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        photo_url = f"/static/uploads/{filename}"

    new_report = Report(
        user_id=current_user.id,     # from JWT, not request body
        water_source=water_source,
        location=location,
        description=description,
        photo_url=photo_url,
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report


# GET ALL (admin use)
@router.get("/", response_model=list[ReportResponse])
def get_reports(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Report).all()


# GET CURRENT USER'S REPORTS
@router.get("/me", response_model=list[ReportResponse])
def get_my_reports(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Report).filter(Report.user_id == current_user.id).all()


# GET ONE
@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# UPDATE
@router.put("/{report_id}")
def update_report(report_id: int, report_data: ReportUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    for key, value in report_data.dict().items():
        setattr(report, key, value)
    db.commit()
    return {"message": "Report updated successfully"}


# DELETE
@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.report import (
    ReportCreate,
    ReportUpdate,
    ReportResponse
)

from app.models.report import Report

from app.core.database import get_db


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# CREATE
@router.post("/", response_model=ReportResponse)
def create_report(report: ReportCreate, db: Session = Depends(get_db)):

    new_report = Report(**report.dict())

    db.add(new_report)

    db.commit()

    db.refresh(new_report)

    return new_report


# GET ALL
@router.get("/", response_model=list[ReportResponse])
def get_reports(db: Session = Depends(get_db)):

    return db.query(Report).all()


# GET ONE
@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):

    report = db.query(Report).filter(
        Report.id == report_id
    ).first()

    if not report:

        raise HTTPException(status_code=404, detail="Report not found")

    return report


# UPDATE
@router.put("/{report_id}")
def update_report(
    report_id: int,
    report_data: ReportUpdate,
    db: Session = Depends(get_db)
):

    report = db.query(Report).filter(
        Report.id == report_id
    ).first()

    if not report:

        raise HTTPException(status_code=404, detail="Report not found")

    for key, value in report_data.dict().items():

        setattr(report, key, value)

    db.commit()

    return {"message": "Report updated successfully"}


# DELETE
@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):

    report = db.query(Report).filter(
        Report.id == report_id
    ).first()

    if not report:

        raise HTTPException(status_code=404, detail="Report not found")

    db.delete(report)

    db.commit()

    return {"message": "Report deleted successfully"}
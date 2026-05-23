from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ReadinessReportResponse
from app.services.report_service import generate_readiness_report

router = APIRouter()


@router.get("/readiness", response_model=ReadinessReportResponse)
def get_readiness_report(db: Session = Depends(get_db)):
    return generate_readiness_report(db)

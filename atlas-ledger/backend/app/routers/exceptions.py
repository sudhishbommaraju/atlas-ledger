from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LedgerEntryResponse, ResolveExceptionRequest
from app.services import exception_service

router = APIRouter()


@router.get("", response_model=list[LedgerEntryResponse])
def get_exceptions(
    exception_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return exception_service.get_open_exceptions(
        db,
        exception_type=exception_type,
        severity=severity,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )


@router.patch("/{entry_id}/resolve", response_model=LedgerEntryResponse)
def resolve_exception(
    entry_id: str,
    request: ResolveExceptionRequest,
    db: Session = Depends(get_db),
):
    entry = exception_service.resolve_exception(db, entry_id, request.resolution_notes)
    if not entry:
        raise HTTPException(status_code=404, detail="Exception entry not found")
    return entry

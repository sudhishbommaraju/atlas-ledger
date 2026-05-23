from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import LedgerEntryRead
from app.services import ledger_service

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.get("", response_model=list[LedgerEntryRead])
def list_ledger(
    source: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    payout_id: Optional[str] = Query(None),
    settlement_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(500, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> list[LedgerEntryRead]:
    return ledger_service.list_ledger_entries(
        db,
        source=source,
        transaction_type=transaction_type,
        status=status,
        payout_id=payout_id,
        settlement_id=settlement_id,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )


@router.delete("/reset")
def reset_ledger(db: Session = Depends(get_db)) -> dict:
    ledger_service.reset_ledger_entries(db)
    return {"deleted": True}

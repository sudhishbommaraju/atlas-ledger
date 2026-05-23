from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LedgerEntryResponse
from app.services import ledger_service

router = APIRouter()


@router.delete("/reset")
def reset_ledger(db: Session = Depends(get_db)):
    count = ledger_service.delete_all_entries(db)
    return {"deleted_count": count, "message": "Ledger reset complete"}


@router.get("", response_model=list[LedgerEntryResponse])
def get_ledger(
    source: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    payout_id: Optional[str] = Query(None),
    settlement_id: Optional[str] = Query(None),
    counterparty_id: Optional[str] = Query(None),
    account_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return ledger_service.get_entries(
        db,
        source=source,
        transaction_type=transaction_type,
        status=status,
        payout_id=payout_id,
        settlement_id=settlement_id,
        counterparty_id=counterparty_id,
        account_id=account_id,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )


@router.get("/{entry_id}", response_model=LedgerEntryResponse)
def get_ledger_entry(entry_id: str, db: Session = Depends(get_db)):
    entry = ledger_service.get_entry_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Ledger entry not found")
    return entry

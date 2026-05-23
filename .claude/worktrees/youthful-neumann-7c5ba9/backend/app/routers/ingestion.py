from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    BulkLedgerEntryCreate,
    BulkLedgerEntryResponse,
    LedgerEntryCreate,
    LedgerEntryRead,
)
from app.services import ledger_service

router = APIRouter(prefix="/ingest", tags=["ingestion"])


@router.post("/manual", response_model=LedgerEntryRead, status_code=201)
def ingest_manual(
    payload: LedgerEntryCreate,
    db: Session = Depends(get_db),
) -> LedgerEntryRead:
    return ledger_service.create_ledger_entry(db, payload)


@router.post("/bulk", response_model=BulkLedgerEntryResponse, status_code=201)
def ingest_bulk(
    body: BulkLedgerEntryCreate,
    db: Session = Depends(get_db),
) -> BulkLedgerEntryResponse:
    entries = ledger_service.create_bulk_ledger_entries(db, body.entries)
    return BulkLedgerEntryResponse(inserted=len(entries), entries=entries)

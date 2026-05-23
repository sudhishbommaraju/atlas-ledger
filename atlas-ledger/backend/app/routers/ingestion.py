from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LedgerEntryCreate, LedgerEntryResponse, BulkIngestRequest, BulkIngestResponse
from app.services import ledger_service

router = APIRouter()


@router.post("/manual", response_model=LedgerEntryResponse)
def ingest_manual(entry: LedgerEntryCreate, db: Session = Depends(get_db)):
    return ledger_service.create_entry(db, entry)


@router.post("/bulk", response_model=BulkIngestResponse)
def ingest_bulk(request: BulkIngestRequest, db: Session = Depends(get_db)):
    entries = ledger_service.bulk_create_entries(db, request.entries)
    return BulkIngestResponse(inserted_count=len(entries), entries=entries)

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models import LedgerEntry
from app.schemas import LedgerEntryCreate


def create_ledger_entry(db: Session, payload: LedgerEntryCreate) -> LedgerEntry:
    entry = LedgerEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def create_bulk_ledger_entries(
    db: Session, payloads: list[LedgerEntryCreate]
) -> list[LedgerEntry]:
    entries = [LedgerEntry(**p.model_dump()) for p in payloads]
    db.add_all(entries)
    db.commit()
    for e in entries:
        db.refresh(e)
    return entries


def list_ledger_entries(
    db: Session,
    source: Optional[str] = None,
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    payout_id: Optional[str] = None,
    settlement_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 500,
    offset: int = 0,
) -> list[LedgerEntry]:
    q = db.query(LedgerEntry)

    if source:
        q = q.filter(LedgerEntry.source == source)
    if transaction_type:
        q = q.filter(LedgerEntry.transaction_type == transaction_type)
    if status:
        q = q.filter(LedgerEntry.status == status)
    if payout_id:
        q = q.filter(LedgerEntry.payout_id == payout_id)
    if settlement_id:
        q = q.filter(LedgerEntry.settlement_id == settlement_id)
    if start_date:
        q = q.filter(LedgerEntry.event_timestamp >= start_date)
    if end_date:
        q = q.filter(LedgerEntry.event_timestamp <= end_date)

    return (
        q.order_by(LedgerEntry.event_timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def reset_ledger_entries(db: Session) -> int:
    deleted = db.query(LedgerEntry).delete()
    db.commit()
    return deleted

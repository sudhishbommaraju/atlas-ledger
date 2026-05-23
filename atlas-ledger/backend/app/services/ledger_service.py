import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import LedgerEntry
from app.schemas import LedgerEntryCreate


def create_entry(db: Session, entry: LedgerEntryCreate) -> LedgerEntry:
    db_entry = LedgerEntry(id=str(uuid.uuid4()), **entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def bulk_create_entries(db: Session, entries: list[LedgerEntryCreate]) -> list[LedgerEntry]:
    db_entries = [LedgerEntry(id=str(uuid.uuid4()), **e.model_dump()) for e in entries]
    db.add_all(db_entries)
    db.commit()
    for e in db_entries:
        db.refresh(e)
    return db_entries


def get_entries(
    db: Session,
    source: Optional[str] = None,
    transaction_type: Optional[str] = None,
    status: Optional[str] = None,
    payout_id: Optional[str] = None,
    settlement_id: Optional[str] = None,
    counterparty_id: Optional[str] = None,
    account_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
) -> list[LedgerEntry]:
    query = db.query(LedgerEntry)
    filters = []
    if source:
        filters.append(LedgerEntry.source == source)
    if transaction_type:
        filters.append(LedgerEntry.transaction_type == transaction_type)
    if status:
        filters.append(LedgerEntry.status == status)
    if payout_id:
        filters.append(LedgerEntry.payout_id == payout_id)
    if settlement_id:
        filters.append(LedgerEntry.settlement_id == settlement_id)
    if counterparty_id:
        filters.append(LedgerEntry.counterparty_id == counterparty_id)
    if account_id:
        filters.append(LedgerEntry.account_id == account_id)
    if start_date:
        filters.append(LedgerEntry.event_timestamp >= start_date)
    if end_date:
        filters.append(LedgerEntry.event_timestamp <= end_date)
    if filters:
        query = query.filter(and_(*filters))
    return query.order_by(LedgerEntry.event_timestamp.desc()).offset(offset).limit(limit).all()


def get_entry_by_id(db: Session, entry_id: str) -> Optional[LedgerEntry]:
    return db.query(LedgerEntry).filter(LedgerEntry.id == entry_id).first()


def delete_all_entries(db: Session) -> int:
    count = db.query(LedgerEntry).count()
    db.query(LedgerEntry).delete()
    db.commit()
    return count

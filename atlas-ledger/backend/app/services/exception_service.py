from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import LedgerEntry
from app.enums import TransactionTypeEnum, StatusEnum


def get_open_exceptions(
    db: Session,
    exception_type: Optional[str] = None,
    severity: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
) -> list[LedgerEntry]:
    query = db.query(LedgerEntry).filter(
        LedgerEntry.transaction_type == TransactionTypeEnum.exception,
        LedgerEntry.status == StatusEnum.open,
    )
    filters = []
    if exception_type:
        filters.append(LedgerEntry.exception_type == exception_type)
    if severity:
        filters.append(LedgerEntry.severity == severity)
    if start_date:
        filters.append(LedgerEntry.event_timestamp >= start_date)
    if end_date:
        filters.append(LedgerEntry.event_timestamp <= end_date)
    if filters:
        query = query.filter(and_(*filters))
    return query.order_by(LedgerEntry.event_timestamp.desc()).offset(offset).limit(limit).all()


def resolve_exception(db: Session, entry_id: str, resolution_notes: str) -> Optional[LedgerEntry]:
    entry = db.query(LedgerEntry).filter(LedgerEntry.id == entry_id).first()
    if not entry:
        return None
    entry.status = StatusEnum.resolved
    entry.resolved_at = datetime.now(timezone.utc)
    entry.resolution_notes = resolution_notes
    entry.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(entry)
    return entry

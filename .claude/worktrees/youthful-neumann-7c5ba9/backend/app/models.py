import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Numeric, DateTime, JSON, Uuid

from app.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)

    source = Column(String, nullable=False)
    # allowed: stripe | adyen | bank | erp | payout_processor | manual

    external_id = Column(String, nullable=True)

    transaction_type = Column(String, nullable=False)
    # allowed: charge | settlement | payout | refund | fee | reserve | exception

    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String, nullable=False, server_default="USD")

    status = Column(String, nullable=False)
    # allowed: pending | settled | failed | reversed | open | resolved

    event_timestamp = Column(DateTime(timezone=True), nullable=False)

    settlement_id = Column(String, nullable=True)
    payout_id = Column(String, nullable=True)

    exception_type = Column(String, nullable=True)
    # settlement_delay | fee_mismatch | duplicate_payout | missing_bank_credit
    # refund_discrepancy | reserve_hold | unknown

    description = Column(String, nullable=True)
    raw_payload = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)

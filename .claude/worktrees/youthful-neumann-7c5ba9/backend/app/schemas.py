from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.enums import (
    ExceptionType,
    LedgerSource,
    LedgerStatus,
    PayoutVerdict,
    TransactionType,
)


# ---------------------------------------------------------------------------
# Ledger entry
# ---------------------------------------------------------------------------

class LedgerEntryCreate(BaseModel):
    source: LedgerSource
    external_id: Optional[str] = None
    transaction_type: TransactionType
    amount: Decimal = Field(..., gt=0, description="Positive value; direction implied by transaction_type")
    currency: str = "USD"
    status: LedgerStatus
    event_timestamp: datetime
    settlement_id: Optional[str] = None
    payout_id: Optional[str] = None
    exception_type: Optional[ExceptionType] = None
    description: Optional[str] = None
    raw_payload: Optional[Any] = None

    @field_validator("currency")
    @classmethod
    def currency_upper(cls, v: str) -> str:
        return v.upper()


class LedgerEntryRead(LedgerEntryCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Bulk ingestion
# ---------------------------------------------------------------------------

class BulkLedgerEntryCreate(BaseModel):
    entries: list[LedgerEntryCreate]


class BulkLedgerEntryResponse(BaseModel):
    inserted: int
    entries: list[LedgerEntryRead]


# ---------------------------------------------------------------------------
# Balance
# ---------------------------------------------------------------------------

class BlockersResponse(BaseModel):
    unsettled_funds: Decimal
    refunds_in_flight: Decimal
    reserve_hold: Decimal
    unresolved_exceptions: Decimal
    fees: Decimal
    already_paid_out: Decimal


class BalanceResponse(BaseModel):
    paper_balance: Decimal
    payoutable_balance: Decimal
    blocked_amount: Decimal
    blockers: BlockersResponse
    verdict: PayoutVerdict
    explanation: list[str]


# ---------------------------------------------------------------------------
# Payout simulation
# ---------------------------------------------------------------------------

class PayoutSimulationRequest(BaseModel):
    planned_payout_amount: Decimal = Field(..., gt=0)


class PayoutSimulationResponse(BaseModel):
    planned_payout_amount: Decimal
    payoutable_balance: Decimal
    shortfall: Decimal
    verdict: PayoutVerdict
    message: str


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    service: str

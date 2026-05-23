from decimal import Decimal
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.enums import (
    SourceEnum,
    TransactionTypeEnum,
    StatusEnum,
    ExceptionTypeEnum,
    SeverityEnum,
    VerdictEnum,
)


class LedgerEntryCreate(BaseModel):
    source: SourceEnum
    external_id: Optional[str] = None
    transaction_type: TransactionTypeEnum
    amount: Decimal = Field(..., gt=0)
    currency: str = "USD"
    status: StatusEnum
    event_timestamp: datetime
    settlement_id: Optional[str] = None
    payout_id: Optional[str] = None
    counterparty_id: Optional[str] = None
    account_id: Optional[str] = None
    exception_type: Optional[ExceptionTypeEnum] = None
    severity: Optional[SeverityEnum] = None
    description: Optional[str] = None
    raw_payload: Optional[dict] = None


class LedgerEntryResponse(LedgerEntryCreate):
    id: str
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BulkIngestRequest(BaseModel):
    entries: List[LedgerEntryCreate]


class BulkIngestResponse(BaseModel):
    inserted_count: int
    entries: List[LedgerEntryResponse]


class BlockersDetail(BaseModel):
    unsettled_funds: str
    refunds_in_flight: str
    reserve_hold: str
    unresolved_exceptions: str
    fees: str
    already_paid_out: str


class PayoutableBalanceResponse(BaseModel):
    paper_balance: str
    payoutable_balance: str
    blocked_amount: str
    blockers: BlockersDetail
    verdict: VerdictEnum
    explanation: List[str]


class SimulatePayoutRequest(BaseModel):
    planned_payout_amount: Decimal = Field(..., gt=0)


class SimulatePayoutResponse(BaseModel):
    planned_payout_amount: str
    payoutable_balance: str
    shortfall: str
    verdict: VerdictEnum
    message: str


class ResolveExceptionRequest(BaseModel):
    resolution_notes: str


class ReadinessReportSummary(BaseModel):
    verdict: VerdictEnum
    paper_balance: str
    payoutable_balance: str
    blocked_amount: str


class ReadinessReportDecision(BaseModel):
    can_run_full_payout: bool
    safe_amount_now: str
    blocked_amount: str
    recommendation: str


class TopException(BaseModel):
    id: str
    amount: str
    exception_type: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None


class ReadinessReportResponse(BaseModel):
    report_name: str
    generated_at: datetime
    summary: ReadinessReportSummary
    blockers: BlockersDetail
    top_exceptions: List[TopException]
    decision: ReadinessReportDecision

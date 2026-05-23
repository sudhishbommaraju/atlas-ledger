from enum import Enum


class SourceEnum(str, Enum):
    stripe = "stripe"
    adyen = "adyen"
    bank = "bank"
    erp = "erp"
    payout_processor = "payout_processor"
    manual = "manual"
    system = "system"


class TransactionTypeEnum(str, Enum):
    charge = "charge"
    settlement = "settlement"
    payout = "payout"
    refund = "refund"
    fee = "fee"
    reserve = "reserve"
    exception = "exception"
    adjustment = "adjustment"


class StatusEnum(str, Enum):
    pending = "pending"
    settled = "settled"
    failed = "failed"
    reversed = "reversed"
    open = "open"
    resolved = "resolved"
    ignored = "ignored"


class ExceptionTypeEnum(str, Enum):
    settlement_delay = "settlement_delay"
    fee_mismatch = "fee_mismatch"
    duplicate_payout = "duplicate_payout"
    missing_bank_credit = "missing_bank_credit"
    refund_discrepancy = "refund_discrepancy"
    reserve_hold = "reserve_hold"
    payout_underfunding = "payout_underfunding"
    ledger_mismatch = "ledger_mismatch"
    unknown = "unknown"


class SeverityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class VerdictEnum(str, Enum):
    SAFE = "SAFE"
    PARTIAL = "PARTIAL"
    BLOCKED = "BLOCKED"

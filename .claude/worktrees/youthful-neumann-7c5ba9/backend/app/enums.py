from enum import Enum


class LedgerSource(str, Enum):
    STRIPE = "stripe"
    ADYEN = "adyen"
    BANK = "bank"
    ERP = "erp"
    PAYOUT_PROCESSOR = "payout_processor"
    MANUAL = "manual"


class TransactionType(str, Enum):
    CHARGE = "charge"
    SETTLEMENT = "settlement"
    PAYOUT = "payout"
    REFUND = "refund"
    FEE = "fee"
    RESERVE = "reserve"
    EXCEPTION = "exception"


class LedgerStatus(str, Enum):
    PENDING = "pending"
    SETTLED = "settled"
    FAILED = "failed"
    REVERSED = "reversed"
    OPEN = "open"
    RESOLVED = "resolved"


class PayoutVerdict(str, Enum):
    SAFE = "SAFE"
    PARTIAL = "PARTIAL"
    BLOCKED = "BLOCKED"


class ExceptionType(str, Enum):
    SETTLEMENT_DELAY = "settlement_delay"
    FEE_MISMATCH = "fee_mismatch"
    DUPLICATE_PAYOUT = "duplicate_payout"
    MISSING_BANK_CREDIT = "missing_bank_credit"
    REFUND_DISCREPANCY = "refund_discrepancy"
    RESERVE_HOLD = "reserve_hold"
    UNKNOWN = "unknown"

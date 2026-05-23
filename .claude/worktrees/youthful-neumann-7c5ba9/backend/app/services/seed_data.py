"""
Seed data for Atlas Ledger v0.

Produces the canonical demo state:
  paper_balance      = $2,410,000.00
  blocked_amount     =   $480,000.00
  payoutable_balance = $1,930,000.00
  verdict            = PARTIAL

Formula check:
  settled charges    = $2,500,000.00
  settled fees       =    $90,000.00
  paper_balance      = $2,500,000 - $90,000 = $2,410,000.00

  unsettled_funds    =   $210,000.00  (pending settlements)
  refunds_in_flight  =    $90,000.00  (pending refunds)
  reserve_hold       =   $130,000.00  (open reserves)
  unresolved_excs    =    $50,000.00  (open exceptions)
  blocked_amount     = $480,000.00

  payoutable_balance = $2,410,000 - $480,000 = $1,930,000.00

Run:
  python -m app.services.seed_data
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from datetime import datetime, timezone
from decimal import Decimal

from dotenv import load_dotenv

load_dotenv()

from app.database import SessionLocal, engine, Base
from app.enums import ExceptionType, LedgerSource, LedgerStatus, TransactionType
from app.models import LedgerEntry


def _ts(iso: str) -> datetime:
    return datetime.fromisoformat(iso).replace(tzinfo=timezone.utc)


SEED_ENTRIES: list[dict] = [
    # ------------------------------------------------------------------
    # SETTLED CHARGES — $2,500,000 total
    # Contributes positively to paper_balance
    # ------------------------------------------------------------------
    dict(
        source=LedgerSource.STRIPE,
        external_id="ch_s001",
        transaction_type=TransactionType.CHARGE,
        amount=Decimal("1000000.00"),
        status=LedgerStatus.SETTLED,
        event_timestamp=_ts("2026-05-01T00:00:00"),
        description="Stripe marketplace charges — May W1",
    ),
    dict(
        source=LedgerSource.ADYEN,
        external_id="ch_a001",
        transaction_type=TransactionType.CHARGE,
        amount=Decimal("800000.00"),
        status=LedgerStatus.SETTLED,
        event_timestamp=_ts("2026-05-04T00:00:00"),
        description="Adyen EU charges — May W1",
    ),
    dict(
        source=LedgerSource.BANK,
        external_id="ch_b001",
        transaction_type=TransactionType.CHARGE,
        amount=Decimal("400000.00"),
        status=LedgerStatus.SETTLED,
        event_timestamp=_ts("2026-05-06T00:00:00"),
        description="ACH bank charges — May batch",
    ),
    dict(
        source=LedgerSource.ERP,
        external_id="ch_e001",
        transaction_type=TransactionType.CHARGE,
        amount=Decimal("300000.00"),
        status=LedgerStatus.SETTLED,
        event_timestamp=_ts("2026-05-08T00:00:00"),
        description="ERP invoice charges — May",
    ),
    # ------------------------------------------------------------------
    # SETTLED FEES — $90,000 total
    # Subtracts from paper_balance
    # ------------------------------------------------------------------
    dict(
        source=LedgerSource.STRIPE,
        external_id="fee_s001",
        transaction_type=TransactionType.FEE,
        amount=Decimal("50000.00"),
        status=LedgerStatus.SETTLED,
        event_timestamp=_ts("2026-05-10T00:00:00"),
        description="Stripe processing fees — May",
    ),
    dict(
        source=LedgerSource.ADYEN,
        external_id="fee_a001",
        transaction_type=TransactionType.FEE,
        amount=Decimal("40000.00"),
        status=LedgerStatus.SETTLED,
        event_timestamp=_ts("2026-05-10T00:00:00"),
        description="Adyen processing fees — May",
    ),
    # ------------------------------------------------------------------
    # PENDING SETTLEMENTS — $210,000 total
    # unsettled_funds blocker
    # ------------------------------------------------------------------
    dict(
        source=LedgerSource.STRIPE,
        external_id="stl_s001",
        transaction_type=TransactionType.SETTLEMENT,
        amount=Decimal("120000.00"),
        status=LedgerStatus.PENDING,
        event_timestamp=_ts("2026-05-16T00:00:00"),
        settlement_id="stl_stripe_may_02",
        description="Stripe settlement — T+2 pending",
    ),
    dict(
        source=LedgerSource.ADYEN,
        external_id="stl_a001",
        transaction_type=TransactionType.SETTLEMENT,
        amount=Decimal("90000.00"),
        status=LedgerStatus.PENDING,
        event_timestamp=_ts("2026-05-16T00:00:00"),
        settlement_id="stl_adyen_may_01",
        description="Adyen settlement — T+2 pending",
    ),
    # ------------------------------------------------------------------
    # PENDING REFUNDS — $90,000 total
    # refunds_in_flight blocker
    # ------------------------------------------------------------------
    dict(
        source=LedgerSource.STRIPE,
        external_id="rf_s001",
        transaction_type=TransactionType.REFUND,
        amount=Decimal("50000.00"),
        status=LedgerStatus.PENDING,
        event_timestamp=_ts("2026-05-16T00:00:00"),
        description="Buyer dispute refunds — processing",
    ),
    dict(
        source=LedgerSource.ADYEN,
        external_id="rf_a001",
        transaction_type=TransactionType.REFUND,
        amount=Decimal("40000.00"),
        status=LedgerStatus.PENDING,
        event_timestamp=_ts("2026-05-17T00:00:00"),
        description="EU refund batch — processing",
    ),
    # ------------------------------------------------------------------
    # OPEN RESERVES — $130,000 total
    # reserve_hold blocker
    # ------------------------------------------------------------------
    dict(
        source=LedgerSource.STRIPE,
        external_id="rsv_s001",
        transaction_type=TransactionType.RESERVE,
        amount=Decimal("80000.00"),
        status=LedgerStatus.OPEN,
        event_timestamp=_ts("2026-05-01T00:00:00"),
        description="Stripe rolling reserve — 10% hold",
    ),
    dict(
        source=LedgerSource.ADYEN,
        external_id="rsv_a001",
        transaction_type=TransactionType.RESERVE,
        amount=Decimal("50000.00"),
        status=LedgerStatus.OPEN,
        event_timestamp=_ts("2026-05-01T00:00:00"),
        description="Adyen risk reserve hold",
    ),
    # ------------------------------------------------------------------
    # OPEN EXCEPTIONS — $50,000 total
    # unresolved_exceptions blocker
    # ------------------------------------------------------------------
    dict(
        source=LedgerSource.STRIPE,
        external_id="exc_s001",
        transaction_type=TransactionType.EXCEPTION,
        amount=Decimal("30000.00"),
        status=LedgerStatus.OPEN,
        event_timestamp=_ts("2026-05-15T00:00:00"),
        exception_type=ExceptionType.FEE_MISMATCH,
        description="Stripe fee discrepancy — under review",
    ),
    dict(
        source=LedgerSource.BANK,
        external_id="exc_b001",
        transaction_type=TransactionType.EXCEPTION,
        amount=Decimal("20000.00"),
        status=LedgerStatus.OPEN,
        event_timestamp=_ts("2026-05-15T00:00:00"),
        exception_type=ExceptionType.MISSING_BANK_CREDIT,
        description="Expected ACH credit not received",
    ),
]


def run() -> None:
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        db.query(LedgerEntry).delete()
        db.commit()

        entries = [LedgerEntry(currency="USD", **e) for e in SEED_ENTRIES]
        db.add_all(entries)
        db.commit()

        print(f"Seeded {len(entries)} ledger entries.\n")
        print("Expected balance:")
        print("  paper_balance      = $2,410,000.00")
        print("  blocked_amount     =   $480,000.00")
        print("    unsettled_funds    = $210,000.00")
        print("    refunds_in_flight  =  $90,000.00")
        print("    reserve_hold       = $130,000.00")
        print("    unresolved_excs    =  $50,000.00")
        print("  payoutable_balance = $1,930,000.00")
        print("  verdict            = PARTIAL")
        print("\nVerify: GET /balance/payoutable")
    finally:
        db.close()


if __name__ == "__main__":
    run()

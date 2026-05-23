"""
Seed demo data for Atlas Ledger.

Target output:
  paper_balance      = 2,410,000.00  (charges 2,500,000 - fees 90,000)
  blocked_amount     =   480,000.00  (pending settlements 210k + pending refunds 90k
                                       + open reserves 130k + open exceptions 50k)
  payoutable_balance = 1,930,000.00
  verdict            = PARTIAL

Run from backend directory:
  python -m app.services.seed_data
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from app.database import SessionLocal
from app.models import LedgerEntry


def seed() -> None:
    db = SessionLocal()
    try:
        db.query(LedgerEntry).delete()
        db.commit()

        now = datetime.now(timezone.utc)

        entries = [
            # ── settled charges: 2,500,000.00 ──────────────────────────────
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="stripe",
                external_id="ch_stripe_001",
                transaction_type="charge",
                amount=Decimal("1200000.00"),
                currency="USD",
                status="settled",
                event_timestamp=now - timedelta(days=3),
                counterparty_id="creator_001",
                account_id="acct_stripe_001",
                description="Creator subscription revenue batch - Stripe US",
            ),
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="stripe",
                external_id="ch_stripe_002",
                transaction_type="charge",
                amount=Decimal("800000.00"),
                currency="USD",
                status="settled",
                event_timestamp=now - timedelta(days=2),
                counterparty_id="creator_002",
                account_id="acct_stripe_001",
                description="Creator subscription revenue batch - Stripe EU",
            ),
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="adyen",
                external_id="adyen_ch_001",
                transaction_type="charge",
                amount=Decimal("500000.00"),
                currency="USD",
                status="settled",
                event_timestamp=now - timedelta(days=2),
                counterparty_id="creator_003",
                account_id="acct_adyen_001",
                description="Adyen marketplace creator earnings batch",
            ),
            # ── settled fees: 90,000.00 ─────────────────────────────────────
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="stripe",
                external_id="fee_stripe_001",
                transaction_type="fee",
                amount=Decimal("60000.00"),
                currency="USD",
                status="settled",
                event_timestamp=now - timedelta(days=2),
                account_id="acct_stripe_001",
                description="Stripe processing fees - monthly",
            ),
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="adyen",
                external_id="fee_adyen_001",
                transaction_type="fee",
                amount=Decimal("30000.00"),
                currency="USD",
                status="settled",
                event_timestamp=now - timedelta(days=2),
                account_id="acct_adyen_001",
                description="Adyen interchange and processing fees",
            ),
            # ── pending settlements: 210,000.00 (blocker) ───────────────────
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="adyen",
                external_id="st_adyen_007",
                transaction_type="settlement",
                amount=Decimal("120000.00"),
                currency="USD",
                status="pending",
                event_timestamp=now - timedelta(hours=18),
                settlement_id="batch_adyen_st_007",
                account_id="acct_adyen_001",
                description="Adyen marketplace settlement batch - T+2 delay",
            ),
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="bank",
                external_id="bank_st_004",
                transaction_type="settlement",
                amount=Decimal("90000.00"),
                currency="USD",
                status="pending",
                event_timestamp=now - timedelta(hours=6),
                settlement_id="batch_bank_st_004",
                account_id="acct_bank_001",
                description="Bank wire settlement pending - expected T+1",
            ),
            # ── pending refunds: 90,000.00 (blocker) ────────────────────────
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="stripe",
                external_id="ref_stripe_001",
                transaction_type="refund",
                amount=Decimal("55000.00"),
                currency="USD",
                status="pending",
                event_timestamp=now - timedelta(hours=36),
                counterparty_id="creator_002",
                account_id="acct_stripe_001",
                description="Batch refund processing - disputed charges",
            ),
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="adyen",
                external_id="ref_adyen_001",
                transaction_type="refund",
                amount=Decimal("35000.00"),
                currency="USD",
                status="pending",
                event_timestamp=now - timedelta(hours=12),
                counterparty_id="creator_003",
                account_id="acct_adyen_001",
                description="Adyen chargeback refund batch in-flight",
            ),
            # ── open reserve: 130,000.00 (blocker) ──────────────────────────
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="stripe",
                external_id="res_stripe_001",
                transaction_type="reserve",
                amount=Decimal("130000.00"),
                currency="USD",
                status="open",
                event_timestamp=now - timedelta(days=5),
                account_id="acct_stripe_001",
                description="Rolling reserve hold - 5% of monthly volume, 90-day lock",
            ),
            # ── open exception: 50,000.00 (blocker) ─────────────────────────
            LedgerEntry(
                id=str(uuid.uuid4()),
                source="bank",
                external_id="exc_bank_001",
                transaction_type="exception",
                amount=Decimal("50000.00"),
                currency="USD",
                status="open",
                event_timestamp=now - timedelta(days=1),
                settlement_id="batch_bank_st_004",
                account_id="acct_bank_001",
                exception_type="missing_bank_credit",
                severity="high",
                description="Expected bank credit not found for settlement batch batch_bank_st_004",
            ),
        ]

        db.add_all(entries)
        db.commit()

        print(f"Seeded {len(entries)} ledger entries.\n")
        print("Expected balances:")
        print("  paper_balance      = 2,410,000.00")
        print("  blocked_amount     =   480,000.00")
        print("  payoutable_balance = 1,930,000.00")
        print("  verdict            = PARTIAL")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

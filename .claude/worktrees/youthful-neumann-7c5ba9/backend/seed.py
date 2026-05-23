"""
Seed script: demonstrates paper_balance vs payoutable_balance gap.

Scenario:
  Settled charges:      $50,000
  Pending charge:       $10,000  -> unsettled, blocks payout
  Pending refund:        $2,500  -> refund in flight
  Reserve hold:          $5,000  -> processor reserve
  Open exception:        $1,200  -> disputed transaction
  Fees:                    $300  -> processor fees
  Already paid out:     $15,000

  paper_balance         = 50,000 - 15,000           = $35,000
  blocked_amount        = 10,000 + 2,500 + 5,000 + 1,200 + 300 = $19,000
  payoutable_balance    = max(35,000 - 19,000, 0)   = $16,000
  verdict               = PARTIAL
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone
from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal, engine, Base
from app.models import LedgerEntry

Base.metadata.create_all(bind=engine)

def ts(date_str: str) -> datetime:
    return datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc)

ENTRIES = [
    # Settled charges — contribute to paper_balance
    dict(source="stripe",  external_id="ch_001", transaction_type="charge",     amount=20000, currency="USD", status="settled",  event_timestamp=ts("2026-05-01")),
    dict(source="stripe",  external_id="ch_002", transaction_type="charge",     amount=15000, currency="USD", status="settled",  event_timestamp=ts("2026-05-05")),
    dict(source="adyen",   external_id="adyen_1", transaction_type="charge",    amount=15000, currency="USD", status="settled",  event_timestamp=ts("2026-05-08")),

    # Pending charge — unsettled, blocks payout
    dict(source="stripe",  external_id="ch_003", transaction_type="charge",     amount=10000, currency="USD", status="pending",  event_timestamp=ts("2026-05-15")),

    # Payout already made — reduces paper_balance
    dict(source="bank",    external_id="po_001", transaction_type="payout",     amount=15000, currency="USD", status="settled",  event_timestamp=ts("2026-05-10")),

    # Refund in flight — blocks payout
    dict(source="stripe",  external_id="re_001", transaction_type="refund",     amount=2500,  currency="USD", status="pending",  event_timestamp=ts("2026-05-14")),

    # Reserve hold — blocks payout
    dict(source="stripe",  external_id="rsv_001", transaction_type="reserve",   amount=5000,  currency="USD", status="open",     event_timestamp=ts("2026-05-01")),

    # Open exception (dispute) — blocks payout
    dict(source="stripe",  external_id="exc_001", transaction_type="exception", amount=1200,  currency="USD", status="open",     event_timestamp=ts("2026-05-12"), exception_type="chargeback"),

    # Fees — reduce payoutable amount
    dict(source="stripe",  external_id="fee_001", transaction_type="fee",       amount=300,   currency="USD", status="settled",  event_timestamp=ts("2026-05-10")),
]

def run():
    db = SessionLocal()
    try:
        existing = db.query(LedgerEntry).count()
        if existing > 0:
            print(f"Database already has {existing} entries. Drop and recreate to re-seed.")
            return

        entries = [LedgerEntry(**e) for e in ENTRIES]
        db.add_all(entries)
        db.commit()
        print(f"Seeded {len(entries)} ledger entries.")
        print()
        print("Expected balance snapshot:")
        print("  paper_balance      = $35,000.00")
        print("  blocked_amount     = $19,000.00")
        print("  payoutable_balance = $16,000.00")
        print("  verdict            = PARTIAL")
        print()
        print("Hit GET /balance/payoutable to verify.")
    finally:
        db.close()

if __name__ == "__main__":
    run()

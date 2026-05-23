"""
Tests for BalanceEngine.compute_payoutable_balance.

Covers:
  1. Seed scenario: paper=2410000, blocked=480000, payoutable=1930000, verdict=PARTIAL
  2. SAFE verdict: only settled charges, zero blockers
  3. BLOCKED verdict: open exception exceeds paper balance -> payoutable=0
"""

from decimal import Decimal
from datetime import datetime, timezone

import pytest

from app.enums import LedgerStatus, PayoutVerdict, TransactionType
from app.models import LedgerEntry
from app.services.balance_engine import BalanceEngine


def _entry(db, transaction_type: str, amount: str, status: str, **kwargs) -> LedgerEntry:
    entry = LedgerEntry(
        source="manual",
        transaction_type=transaction_type,
        amount=Decimal(amount),
        currency="USD",
        status=status,
        event_timestamp=datetime.now(timezone.utc),
        **kwargs,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


class TestSeedScenario:
    def test_produces_correct_paper_balance(self, db):
        """Settled charges 2,500,000 minus settled fees 90,000 = 2,410,000."""
        _entry(db, "charge", "1000000.00", "settled")
        _entry(db, "charge", "800000.00",  "settled")
        _entry(db, "charge", "400000.00",  "settled")
        _entry(db, "charge", "300000.00",  "settled")
        _entry(db, "fee",    "50000.00",   "settled")
        _entry(db, "fee",    "40000.00",   "settled")
        # blockers
        _entry(db, "settlement", "120000.00", "pending")
        _entry(db, "settlement", "90000.00",  "pending")
        _entry(db, "refund",     "50000.00",  "pending")
        _entry(db, "refund",     "40000.00",  "pending")
        _entry(db, "reserve",    "80000.00",  "open")
        _entry(db, "reserve",    "50000.00",  "open")
        _entry(db, "exception",  "30000.00",  "open")
        _entry(db, "exception",  "20000.00",  "open")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.paper_balance == Decimal("2410000.00")

    def test_produces_correct_blocked_amount(self, db):
        _entry(db, "charge", "2500000.00", "settled")
        _entry(db, "fee",    "90000.00",   "settled")
        _entry(db, "settlement", "120000.00", "pending")
        _entry(db, "settlement", "90000.00",  "pending")
        _entry(db, "refund",     "50000.00",  "pending")
        _entry(db, "refund",     "40000.00",  "pending")
        _entry(db, "reserve",    "80000.00",  "open")
        _entry(db, "reserve",    "50000.00",  "open")
        _entry(db, "exception",  "30000.00",  "open")
        _entry(db, "exception",  "20000.00",  "open")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.blocked_amount == Decimal("480000.00")
        assert result.blockers.unsettled_funds == Decimal("210000.00")
        assert result.blockers.refunds_in_flight == Decimal("90000.00")
        assert result.blockers.reserve_hold == Decimal("130000.00")
        assert result.blockers.unresolved_exceptions == Decimal("50000.00")
        assert result.blockers.fees == Decimal("0.00")
        assert result.blockers.already_paid_out == Decimal("0.00")

    def test_produces_correct_payoutable_balance_and_verdict(self, db):
        _entry(db, "charge", "2500000.00", "settled")
        _entry(db, "fee",    "90000.00",   "settled")
        _entry(db, "settlement", "210000.00", "pending")
        _entry(db, "refund",     "90000.00",  "pending")
        _entry(db, "reserve",    "130000.00", "open")
        _entry(db, "exception",  "50000.00",  "open")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.payoutable_balance == Decimal("1930000.00")
        assert result.verdict == PayoutVerdict.PARTIAL


class TestSafeVerdict:
    def test_safe_when_no_blockers(self, db):
        """Only settled charges, nothing blocking."""
        _entry(db, "charge", "100000.00", "settled")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.paper_balance == Decimal("100000.00")
        assert result.blocked_amount == Decimal("0.00")
        assert result.payoutable_balance == Decimal("100000.00")
        assert result.verdict == PayoutVerdict.SAFE

    def test_safe_explanation(self, db):
        _entry(db, "charge", "50000.00", "settled")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.verdict == PayoutVerdict.SAFE
        assert len(result.explanation) == 1
        assert "safe" in result.explanation[0].lower()


class TestBlockedVerdict:
    def test_blocked_when_payoutable_is_zero(self, db):
        """Open exception exceeds paper balance -> payoutable floored to 0."""
        _entry(db, "charge",    "1000.00", "settled")
        _entry(db, "exception", "5000.00", "open")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.paper_balance == Decimal("1000.00")
        assert result.payoutable_balance == Decimal("0.00")
        assert result.verdict == PayoutVerdict.BLOCKED

    def test_blocked_on_empty_ledger(self, db):
        """No entries at all -> payoutable = 0 -> BLOCKED."""
        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.payoutable_balance == Decimal("0.00")
        assert result.verdict == PayoutVerdict.BLOCKED

    def test_blocked_explanation(self, db):
        _entry(db, "charge",    "1000.00", "settled")
        _entry(db, "exception", "5000.00", "open")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.verdict == PayoutVerdict.BLOCKED
        assert "blocked" in result.explanation[0].lower()


class TestBalanceFormula:
    def test_settled_payouts_reduce_paper_balance(self, db):
        _entry(db, "charge", "100000.00", "settled")
        _entry(db, "payout", "30000.00",  "settled")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.paper_balance == Decimal("70000.00")
        assert result.blockers.already_paid_out == Decimal("30000.00")

    def test_settled_refunds_reduce_paper_balance(self, db):
        _entry(db, "charge", "100000.00", "settled")
        _entry(db, "refund", "20000.00",  "settled")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.paper_balance == Decimal("80000.00")

    def test_pending_fees_block_payout(self, db):
        _entry(db, "charge", "100000.00", "settled")
        _entry(db, "fee",    "10000.00",  "pending")

        result = BalanceEngine().compute_payoutable_balance(db)

        assert result.blockers.fees == Decimal("10000.00")
        assert result.blocked_amount == Decimal("10000.00")
        assert result.payoutable_balance == Decimal("90000.00")
        assert result.verdict == PayoutVerdict.PARTIAL

"""
Tests for simulate_payout.

Covers:
  4. SAFE when planned payout <= payoutable balance
  5. PARTIAL when planned payout exceeds payoutable balance
  6. BLOCKED when payoutable balance is zero
"""

from decimal import Decimal
from datetime import datetime, timezone

from app.enums import PayoutVerdict
from app.models import LedgerEntry
from app.services.simulation_engine import simulate_payout


def _charge(db, amount: str) -> None:
    db.add(LedgerEntry(
        source="manual",
        transaction_type="charge",
        amount=Decimal(amount),
        currency="USD",
        status="settled",
        event_timestamp=datetime.now(timezone.utc),
    ))
    db.commit()


def _exception(db, amount: str) -> None:
    db.add(LedgerEntry(
        source="manual",
        transaction_type="exception",
        amount=Decimal(amount),
        currency="USD",
        status="open",
        event_timestamp=datetime.now(timezone.utc),
    ))
    db.commit()


class TestSimulateSafe:
    def test_safe_when_payout_within_balance(self, db):
        _charge(db, "100000.00")

        result = simulate_payout(db, Decimal("50000.00"))

        assert result.verdict == PayoutVerdict.SAFE
        assert result.payoutable_balance == Decimal("100000.00")
        assert result.shortfall == Decimal("0.00")
        assert result.planned_payout_amount == Decimal("50000.00")

    def test_safe_when_payout_exactly_equals_balance(self, db):
        _charge(db, "100000.00")

        result = simulate_payout(db, Decimal("100000.00"))

        assert result.verdict == PayoutVerdict.SAFE
        assert result.shortfall == Decimal("0.00")

    def test_safe_message_is_informative(self, db):
        _charge(db, "100000.00")

        result = simulate_payout(db, Decimal("50000.00"))

        assert "50000.00" in result.message


class TestSimulatePartial:
    def test_partial_when_payout_exceeds_balance(self, db):
        """payoutable=80000, planned=100000 -> shortfall=20000."""
        _charge(db, "100000.00")
        db.add(LedgerEntry(
            source="manual",
            transaction_type="settlement",
            amount=Decimal("20000.00"),
            currency="USD",
            status="pending",
            event_timestamp=datetime.now(timezone.utc),
        ))
        db.commit()

        result = simulate_payout(db, Decimal("100000.00"))

        assert result.verdict == PayoutVerdict.PARTIAL
        assert result.payoutable_balance == Decimal("80000.00")
        assert result.shortfall == Decimal("20000.00")

    def test_partial_message_includes_shortfall(self, db):
        _charge(db, "100000.00")
        db.add(LedgerEntry(
            source="manual",
            transaction_type="exception",
            amount=Decimal("10000.00"),
            currency="USD",
            status="open",
            event_timestamp=datetime.now(timezone.utc),
        ))
        db.commit()

        result = simulate_payout(db, Decimal("100000.00"))

        assert result.verdict == PayoutVerdict.PARTIAL
        assert "10000.00" in result.message


class TestSimulateBlocked:
    def test_blocked_when_no_payoutable_balance(self, db):
        """No entries -> payoutable=0 -> BLOCKED."""
        result = simulate_payout(db, Decimal("50000.00"))

        assert result.verdict == PayoutVerdict.BLOCKED
        assert result.payoutable_balance == Decimal("0.00")
        assert result.shortfall == Decimal("50000.00")

    def test_blocked_message_is_informative(self, db):
        result = simulate_payout(db, Decimal("50000.00"))

        assert "blocked" in result.message.lower()

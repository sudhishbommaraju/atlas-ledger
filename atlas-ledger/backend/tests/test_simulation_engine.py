from decimal import Decimal
from tests.utils import make_entry
from app.services.simulation_engine import simulate_payout
from app.enums import VerdictEnum


def test_simulate_payout_safe(db):
    db.add(make_entry(transaction_type="charge", amount=Decimal("1000.00"), status="settled"))
    db.commit()

    result = simulate_payout(db, Decimal("500.00"))

    assert result.verdict == VerdictEnum.SAFE
    assert result.shortfall == "0.00"
    assert result.planned_payout_amount == "500.00"


def test_simulate_payout_exact_amount_safe(db):
    db.add(make_entry(transaction_type="charge", amount=Decimal("1000.00"), status="settled"))
    db.commit()

    result = simulate_payout(db, Decimal("1000.00"))

    assert result.verdict == VerdictEnum.SAFE
    assert result.shortfall == "0.00"


def test_simulate_payout_partial(db):
    db.add(make_entry(transaction_type="charge", amount=Decimal("1000.00"), status="settled"))
    db.commit()

    result = simulate_payout(db, Decimal("1500.00"))

    assert result.verdict == VerdictEnum.PARTIAL
    assert Decimal(result.shortfall) == Decimal("500.00")


def test_simulate_payout_blocked(db):
    db.add(make_entry(transaction_type="reserve", amount=Decimal("500.00"), status="open"))
    db.commit()

    result = simulate_payout(db, Decimal("100.00"))

    assert result.verdict == VerdictEnum.BLOCKED
    assert Decimal(result.shortfall) == Decimal("100.00")

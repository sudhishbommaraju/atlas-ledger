from decimal import Decimal
from tests.utils import make_entry
from app.services.balance_engine import compute_balance
from app.enums import VerdictEnum


def test_seed_balance_exact_values(db):
    db.add_all([
        make_entry(transaction_type="charge", amount=Decimal("2500000.00"), status="settled"),
        make_entry(transaction_type="fee", amount=Decimal("90000.00"), status="settled"),
        make_entry(transaction_type="settlement", amount=Decimal("210000.00"), status="pending"),
        make_entry(transaction_type="refund", amount=Decimal("90000.00"), status="pending"),
        make_entry(transaction_type="reserve", amount=Decimal("130000.00"), status="open"),
        make_entry(transaction_type="exception", amount=Decimal("50000.00"), status="open"),
    ])
    db.commit()

    result = compute_balance(db)

    assert result.paper_balance == "2410000.00"
    assert result.blocked_amount == "480000.00"
    assert result.payoutable_balance == "1930000.00"
    assert result.verdict == VerdictEnum.PARTIAL


def test_safe_verdict(db):
    db.add(make_entry(transaction_type="charge", amount=Decimal("1000.00"), status="settled"))
    db.commit()

    result = compute_balance(db)

    assert result.verdict == VerdictEnum.SAFE
    assert Decimal(result.payoutable_balance) > 0
    assert Decimal(result.blocked_amount) == 0


def test_partial_verdict(db):
    db.add_all([
        make_entry(transaction_type="charge", amount=Decimal("1000.00"), status="settled"),
        make_entry(transaction_type="settlement", amount=Decimal("200.00"), status="pending"),
    ])
    db.commit()

    result = compute_balance(db)

    assert result.verdict == VerdictEnum.PARTIAL
    assert Decimal(result.payoutable_balance) == Decimal("800.00")
    assert Decimal(result.blocked_amount) == Decimal("200.00")


def test_blocked_verdict(db):
    db.add(make_entry(transaction_type="reserve", amount=Decimal("1000.00"), status="open"))
    db.commit()

    result = compute_balance(db)

    assert result.verdict == VerdictEnum.BLOCKED
    assert result.payoutable_balance == "0.00"


def test_empty_ledger_returns_blocked(db):
    result = compute_balance(db)
    assert result.verdict == VerdictEnum.BLOCKED
    assert result.paper_balance == "0.00"
    assert result.payoutable_balance == "0.00"

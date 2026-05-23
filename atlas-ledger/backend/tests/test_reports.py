from decimal import Decimal
from tests.utils import make_entry


def test_readiness_report_has_required_fields(client, db):
    db.add_all([
        make_entry(transaction_type="charge", amount=Decimal("1000.00"), status="settled"),
        make_entry(transaction_type="settlement", amount=Decimal("200.00"), status="pending"),
        make_entry(
            transaction_type="exception",
            amount=Decimal("50.00"),
            status="open",
            exception_type="missing_bank_credit",
            severity="high",
            description="Test exception",
        ),
    ])
    db.commit()

    response = client.get("/reports/readiness")

    assert response.status_code == 200
    data = response.json()

    assert data["report_name"] == "Payout Readiness Report"
    assert "generated_at" in data
    assert "summary" in data
    assert "blockers" in data
    assert "top_exceptions" in data
    assert "decision" in data


def test_readiness_report_summary_fields(client, db):
    db.add(make_entry(transaction_type="charge", amount=Decimal("1000.00"), status="settled"))
    db.commit()

    response = client.get("/reports/readiness")
    data = response.json()

    summary = data["summary"]
    assert "verdict" in summary
    assert "paper_balance" in summary
    assert "payoutable_balance" in summary
    assert "blocked_amount" in summary


def test_readiness_report_decision_fields(client, db):
    db.add(make_entry(transaction_type="charge", amount=Decimal("1000.00"), status="settled"))
    db.commit()

    response = client.get("/reports/readiness")
    data = response.json()

    decision = data["decision"]
    assert "can_run_full_payout" in decision
    assert "safe_amount_now" in decision
    assert "blocked_amount" in decision
    assert "recommendation" in decision


def test_readiness_report_includes_top_exceptions(client, db):
    db.add_all([
        make_entry(transaction_type="charge", amount=Decimal("5000.00"), status="settled"),
        make_entry(
            transaction_type="exception",
            amount=Decimal("500.00"),
            status="open",
            exception_type="missing_bank_credit",
            severity="high",
            description="Missing bank credit for batch",
        ),
    ])
    db.commit()

    response = client.get("/reports/readiness")
    data = response.json()

    assert len(data["top_exceptions"]) == 1
    exc = data["top_exceptions"][0]
    assert exc["exception_type"] == "missing_bank_credit"
    assert exc["severity"] == "high"
    assert "amount" in exc


def test_readiness_report_safe_verdict_can_run_full_payout(client, db):
    db.add(make_entry(transaction_type="charge", amount=Decimal("1000.00"), status="settled"))
    db.commit()

    response = client.get("/reports/readiness")
    data = response.json()

    assert data["summary"]["verdict"] == "SAFE"
    assert data["decision"]["can_run_full_payout"] is True

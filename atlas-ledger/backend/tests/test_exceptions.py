from decimal import Decimal
from tests.utils import make_entry


def test_exceptions_endpoint_returns_only_open(client, db):
    open_exc = make_entry(
        transaction_type="exception",
        status="open",
        exception_type="missing_bank_credit",
        severity="high",
        amount=Decimal("5000.00"),
    )
    resolved_exc = make_entry(
        transaction_type="exception",
        status="resolved",
        exception_type="fee_mismatch",
        severity="low",
        amount=Decimal("100.00"),
    )
    db.add_all([open_exc, resolved_exc])
    db.commit()

    response = client.get("/exceptions")
    data = response.json()

    assert len(data) == 1
    assert data[0]["status"] == "open"
    assert data[0]["exception_type"] == "missing_bank_credit"


def test_resolve_exception_updates_status(client, db):
    exc = make_entry(
        transaction_type="exception",
        status="open",
        exception_type="missing_bank_credit",
        severity="high",
        amount=Decimal("5000.00"),
    )
    db.add(exc)
    db.commit()

    response = client.patch(
        f"/exceptions/{exc.id}/resolve",
        json={"resolution_notes": "Matched to delayed bank credit."},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "resolved"
    assert data["resolution_notes"] == "Matched to delayed bank credit."
    assert data["resolved_at"] is not None


def test_resolve_nonexistent_exception_returns_404(client):
    response = client.patch(
        "/exceptions/nonexistent-id/resolve",
        json={"resolution_notes": "Notes."},
    )
    assert response.status_code == 404

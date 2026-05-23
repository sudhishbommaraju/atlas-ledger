from datetime import datetime, timezone


NOW = datetime.now(timezone.utc).isoformat()


def test_ingest_manual_entry(client):
    payload = {
        "source": "stripe",
        "transaction_type": "charge",
        "amount": "500.00",
        "currency": "USD",
        "status": "settled",
        "event_timestamp": NOW,
        "description": "Test charge",
    }
    response = client.post("/ingest/manual", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "stripe"
    assert data["amount"] == "500.00"
    assert "id" in data


def test_ingest_negative_amount_rejected(client):
    payload = {
        "source": "stripe",
        "transaction_type": "charge",
        "amount": "-100.00",
        "currency": "USD",
        "status": "settled",
        "event_timestamp": NOW,
    }
    response = client.post("/ingest/manual", json=payload)

    assert response.status_code == 422


def test_ingest_zero_amount_rejected(client):
    payload = {
        "source": "stripe",
        "transaction_type": "charge",
        "amount": "0.00",
        "currency": "USD",
        "status": "settled",
        "event_timestamp": NOW,
    }
    response = client.post("/ingest/manual", json=payload)

    assert response.status_code == 422


def test_ingest_bulk(client):
    payload = {
        "entries": [
            {"source": "stripe", "transaction_type": "charge", "amount": "100.00", "currency": "USD", "status": "settled", "event_timestamp": NOW},
            {"source": "adyen", "transaction_type": "fee", "amount": "5.00", "currency": "USD", "status": "settled", "event_timestamp": NOW},
        ]
    }
    response = client.post("/ingest/bulk", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["inserted_count"] == 2
    assert len(data["entries"]) == 2


def test_ledger_filter_by_source(client):
    payload = {
        "entries": [
            {"source": "stripe", "transaction_type": "charge", "amount": "100.00", "currency": "USD", "status": "settled", "event_timestamp": NOW},
            {"source": "adyen", "transaction_type": "fee", "amount": "5.00", "currency": "USD", "status": "pending", "event_timestamp": NOW},
        ]
    }
    client.post("/ingest/bulk", json=payload)

    response = client.get("/ledger?source=stripe")
    data = response.json()
    assert len(data) == 1
    assert all(e["source"] == "stripe" for e in data)


def test_ledger_filter_by_status(client):
    payload = {
        "entries": [
            {"source": "stripe", "transaction_type": "charge", "amount": "100.00", "currency": "USD", "status": "settled", "event_timestamp": NOW},
            {"source": "adyen", "transaction_type": "fee", "amount": "5.00", "currency": "USD", "status": "pending", "event_timestamp": NOW},
        ]
    }
    client.post("/ingest/bulk", json=payload)

    response = client.get("/ledger?status=pending")
    data = response.json()
    assert len(data) == 1
    assert all(e["status"] == "pending" for e in data)

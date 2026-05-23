"""
Tests for ingestion endpoints and ledger filters.

Covers:
  6. POST /ingest/manual rejects negative amounts
  7. GET /ledger filters by transaction_type and status
"""

import pytest


VALID_ENTRY = {
    "source": "stripe",
    "external_id": "ch_test_001",
    "transaction_type": "charge",
    "amount": "50000.00",
    "currency": "USD",
    "status": "settled",
    "event_timestamp": "2026-05-17T12:00:00Z",
    "description": "Test settled charge",
}


class TestIngestManual:
    def test_ingest_manual_success(self, client):
        resp = client.post("/ingest/manual", json=VALID_ENTRY)

        assert resp.status_code == 201
        body = resp.json()
        assert body["transaction_type"] == "charge"
        assert body["status"] == "settled"
        assert "id" in body

    def test_rejects_negative_amount(self, client):
        payload = {**VALID_ENTRY, "amount": "-100.00"}
        resp = client.post("/ingest/manual", json=payload)

        assert resp.status_code == 422

    def test_rejects_zero_amount(self, client):
        payload = {**VALID_ENTRY, "amount": "0.00"}
        resp = client.post("/ingest/manual", json=payload)

        assert resp.status_code == 422

    def test_rejects_invalid_source(self, client):
        payload = {**VALID_ENTRY, "source": "unknown_processor"}
        resp = client.post("/ingest/manual", json=payload)

        assert resp.status_code == 422

    def test_rejects_invalid_transaction_type(self, client):
        payload = {**VALID_ENTRY, "transaction_type": "transfer"}
        resp = client.post("/ingest/manual", json=payload)

        assert resp.status_code == 422

    def test_rejects_invalid_status(self, client):
        payload = {**VALID_ENTRY, "status": "processing"}
        resp = client.post("/ingest/manual", json=payload)

        assert resp.status_code == 422

    def test_currency_is_uppercased(self, client):
        payload = {**VALID_ENTRY, "currency": "usd"}
        resp = client.post("/ingest/manual", json=payload)

        assert resp.status_code == 201
        assert resp.json()["currency"] == "USD"


class TestIngestBulk:
    def test_bulk_ingest_success(self, client):
        payload = {
            "entries": [
                VALID_ENTRY,
                {**VALID_ENTRY, "external_id": "ch_test_002", "amount": "25000.00"},
            ]
        }
        resp = client.post("/ingest/bulk", json=payload)

        assert resp.status_code == 201
        body = resp.json()
        assert body["inserted"] == 2
        assert len(body["entries"]) == 2

    def test_bulk_ingest_rejects_negative_in_batch(self, client):
        payload = {
            "entries": [
                VALID_ENTRY,
                {**VALID_ENTRY, "amount": "-500.00"},
            ]
        }
        resp = client.post("/ingest/bulk", json=payload)

        assert resp.status_code == 422


class TestLedgerFilters:
    def _seed(self, client) -> None:
        entries = [
            VALID_ENTRY,
            {**VALID_ENTRY, "transaction_type": "refund",     "status": "pending",  "external_id": "rf_001"},
            {**VALID_ENTRY, "transaction_type": "settlement", "status": "pending",  "external_id": "stl_001"},
            {**VALID_ENTRY, "transaction_type": "fee",        "status": "settled",  "external_id": "fee_001"},
            {**VALID_ENTRY, "source": "adyen",                "status": "settled",  "external_id": "adyen_001"},
        ]
        client.post("/ingest/bulk", json={"entries": entries})

    def test_filter_by_transaction_type(self, client):
        self._seed(client)
        resp = client.get("/ledger?transaction_type=refund")

        assert resp.status_code == 200
        entries = resp.json()
        assert len(entries) == 1
        assert entries[0]["transaction_type"] == "refund"

    def test_filter_by_status(self, client):
        self._seed(client)
        resp = client.get("/ledger?status=pending")

        assert resp.status_code == 200
        entries = resp.json()
        assert all(e["status"] == "pending" for e in entries)
        assert len(entries) == 2

    def test_filter_by_source(self, client):
        self._seed(client)
        resp = client.get("/ledger?source=adyen")

        assert resp.status_code == 200
        entries = resp.json()
        assert len(entries) == 1
        assert entries[0]["source"] == "adyen"

    def test_filter_by_transaction_type_and_status(self, client):
        self._seed(client)
        resp = client.get("/ledger?transaction_type=charge&status=settled")

        assert resp.status_code == 200
        entries = resp.json()
        assert all(e["transaction_type"] == "charge" for e in entries)
        assert all(e["status"] == "settled" for e in entries)

    def test_no_filter_returns_all(self, client):
        self._seed(client)
        resp = client.get("/ledger")

        assert resp.status_code == 200
        assert len(resp.json()) == 5

    def test_limit_and_offset(self, client):
        self._seed(client)
        resp = client.get("/ledger?limit=2&offset=0")

        assert resp.status_code == 200
        assert len(resp.json()) == 2


class TestLedgerReset:
    def test_reset_clears_all_entries(self, client):
        client.post("/ingest/manual", json=VALID_ENTRY)
        client.post("/ingest/manual", json={**VALID_ENTRY, "external_id": "ch_002"})

        resp = client.delete("/ledger/reset")
        assert resp.status_code == 200
        assert resp.json() == {"deleted": True}

        ledger = client.get("/ledger")
        assert ledger.json() == []


class TestHealth:
    def test_health_check(self, client):
        resp = client.get("/health")

        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["service"] == "atlas-ledger-backend"

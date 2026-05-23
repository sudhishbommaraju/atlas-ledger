# Atlas Ledger v0 — Backend

Payout decisioning system. Ingests financial events into a canonical ledger, computes paper balance vs payoutable balance, and answers one question before every payout run:

> **SAFE**, **PARTIAL**, or **BLOCKED?**

---

## Stack

- Python 3.11+
- FastAPI + Uvicorn
- SQLAlchemy 2.0 + Alembic
- PostgreSQL 14+
- Pydantic v2
- Pytest

---

## Setup

### 1. Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate      # macOS / Linux
.venv\Scripts\activate         # Windows
```

### 2. Install requirements

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/atlas_ledger
```

### 4. Create the database

```sql
CREATE DATABASE atlas_ledger;
```

---

## Alembic migration

Run the initial migration to create the `ledger_entries` table and indexes:

```bash
cd backend
alembic upgrade head
```

To generate a new migration after model changes:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

To roll back:

```bash
alembic downgrade -1
```

---

## Run the server

```bash
cd backend
uvicorn app.main:app --reload
```

Server: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

## Load seed data

Clears the ledger and inserts a demo state that proves the core product mechanic.

```bash
cd backend
python -m app.services.seed_data
```

Expected output:

```
Seeded 14 ledger entries.

Expected balance:
  paper_balance      = $2,410,000.00
  blocked_amount     =   $480,000.00
    unsettled_funds    = $210,000.00
    refunds_in_flight  =  $90,000.00
    reserve_hold       = $130,000.00
    unresolved_excs    =  $50,000.00
  payoutable_balance = $1,930,000.00
  verdict            = PARTIAL

Verify: GET /balance/payoutable
```

---

## Run tests

```bash
cd backend
pytest -v
```

Tests use an in-memory SQLite database — no PostgreSQL required.

---

## API Reference

### GET /health

```bash
curl http://localhost:8000/health
```

```json
{
  "status": "ok",
  "service": "atlas-ledger-backend"
}
```

---

### POST /ingest/manual

Ingest a single ledger event.

```bash
curl -X POST http://localhost:8000/ingest/manual \
  -H "Content-Type: application/json" \
  -d '{
    "source": "stripe",
    "external_id": "ch_live_001",
    "transaction_type": "charge",
    "amount": "75000.00",
    "currency": "USD",
    "status": "settled",
    "event_timestamp": "2026-05-17T09:00:00Z",
    "description": "Seller payout batch May 17"
  }'
```

**source** — `stripe | adyen | bank | erp | payout_processor | manual`  
**transaction_type** — `charge | settlement | payout | refund | fee | reserve | exception`  
**status** — `pending | settled | failed | reversed | open | resolved`  
**amount** — positive number; direction implied by `transaction_type`

---

### POST /ingest/bulk

Ingest multiple events in one call.

```bash
curl -X POST http://localhost:8000/ingest/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [
      {
        "source": "adyen",
        "external_id": "stl_adyen_002",
        "transaction_type": "settlement",
        "amount": "50000.00",
        "currency": "USD",
        "status": "pending",
        "event_timestamp": "2026-05-17T08:00:00Z",
        "settlement_id": "stl_adyen_may_02",
        "description": "Adyen settlement T+2"
      },
      {
        "source": "stripe",
        "external_id": "exc_s002",
        "transaction_type": "exception",
        "amount": "12000.00",
        "currency": "USD",
        "status": "open",
        "event_timestamp": "2026-05-17T08:30:00Z",
        "exception_type": "settlement_delay",
        "description": "Settlement delayed beyond SLA"
      }
    ]
  }'
```

Response:

```json
{
  "inserted": 2,
  "entries": [...]
}
```

---

### GET /ledger

List entries with optional filters.

```bash
# All entries
curl http://localhost:8000/ledger

# Filter by source
curl "http://localhost:8000/ledger?source=stripe"

# Filter by transaction type and status
curl "http://localhost:8000/ledger?transaction_type=exception&status=open"

# Filter by settlement ID
curl "http://localhost:8000/ledger?settlement_id=stl_stripe_may_01"

# Date range
curl "http://localhost:8000/ledger?start_date=2026-05-01T00:00:00Z&end_date=2026-05-17T23:59:59Z"

# Pagination
curl "http://localhost:8000/ledger?limit=50&offset=0"
```

---

### GET /balance/payoutable

Compute the payoutable balance.

```bash
curl http://localhost:8000/balance/payoutable
```

Expected output after seeding:

```json
{
  "paper_balance": "2410000.00",
  "payoutable_balance": "1930000.00",
  "blocked_amount": "480000.00",
  "blockers": {
    "unsettled_funds": "210000.00",
    "refunds_in_flight": "90000.00",
    "reserve_hold": "130000.00",
    "unresolved_exceptions": "50000.00",
    "fees": "0.00",
    "already_paid_out": "0.00"
  },
  "verdict": "PARTIAL",
  "explanation": [
    "Payout run is partially safe.",
    "$480000.00 is blocked before this payout run."
  ]
}
```

---

### POST /simulate/payout

Simulate a planned payout against the current payoutable balance.

```bash
curl -X POST http://localhost:8000/simulate/payout \
  -H "Content-Type: application/json" \
  -d '{"planned_payout_amount": "2000000.00"}'
```

Expected output after seeding:

```json
{
  "planned_payout_amount": "2000000.00",
  "payoutable_balance": "1930000.00",
  "shortfall": "70000.00",
  "verdict": "PARTIAL",
  "message": "Planned payout exceeds payoutable balance by $70000.00."
}
```

SAFE example (planned within balance):

```bash
curl -X POST http://localhost:8000/simulate/payout \
  -H "Content-Type: application/json" \
  -d '{"planned_payout_amount": "1000000.00"}'
```

```json
{
  "planned_payout_amount": "1000000.00",
  "payoutable_balance": "1930000.00",
  "shortfall": "0.00",
  "verdict": "SAFE",
  "message": "Planned payout of $1000000.00 is within payoutable balance."
}
```

---

### DELETE /ledger/reset

Development-only. Deletes all ledger entries.

```bash
curl -X DELETE http://localhost:8000/ledger/reset
```

```json
{"deleted": true}
```

---

## Balance formula v0

```
paper_balance =
    settled charges
  + settled settlements
  - settled payouts
  - settled refunds
  - settled fees

blocked_amount =
    pending settlements      → unsettled_funds
  + pending refunds          → refunds_in_flight
  + open reserves            → reserve_hold
  + open exceptions          → unresolved_exceptions
  + pending fees             → fees

payoutable_balance = max(paper_balance − blocked_amount, 0)

already_paid_out = settled payouts  [shown in blockers; already subtracted from paper_balance]
```

| Verdict | Condition |
|---|---|
| `SAFE` | `payoutable_balance > 0` and `blocked_amount == 0` |
| `PARTIAL` | `payoutable_balance > 0` and `blocked_amount > 0` |
| `BLOCKED` | `payoutable_balance == 0` |

---

## Project structure

```
backend/
├── app/
│   ├── main.py                   FastAPI app
│   ├── config.py                 Settings (DATABASE_URL from env)
│   ├── database.py               Engine, SessionLocal, Base, get_db
│   ├── enums.py                  LedgerSource, TransactionType, LedgerStatus, etc.
│   ├── models.py                 LedgerEntry ORM model
│   ├── schemas.py                Pydantic v2 request/response schemas
│   ├── utils/
│   │   ├── money.py              to_decimal, quantize_money, format_money
│   │   └── errors.py             HTTP error helpers
│   ├── services/
│   │   ├── balance_engine.py     BalanceEngine class + balance_engine singleton
│   │   ├── simulation_engine.py  simulate_payout function
│   │   ├── ledger_service.py     CRUD: create, list, reset
│   │   └── seed_data.py          Demo seed -> python -m app.services.seed_data
│   └── routers/
│       ├── health.py             GET /health
│       ├── ingestion.py          POST /ingest/manual, /ingest/bulk
│       ├── ledger.py             GET /ledger, DELETE /ledger/reset
│       ├── balance.py            GET /balance/payoutable
│       └── simulation.py         POST /simulate/payout
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 0001_initial_schema.py
├── tests/
│   ├── conftest.py               SQLite in-memory fixtures
│   ├── test_balance_engine.py    Balance formula + verdict logic
│   ├── test_simulation_engine.py Simulation SAFE / PARTIAL / BLOCKED
│   └── test_ingestion.py         Endpoint validation + ledger filters
├── alembic.ini
├── requirements.txt
├── pytest.ini
├── .env.example
└── README.md
```

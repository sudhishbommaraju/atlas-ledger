# Atlas Ledger

**Pre-payout decisioning system for payout-heavy platforms.**

Atlas Ledger continuously reconciles PSP, bank, payout, and ERP data to compute the true payoutable balance, explain what is blocking funds, and tell finance/payment ops exactly what money is safe to disburse before every payout run.

> Core question: *Can this company safely run payouts today, and if not, exactly why?*

---

## What Atlas Ledger Is

Atlas Ledger is **not** a generic reconciliation dashboard, accounting close software, or payout execution tool. It is a **pre-payout decisioning engine** that answers one question with precision:

- `SAFE` — full payout run is clear to proceed
- `PARTIAL` — some funds are blocked; partial payout up to payoutable balance is safe
- `BLOCKED` — do not run payouts; all funds are tied up

---

## Demo Output

After seeding, `GET /balance/payoutable` returns:

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
    "$480000.00 is blocked before this payout run.",
    "Main blockers: unsettled funds, refunds in flight, reserve holds, unresolved exceptions."
  ]
}
```

---

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL (running locally)
- Node.js 18+

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env if your Postgres credentials differ from the defaults

# Create database
createdb atlas_ledger

# Run migrations
alembic upgrade head

# Seed demo data
python -m app.services.seed_data

# Start the API server
uvicorn app.main:app --reload
```

API is available at: http://localhost:8000
Swagger docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend is available at: http://localhost:3000

---

## Running Tests

```bash
cd backend
pytest
```

Tests use SQLite in-memory — no PostgreSQL required for the test suite.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/ingest/manual` | Ingest a single ledger entry |
| POST | `/ingest/bulk` | Ingest multiple entries |
| GET | `/ledger` | List entries with filters |
| GET | `/ledger/{id}` | Get single entry |
| DELETE | `/ledger/reset` | Clear all entries (dev only) |
| GET | `/balance/payoutable` | Compute payoutable balance + verdict |
| POST | `/simulate/payout` | Simulate a planned payout run |
| GET | `/exceptions` | List open exceptions |
| PATCH | `/exceptions/{id}/resolve` | Mark exception as resolved |
| GET | `/reports/readiness` | Full payout readiness report |

---

## Balance Formula

```
paper_balance       = settled charges + settled settlements + settled adjustments
                      - settled payouts - settled refunds - settled fees

blocked_amount      = pending settlements
                    + pending refunds
                    + open reserves
                    + open exceptions
                    + pending fees

payoutable_balance  = max(paper_balance - blocked_amount, 0)

verdict:
  SAFE    if payoutable_balance > 0 and blocked_amount == 0
  PARTIAL if payoutable_balance > 0 and blocked_amount > 0
  BLOCKED if payoutable_balance == 0
```

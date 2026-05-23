# Atlas Ledger — Backend

FastAPI + SQLAlchemy 2.0 + PostgreSQL.

## Quick Start

```bash
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
createdb atlas_ledger
alembic upgrade head
python -m app.services.seed_data
uvicorn app.main:app --reload
```

## Tests

```bash
pytest
```

## Key endpoints

- `GET /balance/payoutable` — core balance + verdict
- `POST /simulate/payout` — simulate a payout amount
- `GET /reports/readiness` — full readiness report
- `GET /exceptions` — open exceptions only

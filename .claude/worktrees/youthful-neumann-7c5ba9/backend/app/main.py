from fastapi import FastAPI

from app.routers import balance, health, ingestion, ledger, simulation

app = FastAPI(
    title="Atlas Ledger",
    description=(
        "Payout decisioning backend. "
        "Answers SAFE / PARTIAL / BLOCKED before every payout run."
    ),
    version="0.1.0",
)

app.include_router(health.router)
app.include_router(ingestion.router)
app.include_router(ledger.router)
app.include_router(balance.router)
app.include_router(simulation.router)

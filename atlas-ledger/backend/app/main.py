from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health, ingestion, ledger, balance, simulation, exceptions, reports

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Pre-payout decisioning system",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(ingestion.router, prefix="/ingest", tags=["ingestion"])
app.include_router(ledger.router, prefix="/ledger", tags=["ledger"])
app.include_router(balance.router, prefix="/balance", tags=["balance"])
app.include_router(simulation.router, prefix="/simulate", tags=["simulation"])
app.include_router(exceptions.router, prefix="/exceptions", tags=["exceptions"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])

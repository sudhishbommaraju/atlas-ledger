from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import SimulatePayoutRequest, SimulatePayoutResponse
from app.services.simulation_engine import simulate_payout

router = APIRouter()


@router.post("/payout", response_model=SimulatePayoutResponse)
def simulate_payout_run(request: SimulatePayoutRequest, db: Session = Depends(get_db)):
    return simulate_payout(db, request.planned_payout_amount)

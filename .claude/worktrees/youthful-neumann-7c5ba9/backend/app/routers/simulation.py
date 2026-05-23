from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import PayoutSimulationRequest, PayoutSimulationResponse
from app.services.simulation_engine import simulate_payout

router = APIRouter(prefix="/simulate", tags=["simulation"])


@router.post("/payout", response_model=PayoutSimulationResponse)
def simulate_payout_run(
    body: PayoutSimulationRequest,
    db: Session = Depends(get_db),
) -> PayoutSimulationResponse:
    return simulate_payout(db, body.planned_payout_amount)

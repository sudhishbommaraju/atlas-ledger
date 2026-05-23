from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import BalanceResponse
from app.services.balance_engine import balance_engine

router = APIRouter(prefix="/balance", tags=["balance"])


@router.get("/payoutable", response_model=BalanceResponse)
def get_payoutable_balance(db: Session = Depends(get_db)) -> BalanceResponse:
    return balance_engine.compute_payoutable_balance(db)

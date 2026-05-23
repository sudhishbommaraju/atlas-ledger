from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import PayoutableBalanceResponse
from app.services.balance_engine import compute_balance

router = APIRouter()


@router.get("/payoutable", response_model=PayoutableBalanceResponse)
def get_payoutable_balance(db: Session = Depends(get_db)):
    return compute_balance(db)

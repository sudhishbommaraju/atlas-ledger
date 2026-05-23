from decimal import Decimal

from sqlalchemy.orm import Session

from app.enums import PayoutVerdict
from app.schemas import PayoutSimulationResponse
from app.services.balance_engine import balance_engine
from app.utils.money import ZERO, format_money, quantize_money


def simulate_payout(db: Session, planned_payout_amount: Decimal) -> PayoutSimulationResponse:
    planned = quantize_money(planned_payout_amount)
    balance = balance_engine.compute_payoutable_balance(db)
    payoutable = balance.payoutable_balance

    if payoutable == ZERO:
        verdict = PayoutVerdict.BLOCKED
        shortfall = planned
        message = "Payout is blocked. No payoutable balance available."
    elif planned <= payoutable:
        verdict = PayoutVerdict.SAFE
        shortfall = ZERO
        message = f"Planned payout of ${format_money(planned)} is within payoutable balance."
    else:
        verdict = PayoutVerdict.PARTIAL
        shortfall = quantize_money(planned - payoutable)
        message = f"Planned payout exceeds payoutable balance by ${format_money(shortfall)}."

    return PayoutSimulationResponse(
        planned_payout_amount=planned,
        payoutable_balance=payoutable,
        shortfall=shortfall,
        verdict=verdict,
        message=message,
    )

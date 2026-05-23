from decimal import Decimal
from sqlalchemy.orm import Session
from app.services.balance_engine import compute_balance
from app.enums import VerdictEnum
from app.utils.money import to_money_str, coerce_decimal, ZERO
from app.schemas import SimulatePayoutResponse


def simulate_payout(db: Session, planned_amount: Decimal) -> SimulatePayoutResponse:
    balance = compute_balance(db)
    payoutable = coerce_decimal(balance.payoutable_balance)
    planned = coerce_decimal(planned_amount)

    if payoutable == ZERO:
        verdict = VerdictEnum.BLOCKED
        shortfall = planned
        message = "Payout is fully blocked. No funds available for payout."
    elif planned <= payoutable:
        verdict = VerdictEnum.SAFE
        shortfall = ZERO
        message = "Planned payout is within safe payoutable balance."
    else:
        verdict = VerdictEnum.PARTIAL
        shortfall = planned - payoutable
        message = f"Planned payout exceeds payoutable balance by ${to_money_str(shortfall)}."

    return SimulatePayoutResponse(
        planned_payout_amount=to_money_str(planned),
        payoutable_balance=balance.payoutable_balance,
        shortfall=to_money_str(shortfall),
        verdict=verdict,
        message=message,
    )

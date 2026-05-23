from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import LedgerEntry
from app.enums import TransactionTypeEnum, StatusEnum, VerdictEnum
from app.utils.money import to_money_str, coerce_decimal, ZERO
from app.schemas import PayoutableBalanceResponse, BlockersDetail


def _sum_where(db: Session, types: list, statuses: list) -> Decimal:
    result = (
        db.query(func.coalesce(func.sum(LedgerEntry.amount), Decimal("0")))
        .filter(
            LedgerEntry.transaction_type.in_(types),
            LedgerEntry.status.in_(statuses),
        )
        .scalar()
    )
    return coerce_decimal(result)


def compute_balance(db: Session) -> PayoutableBalanceResponse:
    settled_credits = _sum_where(
        db,
        [TransactionTypeEnum.charge, TransactionTypeEnum.settlement, TransactionTypeEnum.adjustment],
        [StatusEnum.settled],
    )
    settled_debits = _sum_where(
        db,
        [TransactionTypeEnum.payout, TransactionTypeEnum.refund, TransactionTypeEnum.fee],
        [StatusEnum.settled],
    )
    paper_balance = settled_credits - settled_debits

    unsettled_funds = _sum_where(db, [TransactionTypeEnum.settlement], [StatusEnum.pending])
    refunds_in_flight = _sum_where(db, [TransactionTypeEnum.refund], [StatusEnum.pending])
    reserve_hold = _sum_where(db, [TransactionTypeEnum.reserve], [StatusEnum.open])
    unresolved_exceptions = _sum_where(db, [TransactionTypeEnum.exception], [StatusEnum.open])
    pending_fees = _sum_where(db, [TransactionTypeEnum.fee], [StatusEnum.pending])
    already_paid_out = _sum_where(db, [TransactionTypeEnum.payout], [StatusEnum.settled])

    blocked_amount = unsettled_funds + refunds_in_flight + reserve_hold + unresolved_exceptions + pending_fees
    payoutable_balance = max(paper_balance - blocked_amount, ZERO)

    if payoutable_balance > ZERO and blocked_amount == ZERO:
        verdict = VerdictEnum.SAFE
    elif payoutable_balance > ZERO:
        verdict = VerdictEnum.PARTIAL
    else:
        verdict = VerdictEnum.BLOCKED

    explanation = _build_explanation(
        verdict, payoutable_balance, blocked_amount,
        unsettled_funds, refunds_in_flight, reserve_hold, unresolved_exceptions, pending_fees,
    )

    return PayoutableBalanceResponse(
        paper_balance=to_money_str(paper_balance),
        payoutable_balance=to_money_str(payoutable_balance),
        blocked_amount=to_money_str(blocked_amount),
        blockers=BlockersDetail(
            unsettled_funds=to_money_str(unsettled_funds),
            refunds_in_flight=to_money_str(refunds_in_flight),
            reserve_hold=to_money_str(reserve_hold),
            unresolved_exceptions=to_money_str(unresolved_exceptions),
            fees=to_money_str(pending_fees),
            already_paid_out=to_money_str(already_paid_out),
        ),
        verdict=verdict,
        explanation=explanation,
    )


def _build_explanation(
    verdict: VerdictEnum,
    payoutable_balance: Decimal,
    blocked_amount: Decimal,
    unsettled_funds: Decimal,
    refunds_in_flight: Decimal,
    reserve_hold: Decimal,
    unresolved_exceptions: Decimal,
    fees: Decimal,
) -> list[str]:
    if verdict == VerdictEnum.SAFE:
        return [
            "Payout run is fully safe.",
            f"${to_money_str(payoutable_balance)} is available for payout.",
        ]
    if verdict == VerdictEnum.PARTIAL:
        blocker_names = []
        if unsettled_funds > ZERO:
            blocker_names.append("unsettled funds")
        if refunds_in_flight > ZERO:
            blocker_names.append("refunds in flight")
        if reserve_hold > ZERO:
            blocker_names.append("reserve holds")
        if unresolved_exceptions > ZERO:
            blocker_names.append("unresolved exceptions")
        if fees > ZERO:
            blocker_names.append("pending fees")
        lines = [
            "Payout run is partially safe.",
            f"${to_money_str(blocked_amount)} is blocked before this payout run.",
        ]
        if blocker_names:
            lines.append(f"Main blockers: {', '.join(blocker_names)}.")
        return lines
    return [
        "Payout run is blocked.",
        "No funds are available for payout.",
        "Resolve all blockers before running payouts.",
    ]

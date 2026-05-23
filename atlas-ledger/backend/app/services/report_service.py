from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.services.balance_engine import compute_balance
from app.services.exception_service import get_open_exceptions
from app.enums import VerdictEnum
from app.utils.money import to_money_str
from app.schemas import (
    ReadinessReportResponse,
    ReadinessReportSummary,
    ReadinessReportDecision,
    TopException,
)


def generate_readiness_report(db: Session) -> ReadinessReportResponse:
    balance = compute_balance(db)
    top_exc_entries = get_open_exceptions(db, limit=5)

    top_exceptions = [
        TopException(
            id=e.id,
            amount=to_money_str(e.amount),
            exception_type=e.exception_type,
            severity=e.severity,
            description=e.description,
        )
        for e in top_exc_entries
    ]

    can_run_full_payout = balance.verdict == VerdictEnum.SAFE

    if balance.verdict == VerdictEnum.SAFE:
        recommendation = "Safe to run full payout."
    elif balance.verdict == VerdictEnum.PARTIAL:
        recommendation = "Run partial payout only up to payoutable balance or wait for blockers to clear."
    else:
        recommendation = "Do not run payouts. Resolve all blockers first."

    return ReadinessReportResponse(
        report_name="Payout Readiness Report",
        generated_at=datetime.now(timezone.utc),
        summary=ReadinessReportSummary(
            verdict=balance.verdict,
            paper_balance=balance.paper_balance,
            payoutable_balance=balance.payoutable_balance,
            blocked_amount=balance.blocked_amount,
        ),
        blockers=balance.blockers,
        top_exceptions=top_exceptions,
        decision=ReadinessReportDecision(
            can_run_full_payout=can_run_full_payout,
            safe_amount_now=balance.payoutable_balance,
            blocked_amount=balance.blocked_amount,
            recommendation=recommendation,
        ),
    )

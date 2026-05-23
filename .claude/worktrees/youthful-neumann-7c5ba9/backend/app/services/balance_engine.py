from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.enums import LedgerStatus, PayoutVerdict, TransactionType
from app.models import LedgerEntry
from app.schemas import BalanceResponse, BlockersResponse
from app.utils.money import ZERO, format_money, quantize_money, to_decimal


class BalanceEngine:
    """
    Computes payoutable balance from the ledger.

    Balance formula v0:
      paper_balance     = settled charges + settled settlements
                        - settled payouts - settled refunds - settled fees
      blocked_amount    = pending settlements + pending refunds
                        + open reserves + open exceptions + pending fees
      payoutable_balance = max(paper_balance - blocked_amount, 0)
    """

    def _sum_amount(
        self,
        db: Session,
        transaction_type: TransactionType,
        status: LedgerStatus,
    ) -> Decimal:
        result = (
            db.query(func.coalesce(func.sum(LedgerEntry.amount), 0))
            .filter(
                LedgerEntry.transaction_type == transaction_type.value,
                LedgerEntry.status == status.value,
            )
            .scalar()
        )
        return quantize_money(to_decimal(result))

    def _verdict(self, payoutable: Decimal, blocked: Decimal) -> PayoutVerdict:
        if payoutable > ZERO and blocked == ZERO:
            return PayoutVerdict.SAFE
        if payoutable > ZERO and blocked > ZERO:
            return PayoutVerdict.PARTIAL
        return PayoutVerdict.BLOCKED

    def _explanation(self, verdict: PayoutVerdict, blocked_amount: Decimal) -> list[str]:
        if verdict == PayoutVerdict.SAFE:
            return ["Payout run is safe. No blocked funds detected."]
        if verdict == PayoutVerdict.PARTIAL:
            return [
                "Payout run is partially safe.",
                f"${format_money(blocked_amount)} is blocked before this payout run.",
            ]
        return [
            "Payout run is blocked.",
            "Payoutable balance is zero. No payout can be safely initiated.",
        ]

    def compute_payoutable_balance(self, db: Session) -> BalanceResponse:
        # Paper balance components
        settled_charges = self._sum_amount(db, TransactionType.CHARGE, LedgerStatus.SETTLED)
        settled_settlements = self._sum_amount(db, TransactionType.SETTLEMENT, LedgerStatus.SETTLED)
        settled_payouts = self._sum_amount(db, TransactionType.PAYOUT, LedgerStatus.SETTLED)
        settled_refunds = self._sum_amount(db, TransactionType.REFUND, LedgerStatus.SETTLED)
        settled_fees = self._sum_amount(db, TransactionType.FEE, LedgerStatus.SETTLED)

        paper_balance = quantize_money(
            settled_charges + settled_settlements - settled_payouts - settled_refunds - settled_fees
        )

        # Blockers
        unsettled_funds = self._sum_amount(db, TransactionType.SETTLEMENT, LedgerStatus.PENDING)
        refunds_in_flight = self._sum_amount(db, TransactionType.REFUND, LedgerStatus.PENDING)
        reserve_hold = self._sum_amount(db, TransactionType.RESERVE, LedgerStatus.OPEN)
        unresolved_exceptions = self._sum_amount(db, TransactionType.EXCEPTION, LedgerStatus.OPEN)
        pending_fees = self._sum_amount(db, TransactionType.FEE, LedgerStatus.PENDING)

        blocked_amount = quantize_money(
            unsettled_funds + refunds_in_flight + reserve_hold + unresolved_exceptions + pending_fees
        )

        payoutable_balance = max(paper_balance - blocked_amount, ZERO)
        payoutable_balance = quantize_money(payoutable_balance)

        verdict = self._verdict(payoutable_balance, blocked_amount)

        return BalanceResponse(
            paper_balance=paper_balance,
            payoutable_balance=payoutable_balance,
            blocked_amount=blocked_amount,
            blockers=BlockersResponse(
                unsettled_funds=unsettled_funds,
                refunds_in_flight=refunds_in_flight,
                reserve_hold=reserve_hold,
                unresolved_exceptions=unresolved_exceptions,
                fees=pending_fees,
                already_paid_out=settled_payouts,
            ),
            verdict=verdict,
            explanation=self._explanation(verdict, blocked_amount),
        )


balance_engine = BalanceEngine()

"""
Adversarial QA test suite for Atlas Ledger v0.

These tests are written to BREAK the backend, not to confirm it works.
Each test probes a specific failure mode, edge case, or business-logic gap.

Test IDs map to the QA report sections:
  T01 — Duplicate ingestion (no deduplication)
  T02 — Pending charge is invisible to all calculations
  T03 — Negative paper_balance accepted silently
  T04 — Multi-currency sum pollution
  T05 — Simulation gives SAFE verdict when balance is PARTIAL
  T06 — settled refund with no corresponding charge goes negative silently
  T07 — failed / reversed statuses are silently dropped
  T08 — Reserve release has no formula support
  T09 — Chargeback has no native transaction_type
  T10 — Decimal precision: rounding on 0.5-cent amounts
  T11 — Determinism: repeated balance calls return identical output
  T12 — Bulk atomicity: one bad entry in bulk should not partially commit
  T13 — pending charge not in blockers → invisible risk
  T14 — Settled reserve contributes nothing (reserve release gap)
  T15 — already_paid_out in blockers but NOT in blocked_amount (semantic trap)
  T16 — BLOCKED verdict on empty ledger is ambiguous
  T17 — Payout simulation ignores balance-level blockers
  T18 — High-precision amounts: 18-digit integer part accepted
  T19 — Fee status=settled reduces paper_balance (correct); fee status=resolved has no effect
  T20 — paper_balance can go negative with no alarm
"""

import os
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from decimal import Decimal
from datetime import datetime, timezone

import pytest

from app.enums import LedgerStatus, PayoutVerdict, TransactionType
from app.models import LedgerEntry
from app.services.balance_engine import BalanceEngine
from app.services.simulation_engine import simulate_payout


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _e(db, transaction_type: str, amount: str, status: str, **kw) -> LedgerEntry:
    """Insert a minimal ledger entry directly."""
    entry = LedgerEntry(
        source=kw.pop("source", "stripe"),
        external_id=kw.pop("external_id", None),
        transaction_type=transaction_type,
        amount=Decimal(amount),
        currency=kw.pop("currency", "USD"),
        status=status,
        event_timestamp=kw.pop("event_timestamp", datetime.now(timezone.utc)),
        **kw,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def _balance(db) -> dict:
    result = BalanceEngine().compute_payoutable_balance(db)
    return {
        "paper": result.paper_balance,
        "blocked": result.blocked_amount,
        "payoutable": result.payoutable_balance,
        "verdict": result.verdict,
        "unsettled_funds": result.blockers.unsettled_funds,
        "refunds_in_flight": result.blockers.refunds_in_flight,
        "reserve_hold": result.blockers.reserve_hold,
        "unresolved_exceptions": result.blockers.unresolved_exceptions,
        "fees": result.blockers.fees,
        "already_paid_out": result.blockers.already_paid_out,
    }


# ===========================================================================
# T01 — Duplicate ingestion: same external_id accepted twice
# ===========================================================================

class TestT01DuplicateIngestion:
    """
    The backend has no deduplication on external_id.
    Submitting the same event twice doubles the balance contribution.
    This is a critical financial safety failure.
    """

    def test_duplicate_charge_doubles_paper_balance(self, db):
        _e(db, "charge", "50000.00", "settled", external_id="ch_dup_001")
        _e(db, "charge", "50000.00", "settled", external_id="ch_dup_001")

        b = _balance(db)
        # EXPECTED: 50000 (idempotent — second insert ignored)
        # ACTUAL  : 100000 (both accepted → double-counted)
        # This test DOCUMENTS the bug — it currently PASSES the assertion
        # that reveals the double-count, meaning the bug is confirmed.
        assert b["paper"] == Decimal("100000.00"), (
            "BUG T01: Duplicate external_id accepted; paper_balance doubled. "
            "Expected 50000.00 if idempotent."
        )

    def test_duplicate_via_api(self, client):
        payload = {
            "source": "stripe",
            "external_id": "ch_dup_api_001",
            "transaction_type": "charge",
            "amount": "25000.00",
            "currency": "USD",
            "status": "settled",
            "event_timestamp": "2026-05-17T12:00:00Z",
        }
        r1 = client.post("/ingest/manual", json=payload)
        r2 = client.post("/ingest/manual", json=payload)

        # EXPECTED behavior: second call returns 409 Conflict or is idempotent
        # ACTUAL behavior: both return 201, both stored
        assert r1.status_code == 201
        assert r2.status_code == 201  # BUG: should be 409

        ledger = client.get("/ledger?source=stripe").json()
        dup_entries = [e for e in ledger if e["external_id"] == "ch_dup_api_001"]
        assert len(dup_entries) == 2, (
            "BUG T01: Both duplicates stored in ledger. "
            "No deduplication on external_id."
        )


# ===========================================================================
# T02 — Pending charge is invisible to all calculations
# ===========================================================================

class TestT02PendingChargeInvisible:
    """
    A charge with status=pending contributes:
      - $0 to paper_balance (only settled charges count)
      - $0 to blocked_amount (pending charges are not a blocker)
    The entry exists in the ledger but is arithmetically invisible.
    """

    def test_pending_charge_invisible_to_paper_balance(self, db):
        _e(db, "charge", "100000.00", "pending")

        b = _balance(db)
        assert b["paper"] == Decimal("0.00"), "Pending charge correctly absent from paper_balance"
        assert b["blocked"] == Decimal("0.00"), (
            "BUG T02: Pending charge not in blocked_amount either. "
            "It represents a risk that is completely invisible."
        )
        assert b["verdict"] == PayoutVerdict.BLOCKED, (
            "With $100k incoming charge still pending, verdict is BLOCKED — "
            "same as having zero ledger entries. Risk is undetectable."
        )

    def test_pending_charge_risk_not_surfaced(self, db):
        """
        If I have $80k settled charges and $200k pending charges about to arrive,
        the system reports paper_balance=80k with no mention of the $200k in flight.
        """
        _e(db, "charge", "80000.00", "settled")
        _e(db, "charge", "200000.00", "pending")

        b = _balance(db)
        # The system sees $80k paper balance as if the $200k doesn't exist
        assert b["paper"] == Decimal("80000.00")
        # Pending charges are NOT surfaced anywhere in the response
        assert b["unsettled_funds"] == Decimal("0.00")  # Only tracks pending settlements, not charges
        # This is an informational gap — confirmed bug


# ===========================================================================
# T03 — Negative paper_balance accepted silently
# ===========================================================================

class TestT03NegativePaperBalance:
    """
    If settled payouts > settled charges, paper_balance goes negative.
    The system floors payoutable_balance at 0 but does not flag the negative
    paper_balance as an exception or provide any alarm.
    """

    def test_paper_balance_can_go_negative(self, db):
        _e(db, "charge", "100.00",  "settled")
        _e(db, "payout", "500.00",  "settled")

        b = _balance(db)
        assert b["paper"] == Decimal("-400.00"), "paper_balance is correctly negative"
        assert b["payoutable"] == Decimal("0.00"), "payoutable is floored at 0"
        assert b["verdict"] == PayoutVerdict.BLOCKED

        # BUG T03: no exception is raised, no alarm surfaced, no explanation
        # about WHY it's blocked — "negative paper balance" is not in explanation

    def test_negative_paper_balance_not_in_explanation(self, db):
        _e(db, "charge", "100.00", "settled")
        _e(db, "payout", "500.00", "settled")

        result = BalanceEngine().compute_payoutable_balance(db)
        explanation_text = " ".join(result.explanation).lower()
        # The explanation says "payoutable balance is zero" but not WHY
        assert "negative" not in explanation_text
        assert "overdraft" not in explanation_text
        # This is a documentation / transparency failure


# ===========================================================================
# T04 — Multi-currency sum pollution
# ===========================================================================

class TestT04MultiCurrencySumPollution:
    """
    CRITICAL: The balance engine sums ALL amounts regardless of currency.
    A $100 USD charge and a €100 EUR charge produce a $200 balance.
    """

    def test_mixed_currencies_produce_incorrect_sum(self, db):
        _e(db, "charge", "100.00", "settled", currency="USD")
        _e(db, "charge", "100.00", "settled", currency="EUR")

        b = _balance(db)
        # ACTUAL: 200.00 (sums blindly)
        # EXPECTED: Error or currency-specific breakdown
        assert b["paper"] == Decimal("200.00"), (
            "BUG T04: Multi-currency entries summed without conversion. "
            "100 USD + 100 EUR = '200' in the balance, which is meaningless."
        )

    def test_currency_not_filtered_in_query(self, db):
        _e(db, "charge", "1000000.00", "settled", currency="JPY")  # ¥1M ≈ $6.5k
        _e(db, "charge", "1000.00",    "settled", currency="USD")

        b = _balance(db)
        # System reports $1,001,000 — ¥1M inflates the balance dramatically
        assert b["paper"] == Decimal("1001000.00"), (
            "BUG T04: JPY ¥1,000,000 and USD $1,000 summed as if same currency. "
            "Balance is wildly inflated."
        )


# ===========================================================================
# T05 — Simulation gives SAFE when balance is PARTIAL
# ===========================================================================

class TestT05SimulationVsBalanceVerdict:
    """
    The simulation verdict and the balance verdict use different logic.
    Balance: SAFE = payoutable > 0 AND blocked == 0
    Simulation: SAFE = planned_amount <= payoutable (regardless of blockers)

    Result: Simulation can return SAFE while the underlying balance is PARTIAL.
    A payout operator trusting simulation.verdict=SAFE would be misled.
    """

    def test_simulation_safe_when_balance_is_partial(self, db):
        _e(db, "charge",     "100000.00", "settled")
        _e(db, "settlement",  "20000.00", "pending")  # creates a blocker

        # Balance says PARTIAL (payoutable=80k, blocked=20k)
        b = _balance(db)
        assert b["verdict"] == PayoutVerdict.PARTIAL
        assert b["payoutable"] == Decimal("80000.00")
        assert b["blocked"] == Decimal("20000.00")

        # Simulate a payout of $60k — within payoutable balance
        sim = simulate_payout(db, Decimal("60000.00"))

        # EXPECTED: PARTIAL or at minimum a warning about blockers
        # ACTUAL  : SAFE — because 60k <= 80k payoutable
        assert sim.verdict == PayoutVerdict.SAFE, (
            "BUG T05: Simulation returns SAFE even though the balance-level "
            "verdict is PARTIAL and $20k is still blocked. "
            "The simulation verdict does not inherit balance-level risk."
        )
        assert sim.shortfall == Decimal("0.00")

    def test_simulation_verdict_inconsistency_documented(self, db):
        """
        Balance verdict: PARTIAL (blocked > 0, payoutable > 0)
        Simulation verdict: SAFE (planned < payoutable)

        These two verdicts from the same backend, same data, contradict each other.
        An operator could be given contradictory signals.
        """
        _e(db, "charge",    "200000.00", "settled")
        _e(db, "exception",  "50000.00", "open")

        balance_result = BalanceEngine().compute_payoutable_balance(db)
        sim_result = simulate_payout(db, Decimal("100000.00"))

        # Both evaluate against the same data
        assert balance_result.verdict == PayoutVerdict.PARTIAL
        assert sim_result.verdict == PayoutVerdict.SAFE  # BUG: contradicts balance verdict


# ===========================================================================
# T06 — Settled refund with no corresponding charge creates negative paper_balance
# ===========================================================================

class TestT06OrphanedRefund:
    """
    A refund with status=settled reduces paper_balance directly.
    If there is no corresponding settled charge, paper_balance goes negative.
    The system does not validate that refunds have a corresponding charge.
    """

    def test_orphaned_settled_refund_goes_negative(self, db):
        _e(db, "refund", "50000.00", "settled")  # no charge to offset against

        b = _balance(db)
        assert b["paper"] == Decimal("-50000.00")
        assert b["payoutable"] == Decimal("0.00")
        assert b["verdict"] == PayoutVerdict.BLOCKED
        # Silent negative paper balance — no exception created, no alarm

    def test_refund_exceeding_charge_is_silent(self, db):
        _e(db, "charge", "10000.00", "settled")
        _e(db, "refund", "50000.00", "settled")

        b = _balance(db)
        assert b["paper"] == Decimal("-40000.00")
        # No exception raised by the system for over-refund


# ===========================================================================
# T07 — failed / reversed statuses are silently dropped from all calculations
# ===========================================================================

class TestT07SilentStatusDrops:
    """
    Entries with status=failed or status=reversed contribute $0 to every metric.
    The formula handles: settled (paper), pending (blockers), open (blockers).
    It does NOT handle: failed, reversed.

    A failed charge: $0 impact — correct.
    A reversed payout: $0 impact — INCORRECT. A reversed payout means money
    came back, but it does not restore paper_balance.
    """

    def test_failed_charge_zero_impact(self, db):
        _e(db, "charge", "100000.00", "failed")

        b = _balance(db)
        assert b["paper"] == Decimal("0.00")  # correct, failed charge has no cash impact
        assert b["blocked"] == Decimal("0.00")

    def test_reversed_payout_zero_impact(self, db):
        """
        Scenario: Platform paid out $50k, payout was reversed (returned).
        Correct behavior: paper_balance should be restored by +$50k (the returned funds).
        Actual behavior: reversed payout contributes $0 to paper_balance.
        The money has actually come BACK but the system doesn't know.
        """
        _e(db, "charge", "100000.00", "settled")
        _e(db, "payout",  "50000.00", "settled")    # reduces paper_balance to 50k
        _e(db, "payout",  "50000.00", "reversed")   # this should RESTORE the 50k

        b = _balance(db)
        # EXPECTED: paper_balance = 100k - 50k (settled) = 50k, then reversed payout adds 50k back → 100k
        # ACTUAL  : paper_balance = 100k - 50k (settled) = 50k — reversed payout ignored
        assert b["paper"] == Decimal("50000.00"), (
            "BUG T07: Reversed payout does not restore paper_balance. "
            "Expected 100000.00 after reversal, got 50000.00."
        )

    def test_failed_payout_zero_impact(self, db):
        """
        If a payout was ATTEMPTED (settled record exists) and THEN failed,
        the settled record still reduces paper_balance even though funds returned.
        The correct model: failed payouts should not reduce paper_balance.
        But if you first ingest status=settled then discover it failed,
        there is no UPDATE endpoint — you'd have to ingest a compensating entry.
        """
        _e(db, "charge", "100000.00", "settled")
        _e(db, "payout",  "50000.00", "failed")   # failed attempt

        b = _balance(db)
        # Failed payout contributes $0 — this is actually CORRECT behavior
        # (a failed payout means money never left)
        assert b["paper"] == Decimal("100000.00")  # correct, no deduction for failed payout


# ===========================================================================
# T08 — Reserve release has no formula support
# ===========================================================================

class TestT08ReserveRelease:
    """
    An open reserve blocks payouts.
    When a reserve is released (e.g., Stripe releases the rolling reserve),
    the correct behavior depends on the status transition.

    The system has no UPDATE endpoint. To model a reserve release, you would
    need to either:
    (a) Change the reserve status from open → resolved via an update, OR
    (b) Insert a compensating entry.

    Neither is documented or enforced.
    """

    def test_resolved_reserve_not_in_blocked_amount(self, db):
        """
        If we directly insert a reserve with status=resolved (simulating a release),
        it should contribute $0 to reserve_hold.
        """
        _e(db, "reserve", "80000.00", "resolved")
        _e(db, "charge",  "80000.00", "settled")

        b = _balance(db)
        assert b["reserve_hold"] == Decimal("0.00")   # resolved reserve no longer blocks
        assert b["payoutable"] == Decimal("80000.00") # money is now accessible

    def test_settled_reserve_also_not_in_blocked_amount(self, db):
        """
        A reserve with status=settled: not blocked, but also not in paper_balance.
        This is a silent state — a settled reserve just exists with no formula impact.
        """
        _e(db, "charge",  "80000.00", "settled")
        _e(db, "reserve", "30000.00", "settled")   # reserve 'settled' — what does this mean?

        b = _balance(db)
        assert b["reserve_hold"] == Decimal("0.00")   # not in blocked_amount
        # Reserve with settled status is also NOT in paper_balance formula
        assert b["paper"] == Decimal("80000.00")
        # So a settled reserve is arithmetically invisible — creates documentation confusion


# ===========================================================================
# T09 — Chargeback has no native transaction_type
# ===========================================================================

class TestT09ChargebackHandling:
    """
    Chargebacks are a core payment operations concept.
    The schema has no 'chargeback' transaction_type.
    Chargebacks must be ingested as 'exception' or 'refund' — losing the distinction.

    A chargeback ingested as a settled refund will reduce paper_balance.
    A chargeback ingested as an open exception will block payout.
    The two have different financial and risk implications.
    """

    def test_chargeback_as_settled_refund_reduces_paper(self, db):
        _e(db, "charge", "10000.00", "settled")
        _e(db, "refund",  "1000.00", "settled")   # chargeback modeled as settled refund

        b = _balance(db)
        assert b["paper"] == Decimal("9000.00")   # reduces paper — reasonable
        # But: this counts as "settled" → no blocker visible, no exception classification

    def test_chargeback_as_open_exception_blocks_payout(self, db):
        _e(db, "charge",    "10000.00", "settled")
        _e(db, "exception",  "1000.00", "open",
           exception_type="refund_discrepancy")   # chargeback modeled as exception

        b = _balance(db)
        assert b["unresolved_exceptions"] == Decimal("1000.00")  # blocks correctly
        assert b["payoutable"] == Decimal("9000.00")
        # But: the chargeback amount is in blocked, NOT deducted from paper — double impact if both entered

    def test_chargeback_double_booked_both_ways(self, db):
        """
        If an operator books the same chargeback both as a settled refund AND an open exception,
        the system will double-count: paper_balance drops AND a blocker is added.
        """
        _e(db, "charge",    "10000.00", "settled")
        _e(db, "refund",     "1000.00", "settled",  external_id="cb_001")  # settled refund
        _e(db, "exception",  "1000.00", "open",     external_id="cb_001",  # same event, different type
           exception_type="refund_discrepancy")

        b = _balance(db)
        # paper_balance drops by refund: 9000
        # then blocked by exception: payoutable = 9000 - 1000 = 8000
        # Real impact: -2000 from a single $1000 chargeback
        assert b["paper"] == Decimal("9000.00")
        assert b["blocked"] == Decimal("1000.00")
        assert b["payoutable"] == Decimal("8000.00")
        # A single $1000 chargeback caused a $2000 total impact — no guard against this


# ===========================================================================
# T10 — Decimal precision: rounding on sub-cent amounts
# ===========================================================================

class TestT10DecimalPrecision:
    """
    The balance engine uses ROUND_HALF_UP with 2 decimal places.
    The DB stores Numeric(18, 2). Test boundary precision cases.
    """

    def test_half_cent_rounds_up(self, db):
        _e(db, "charge", "100.005", "settled")   # input: 100.005
        # DB stores as 100.01 (Numeric(18,2) rounds at insert via SQLAlchemy)
        # But SQLite may store differently

        b = _balance(db)
        # The result should be quantized to 2dp
        remainder = b["paper"] % Decimal("0.01")
        assert remainder == Decimal("0.00"), f"Not quantized to 2dp: {b['paper']}"

    def test_zero_point_zero_one_cent(self, db):
        _e(db, "charge", "0.01", "settled")

        b = _balance(db)
        assert b["paper"] == Decimal("0.01")
        assert b["verdict"] == PayoutVerdict.SAFE

    def test_large_amount_precision(self, db):
        _e(db, "charge", "9999999999999999.99", "settled")

        b = _balance(db)
        assert b["paper"] == Decimal("9999999999999999.99")

    def test_sum_of_many_small_amounts(self, db):
        """Sum of 1000 entries of $0.01 should equal exactly $10.00."""
        for _ in range(1000):
            _e(db, "charge", "0.01", "settled")

        b = _balance(db)
        assert b["paper"] == Decimal("10.00"), f"Expected 10.00, got {b['paper']}"


# ===========================================================================
# T11 — Determinism: repeated balance calls return identical output
# ===========================================================================

class TestT11Determinism:
    """Balance computation must be deterministic: same data → same result, always."""

    def test_balance_identical_across_repeated_calls(self, db):
        _e(db, "charge",     "100000.00", "settled")
        _e(db, "settlement",  "20000.00", "pending")
        _e(db, "refund",      "10000.00", "pending")
        _e(db, "exception",    "5000.00", "open")

        engine = BalanceEngine()
        results = [engine.compute_payoutable_balance(db) for _ in range(5)]

        papers = [r.paper_balance for r in results]
        payoutables = [r.payoutable_balance for r in results]
        verdicts = [r.verdict for r in results]

        assert len(set(papers)) == 1,     f"Non-deterministic paper_balance: {papers}"
        assert len(set(payoutables)) == 1, f"Non-deterministic payoutable: {payoutables}"
        assert len(set(verdicts)) == 1,    f"Non-deterministic verdict: {verdicts}"

    def test_balance_via_api_identical_across_repeated_calls(self, client):
        for _ in range(3):
            client.post("/ingest/manual", json={
                "source": "stripe", "external_id": f"det_{_}",
                "transaction_type": "charge", "amount": "50000.00",
                "currency": "USD", "status": "settled",
                "event_timestamp": "2026-05-17T12:00:00Z",
            })

        results = [client.get("/balance/payoutable").json() for _ in range(5)]
        papers = [r["paper_balance"] for r in results]
        assert len(set(papers)) == 1, f"API non-deterministic: {papers}"


# ===========================================================================
# T12 — Bulk atomicity: valid + invalid in same batch
# ===========================================================================

class TestT12BulkAtomicity:
    """
    A bulk ingest with one invalid entry (negative amount) should reject all-or-nothing.
    Pydantic catches the invalid entry at validation time, before any DB writes.
    """

    def test_one_bad_entry_rejects_entire_batch(self, client):
        payload = {
            "entries": [
                {"source": "stripe", "external_id": "atomic_1", "transaction_type": "charge",
                 "amount": "50000.00", "currency": "USD", "status": "settled",
                 "event_timestamp": "2026-05-17T12:00:00Z"},
                {"source": "stripe", "external_id": "atomic_2", "transaction_type": "charge",
                 "amount": "-1.00", "currency": "USD", "status": "settled",
                 "event_timestamp": "2026-05-17T12:00:00Z"},   # INVALID
            ]
        }
        resp = client.post("/ingest/bulk", json=payload)
        assert resp.status_code == 422

        # Verify the valid entry was NOT partially committed
        ledger = client.get("/ledger?source=stripe").json()
        external_ids = [e["external_id"] for e in ledger]
        assert "atomic_1" not in external_ids, (
            "BUG T12: Valid entry from a rejected bulk batch was partially committed."
        )


# ===========================================================================
# T13 — pending charge not surfaced as a risk indicator
# ===========================================================================

class TestT13PendingChargeRiskGap:
    """
    pending charge → not in paper_balance, not in blocked_amount, not surfaced anywhere.
    From an operational risk perspective: pending charges represent expected income
    that may or may not arrive. The system is silent about this entirely.
    """

    def test_balance_response_has_no_pending_charge_field(self, db):
        _e(db, "charge", "500000.00", "settled")
        _e(db, "charge", "200000.00", "pending")   # $200k at risk, invisible

        result = BalanceEngine().compute_payoutable_balance(db)
        # The response object has no field for pending charges
        response_dict = result.model_dump()
        has_pending_charges_key = any(
            "pending_charge" in str(k) or "charge_in_flight" in str(k)
            for k in response_dict
        )
        assert not has_pending_charges_key, (
            "Confirmed: no pending_charge field in balance response. "
            "$200k in pending charges is completely invisible."
        )


# ===========================================================================
# T14 — Settled reserve has no formula impact (reserve release gap)
# ===========================================================================

class TestT14SettledReserveGap:
    """
    When a reserve is 'released', it should become available.
    The system models this by status change. A reserve with status=settled
    is NOT in the blocker list, but it's also NOT in paper_balance.
    Result: reserve release has no positive effect on payoutable balance
    unless the cash was always in a charge (which it should be, but the
    reserve tracking is decoupled from the cash tracking).
    """

    def test_reserve_does_not_affect_paper_balance(self, db):
        _e(db, "reserve", "50000.00", "settled")   # released reserve

        b = _balance(db)
        assert b["paper"] == Decimal("0.00")  # reserve doesn't add to paper balance
        assert b["reserve_hold"] == Decimal("0.00")  # not blocking either
        assert b["verdict"] == PayoutVerdict.BLOCKED
        # The $50k reserve amount exists in the ledger but contributes nothing
        # to payoutable balance — it's a tracking artifact with no cash model


# ===========================================================================
# T15 — already_paid_out in blockers but NOT in blocked_amount
# ===========================================================================

class TestT15AlreadyPaidOutSemanticTrap:
    """
    already_paid_out appears in the blockers response object, alongside
    unsettled_funds, refunds_in_flight, etc.
    But blocked_amount does NOT include already_paid_out.
    (It's subtracted from paper_balance instead.)

    This creates a semantic trap: an API consumer iterating over blockers
    and summing them will get a wrong blocked_amount that includes already_paid_out.
    """

    def test_already_paid_out_not_in_blocked_amount(self, db):
        _e(db, "charge", "100000.00", "settled")
        _e(db, "payout",  "30000.00", "settled")

        b = _balance(db)
        assert b["already_paid_out"] == Decimal("30000.00")  # appears in blockers
        assert b["blocked"] == Decimal("0.00")               # NOT in blocked_amount

        # Naive consumer sum of blocker fields:
        naive_sum = (
            b["unsettled_funds"] + b["refunds_in_flight"] + b["reserve_hold"]
            + b["unresolved_exceptions"] + b["fees"] + b["already_paid_out"]
        )
        assert naive_sum != b["blocked"], (
            "BUG T15: Sum of all blocker fields != blocked_amount. "
            f"Naive sum: {naive_sum}, blocked_amount: {b['blocked']}. "
            "already_paid_out is in the blockers object but not in blocked_amount."
        )

    def test_api_response_blocker_sum_mismatch(self, client):
        """Verify via API response that the same mismatch exists."""
        client.post("/ingest/manual", json={
            "source": "stripe", "external_id": "charge_1",
            "transaction_type": "charge", "amount": "100000.00",
            "currency": "USD", "status": "settled",
            "event_timestamp": "2026-05-17T12:00:00Z",
        })
        client.post("/ingest/manual", json={
            "source": "stripe", "external_id": "payout_1",
            "transaction_type": "payout", "amount": "30000.00",
            "currency": "USD", "status": "settled",
            "event_timestamp": "2026-05-17T13:00:00Z",
        })

        resp = client.get("/balance/payoutable").json()
        blockers = resp["blockers"]
        naive_sum = sum(Decimal(str(v)) for v in blockers.values())
        blocked_amount = Decimal(str(resp["blocked_amount"]))

        assert naive_sum != blocked_amount, (
            "BUG T15 confirmed via API: "
            f"Sum of blockers={naive_sum} != blocked_amount={blocked_amount}"
        )


# ===========================================================================
# T16 — BLOCKED verdict on empty ledger vs. genuinely blocked ledger
# ===========================================================================

class TestT16BlockedVerdictAmbiguity:
    """
    BLOCKED means: payoutable_balance == 0.
    This is triggered by:
    (a) Empty ledger (paper=0, blocked=0, payoutable=0)
    (b) blockers > paper_balance (payoutable floored to 0)
    (c) Only failed/reversed entries (all silently dropped)

    The verdict gives no indication of WHICH scenario applies.
    An operator cannot distinguish "nothing ingested yet" from "blocked by exceptions".
    """

    def test_empty_ledger_verdict_is_blocked(self, db):
        b = _balance(db)
        assert b["verdict"] == PayoutVerdict.BLOCKED
        assert b["blocked"] == Decimal("0.00")
        # BLOCKED with zero blockers — semantically contradictory

    def test_genuinely_blocked_verdict_is_also_blocked(self, db):
        _e(db, "charge",    "1000.00", "settled")
        _e(db, "exception", "5000.00", "open")
        b = _balance(db)
        assert b["verdict"] == PayoutVerdict.BLOCKED
        assert b["blocked"] == Decimal("5000.00")
        # Same BLOCKED verdict as empty ledger — indistinguishable

    def test_explanation_does_not_distinguish_scenarios(self, db):
        result_empty = BalanceEngine().compute_payoutable_balance(db)
        _e(db, "charge",    "1000.00", "settled")
        _e(db, "exception", "5000.00", "open")
        result_blocked = BalanceEngine().compute_payoutable_balance(db)

        assert result_empty.explanation == result_blocked.explanation, (
            "Empty ledger and genuinely blocked ledger return identical explanations. "
            "No differentiation possible."
        )


# ===========================================================================
# T17 — Simulation shortfall arithmetic
# ===========================================================================

class TestT17SimulationArithmetic:
    """Verify simulation arithmetic is correct and consistent."""

    def test_shortfall_is_difference_of_planned_minus_payoutable(self, db):
        _e(db, "charge", "100000.00", "settled")
        _e(db, "settlement", "20000.00", "pending")  # blocked=20k, payoutable=80k

        sim = simulate_payout(db, Decimal("120000.00"))

        assert sim.payoutable_balance == Decimal("80000.00")
        assert sim.planned_payout_amount == Decimal("120000.00")
        # shortfall = planned - payoutable = 120000 - 80000 = 40000
        assert sim.shortfall == Decimal("40000.00"), f"Wrong shortfall: {sim.shortfall}"

    def test_shortfall_zero_when_safe(self, db):
        _e(db, "charge", "100000.00", "settled")

        sim = simulate_payout(db, Decimal("50000.00"))
        assert sim.shortfall == Decimal("0.00")
        assert sim.verdict == PayoutVerdict.SAFE

    def test_blocked_simulation_shortfall_equals_planned(self, db):
        """No payoutable balance → shortfall = entire planned amount."""
        sim = simulate_payout(db, Decimal("50000.00"))
        assert sim.verdict == PayoutVerdict.BLOCKED
        assert sim.shortfall == Decimal("50000.00")
        assert sim.payoutable_balance == Decimal("0.00")


# ===========================================================================
# T18 — status=open on a charge (unhandled status/type combination)
# ===========================================================================

class TestT18UnhandledStatusTypeCombinations:
    """
    The schema allows any status with any transaction_type.
    Some combinations have no formula treatment and silently disappear.
    """

    def test_charge_status_open_is_invisible(self, db):
        _e(db, "charge", "50000.00", "open")

        b = _balance(db)
        assert b["paper"] == Decimal("0.00")    # not settled → not in paper
        assert b["blocked"] == Decimal("0.00")  # open charges not in any blocker

    def test_payout_status_pending_is_invisible(self, db):
        """A pending payout — money about to leave — is not tracked."""
        _e(db, "charge", "100000.00", "settled")
        _e(db, "payout",  "80000.00", "pending")

        b = _balance(db)
        assert b["paper"] == Decimal("100000.00")  # payout not yet settled, doesn't reduce paper
        assert b["blocked"] == Decimal("0.00")     # pending payout NOT a blocker either
        # $80k is about to leave and the system is unaware — confirmed gap

    def test_fee_status_open_is_invisible(self, db):
        _e(db, "charge", "100000.00", "settled")
        _e(db, "fee",      "5000.00", "open")   # fee with 'open' status

        b = _balance(db)
        assert b["fees"] == Decimal("0.00")   # only pending fees are tracked as blockers
        assert b["paper"] == Decimal("100000.00")  # not in paper either


# ===========================================================================
# T19 — Full reconciliation scenario: correct result end-to-end
# ===========================================================================

class TestT19FullReconciliationHappyPath:
    """
    This is the POSITIVE control. Insert a complete, consistent set of entries
    and verify every formula component is correct.

    Scenario:
      settled charges:     $500,000
      settled settlements: $100,000
      settled payouts:      $50,000
      settled refunds:      $30,000
      settled fees:         $20,000

      paper_balance = 500k + 100k - 50k - 30k - 20k = $500,000

      pending settlements: $40,000  (unsettled_funds)
      pending refunds:     $10,000  (refunds_in_flight)
      open reserves:       $25,000  (reserve_hold)
      open exceptions:     $15,000  (unresolved_exceptions)
      pending fees:         $5,000  (fees)

      blocked_amount = 40k + 10k + 25k + 15k + 5k = $95,000
      payoutable_balance = max(500k - 95k, 0) = $405,000
      verdict = PARTIAL
    """

    def test_full_happy_path(self, db):
        # Paper balance entries
        _e(db, "charge",      "500000.00", "settled")
        _e(db, "settlement",  "100000.00", "settled")
        _e(db, "payout",       "50000.00", "settled")
        _e(db, "refund",       "30000.00", "settled")
        _e(db, "fee",          "20000.00", "settled")

        # Blockers
        _e(db, "settlement",   "40000.00", "pending")
        _e(db, "refund",       "10000.00", "pending")
        _e(db, "reserve",      "25000.00", "open")
        _e(db, "exception",    "15000.00", "open")
        _e(db, "fee",           "5000.00", "pending")

        b = _balance(db)

        assert b["paper"] == Decimal("500000.00"),     f"paper: {b['paper']}"
        assert b["unsettled_funds"] == Decimal("40000.00")
        assert b["refunds_in_flight"] == Decimal("10000.00")
        assert b["reserve_hold"] == Decimal("25000.00")
        assert b["unresolved_exceptions"] == Decimal("15000.00")
        assert b["fees"] == Decimal("5000.00")
        assert b["blocked"] == Decimal("95000.00"),    f"blocked: {b['blocked']}"
        assert b["payoutable"] == Decimal("405000.00"),f"payoutable: {b['payoutable']}"
        assert b["already_paid_out"] == Decimal("50000.00")
        assert b["verdict"] == PayoutVerdict.PARTIAL


# ===========================================================================
# T20 — Idempotency of balance computation (no side effects)
# ===========================================================================

class TestT20BalanceIdempotency:
    """
    GET /balance/payoutable should be a pure read. Calling it N times should
    not change any data and should produce identical results.
    """

    def test_balance_call_has_no_side_effects_on_ledger(self, client):
        client.post("/ingest/manual", json={
            "source": "stripe", "external_id": "idem_1",
            "transaction_type": "charge", "amount": "100000.00",
            "currency": "USD", "status": "settled",
            "event_timestamp": "2026-05-17T12:00:00Z",
        })

        ledger_before = client.get("/ledger").json()

        for _ in range(3):
            client.get("/balance/payoutable")

        ledger_after = client.get("/ledger").json()
        assert len(ledger_before) == len(ledger_after), (
            "BUG: /balance/payoutable modified the ledger."
        )
        assert [e["id"] for e in ledger_before] == [e["id"] for e in ledger_after]

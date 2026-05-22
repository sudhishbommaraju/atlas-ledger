import { describe, expect, it } from "vitest";
import { reconcileTransactions } from "./engine";
import type { CanonicalTransaction } from "./parser";

function tx(overrides: Partial<CanonicalTransaction>): CanonicalTransaction {
  return {
    id: "id",
    sourceFile: "test.xlsx",
    sourceName: "Internal Ledger",
    sourceType: "ledger",
    transactionId: "txn_1",
    reference: "txn_1",
    amount: 100,
    currency: "USD",
    date: "2026-01-01",
    valid: true,
    raw: {},
    ...overrides,
  };
}

describe("reconcileTransactions", () => {
  it("matches ledger and PSP records exactly", () => {
    const result = reconcileTransactions([
      tx({
        id: "ledger-1",
        sourceName: "Internal Ledger",
        sourceType: "ledger",
      }),
      tx({ id: "stripe-1", sourceName: "Stripe", sourceType: "psp" }),
    ]);

    expect(result.summary.matched).toBeGreaterThan(0);
    expect(result.summary.matchRate).toBeGreaterThan(0);
  });

  it("detects duplicates in same source", () => {
    const result = reconcileTransactions([
      tx({
        id: "a",
        sourceName: "Stripe",
        sourceType: "psp",
        reference: "dup",
      }),
      tx({
        id: "b",
        sourceName: "Stripe",
        sourceType: "psp",
        reference: "dup",
      }),
    ]);

    expect(result.summary.duplicates).toBeGreaterThan(0);
  });

  it("reduces disbursable for refunds and reserves", () => {
    const result = reconcileTransactions([
      tx({
        id: "ledger-1",
        sourceType: "ledger",
        reference: "txn_1",
        amount: 1000,
      }),
      tx({
        id: "psp-1",
        sourceType: "psp",
        sourceName: "Stripe",
        reference: "txn_1",
        amount: 1000,
      }),
      tx({
        id: "refund-1",
        sourceType: "refund",
        sourceName: "Refunds",
        reference: "refund_1",
        amount: -100,
      }),
      tx({
        id: "reserve-1",
        sourceType: "reserve",
        sourceName: "Reserve Holds",
        reference: "reserve_1",
        amount: -50,
      }),
    ]);

    expect(result.summary.disbursable).toBeGreaterThanOrEqual(0);
    expect(result.disbursableBreakdown.refunds).toBe(100);
    expect(result.disbursableBreakdown.reserves).toBe(50);
  });

  it("marks invalid transactions correctly", () => {
    const result = reconcileTransactions([
      tx({ id: "bad", valid: false, amount: 0, issue: "Missing amount" }),
    ]);

    expect(result.summary.invalid).toBe(1);
    expect(result.records[0].matchStatus).toBe("invalid");
  });

  it("returns zero match rate with no matching references", () => {
    const result = reconcileTransactions([
      tx({
        id: "a",
        sourceName: "Ledger",
        sourceType: "ledger",
        reference: "ref_a",
      }),
      tx({
        id: "b",
        sourceName: "Stripe",
        sourceType: "psp",
        reference: "ref_b",
      }),
    ]);

    expect(result.summary.unmatched).toBe(2);
  });
});

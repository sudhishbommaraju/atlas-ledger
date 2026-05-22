import type { CanonicalTransaction } from "./parser";

export type MatchStatus =
  | "matched"
  | "partial"
  | "unmatched"
  | "duplicate"
  | "timing_drift"
  | "reserve_hold"
  | "invalid";

export type ReconciledTransaction = CanonicalTransaction & {
  matchStatus: MatchStatus;
  confidence: number;
  matchedTo?: string;
  issue?: string;
};

export type ReconciliationResult = {
  records: ReconciledTransaction[];
  summary: {
    totalRecords: number;
    matched: number;
    partial: number;
    unmatched: number;
    duplicates: number;
    timingDrift: number;
    reserveHolds: number;
    invalid: number;
    matchRate: number;
    exceptions: number;
    disbursable: number;
  };
  disbursableBreakdown: {
    grossSettledFunds: number;
    fees: number;
    refunds: number;
    chargebacks: number;
    reserves: number;
    unresolvedExposure: number;
    availableDisbursable: number;
  };
};

function keyOf(txn: CanonicalTransaction): string {
  return String(txn.reference || txn.transactionId || txn.id)
    .toLowerCase()
    .trim();
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function isRefund(txn: CanonicalTransaction): boolean {
  const text =
    `${txn.sourceType} ${txn.description ?? ""} ${txn.status ?? ""}`.toLowerCase();
  return text.includes("refund") || txn.sourceType === "refund";
}

function isChargeback(txn: CanonicalTransaction): boolean {
  const text =
    `${txn.sourceType} ${txn.description ?? ""} ${txn.status ?? ""}`.toLowerCase();
  return (
    text.includes("chargeback") ||
    text.includes("dispute") ||
    txn.sourceType === "chargeback"
  );
}

function isReserve(txn: CanonicalTransaction): boolean {
  const text =
    `${txn.sourceType} ${txn.description ?? ""} ${txn.status ?? ""}`.toLowerCase();
  return (
    text.includes("reserve") ||
    text.includes("hold") ||
    txn.sourceType === "reserve"
  );
}

function dateDiffDays(a?: string, b?: string): number | null {
  if (!a || !b) return null;

  const da = new Date(a);
  const db = new Date(b);

  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return null;

  return Math.abs(da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24);
}

export function reconcileTransactions(
  transactions: CanonicalTransaction[]
): ReconciliationResult {
  const validTransactions = transactions.filter((txn) => txn.valid);

  const bySourceAndRef = new Map<string, CanonicalTransaction[]>();

  for (const txn of validTransactions) {
    const key = `${txn.sourceName.toLowerCase()}::${keyOf(txn)}`;
    bySourceAndRef.set(key, [...(bySourceAndRef.get(key) ?? []), txn]);
  }

  const duplicateKeys = new Set(
    [...bySourceAndRef.entries()]
      .filter(([, group]) => group.length > 1)
      .map(([key]) => key)
  );

  const ledger = validTransactions.filter(
    (txn) => txn.sourceType === "ledger"
  );
  const externals = validTransactions.filter(
    (txn) => txn.sourceType !== "ledger"
  );

  const records: ReconciledTransaction[] = transactions.map((txn) => {
    if (!txn.valid) {
      return {
        ...txn,
        matchStatus: "invalid" as const,
        confidence: 0,
        issue: txn.issue ?? "Invalid row",
      };
    }

    const duplicateKey = `${txn.sourceName.toLowerCase()}::${keyOf(txn)}`;
    if (duplicateKeys.has(duplicateKey)) {
      return {
        ...txn,
        matchStatus: "duplicate" as const,
        confidence: 100,
        issue: "Duplicate reference within same source",
      };
    }

    if (isReserve(txn)) {
      return {
        ...txn,
        matchStatus: "reserve_hold" as const,
        confidence: 100,
        issue: "Reserve or hold reduces disbursable funds",
      };
    }

    if (isRefund(txn)) {
      return {
        ...txn,
        matchStatus: "partial" as const,
        confidence: 95,
        issue: "Refund reduces disbursable funds",
      };
    }

    if (isChargeback(txn)) {
      return {
        ...txn,
        matchStatus: "partial" as const,
        confidence: 95,
        issue: "Chargeback reduces disbursable funds",
      };
    }

    const searchPool = txn.sourceType === "ledger" ? externals : ledger;
    const ref = keyOf(txn);

    const exact = searchPool.find(
      (other) =>
        keyOf(other) === ref &&
        other.currency === txn.currency &&
        roundMoney(other.amount) === roundMoney(txn.amount)
    );

    if (exact) {
      const days = dateDiffDays(txn.date, exact.date);

      if (days !== null && days > 1 && days <= 5) {
        return {
          ...txn,
          matchStatus: "timing_drift" as const,
          confidence: 92,
          matchedTo: exact.id,
          issue: `Settlement timing drift: ${roundMoney(days)} days`,
        };
      }

      return {
        ...txn,
        matchStatus: "matched" as const,
        confidence: 99,
        matchedTo: exact.id,
        issue: "",
      };
    }

    const feeAdjusted = searchPool.find((other) => {
      if (keyOf(other) !== ref) return false;
      const fee = Math.abs(txn.fee ?? other.fee ?? 0);
      if (!fee) return false;
      return (
        roundMoney(Math.abs(Math.abs(txn.amount - other.amount) - fee)) <= 0.05
      );
    });

    if (feeAdjusted) {
      return {
        ...txn,
        matchStatus: "partial" as const,
        confidence: 95,
        matchedTo: feeAdjusted.id,
        issue: "Matched after fee adjustment",
      };
    }

    const tolerance = searchPool.find(
      (other) =>
        keyOf(other) === ref &&
        other.currency === txn.currency &&
        Math.abs(other.amount - txn.amount) <= 0.05
    );

    if (tolerance) {
      return {
        ...txn,
        matchStatus: "matched" as const,
        confidence: 97,
        matchedTo: tolerance.id,
        issue: "Matched within amount tolerance",
      };
    }

    return {
      ...txn,
      matchStatus: "unmatched" as const,
      confidence: 0,
      issue: "No corresponding record found across uploaded sources",
    };
  });

  const breakdown = calculateDisbursable(records);

  const matched = records.filter((r) => r.matchStatus === "matched").length;
  const partial = records.filter((r) => r.matchStatus === "partial").length;
  const unmatched = records.filter((r) => r.matchStatus === "unmatched").length;
  const duplicates = records.filter(
    (r) => r.matchStatus === "duplicate"
  ).length;
  const timingDrift = records.filter(
    (r) => r.matchStatus === "timing_drift"
  ).length;
  const reserveHolds = records.filter(
    (r) => r.matchStatus === "reserve_hold"
  ).length;
  const invalid = records.filter((r) => r.matchStatus === "invalid").length;

  const totalRecords = records.length;
  const goodRecords = matched + partial + timingDrift;
  const matchRate = totalRecords
    ? roundMoney((goodRecords / totalRecords) * 100)
    : 0;
  const exceptions =
    unmatched + duplicates + timingDrift + reserveHolds + invalid;

  return {
    records,
    summary: {
      totalRecords,
      matched,
      partial,
      unmatched,
      duplicates,
      timingDrift,
      reserveHolds,
      invalid,
      matchRate,
      exceptions,
      disbursable: breakdown.availableDisbursable,
    },
    disbursableBreakdown: breakdown,
  };
}

function calculateDisbursable(records: ReconciledTransaction[]) {
  const settled = records.filter(
    (r) =>
      r.valid &&
      ["matched", "partial", "timing_drift"].includes(r.matchStatus) &&
      ["psp", "bank"].includes(r.sourceType)
  );

  const grossSettledFunds = roundMoney(
    settled
      .filter((r) => r.amount > 0)
      .reduce((sum, r) => sum + r.amount, 0)
  );

  const fees = roundMoney(
    records.reduce((sum, r) => sum + Math.abs(r.fee ?? 0), 0)
  );

  const refunds = roundMoney(
    records.filter(isRefund).reduce((sum, r) => sum + Math.abs(r.amount), 0)
  );

  const chargebacks = roundMoney(
    records
      .filter(isChargeback)
      .reduce((sum, r) => sum + Math.abs(r.amount), 0)
  );

  const reserves = roundMoney(
    records.filter(isReserve).reduce((sum, r) => {
      return sum + Math.abs(r.reserve ?? r.amount);
    }, 0)
  );

  const unresolvedExposure = roundMoney(
    records
      .filter(
        (r) =>
          r.matchStatus === "unmatched" || r.matchStatus === "duplicate"
      )
      .reduce((sum, r) => sum + Math.max(0, r.amount), 0)
  );

  const availableDisbursable = roundMoney(
    Math.max(
      0,
      grossSettledFunds -
        fees -
        refunds -
        chargebacks -
        reserves -
        unresolvedExposure
    )
  );

  return {
    grossSettledFunds,
    fees,
    refunds,
    chargebacks,
    reserves,
    unresolvedExposure,
    availableDisbursable,
  };
}

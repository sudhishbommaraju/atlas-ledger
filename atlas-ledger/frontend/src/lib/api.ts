const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface BlockersDetail {
  unsettled_funds: string;
  refunds_in_flight: string;
  reserve_hold: string;
  unresolved_exceptions: string;
  fees: string;
  already_paid_out: string;
}

export type Verdict = "SAFE" | "PARTIAL" | "BLOCKED";

export interface PayoutableBalanceResponse {
  paper_balance: string;
  payoutable_balance: string;
  blocked_amount: string;
  blockers: BlockersDetail;
  verdict: Verdict;
  explanation: string[];
}

export interface LedgerEntry {
  id: string;
  source: string;
  external_id: string | null;
  transaction_type: string;
  amount: string;
  currency: string;
  status: string;
  event_timestamp: string;
  settlement_id: string | null;
  payout_id: string | null;
  counterparty_id: string | null;
  account_id: string | null;
  exception_type: string | null;
  severity: string | null;
  description: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SimulatePayoutResponse {
  planned_payout_amount: string;
  payoutable_balance: string;
  shortfall: string;
  verdict: Verdict;
  message: string;
}

export interface ReadinessReportSummary {
  verdict: Verdict;
  paper_balance: string;
  payoutable_balance: string;
  blocked_amount: string;
}

export interface ReadinessReportDecision {
  can_run_full_payout: boolean;
  safe_amount_now: string;
  blocked_amount: string;
  recommendation: string;
}

export interface TopException {
  id: string;
  amount: string;
  exception_type: string | null;
  severity: string | null;
  description: string | null;
}

export interface ReadinessReportResponse {
  report_name: string;
  generated_at: string;
  summary: ReadinessReportSummary;
  blockers: BlockersDetail;
  top_exceptions: TopException[];
  decision: ReadinessReportDecision;
}

export const api = {
  getHealth: () => fetchJSON<HealthResponse>("/health"),
  getPayoutableBalance: () => fetchJSON<PayoutableBalanceResponse>("/balance/payoutable"),
  getLedgerEntries: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchJSON<LedgerEntry[]>(`/ledger${qs}`);
  },
  simulatePayout: (amount: string) =>
    fetchJSON<SimulatePayoutResponse>("/simulate/payout", {
      method: "POST",
      body: JSON.stringify({ planned_payout_amount: amount }),
    }),
  getExceptions: () => fetchJSON<LedgerEntry[]>("/exceptions"),
  getReadinessReport: () => fetchJSON<ReadinessReportResponse>("/reports/readiness"),
  resetLedger: () => fetchJSON("/ledger/reset", { method: "DELETE" }),
};

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Lock, TrendingUp, ArrowUpRight, RefreshCw, AlertCircle } from "lucide-react";
import {
  api,
  type PayoutableBalanceResponse,
  type LedgerEntry,
  type ReadinessReportResponse,
} from "../lib/api";
import { formatMoney } from "../lib/utils";
import Navbar from "../components/Navbar";
import MetricCard from "../components/MetricCard";
import VerdictBadge from "../components/VerdictBadge";
import BlockersBreakdown from "../components/BlockersBreakdown";
import LedgerTable from "../components/LedgerTable";
import PayoutSimulation from "../components/PayoutSimulation";
import ExceptionsPanel from "../components/ExceptionsPanel";
import ReadinessReport from "../components/ReadinessReport";

interface PageState {
  balance: PayoutableBalanceResponse | null;
  ledger: LedgerEntry[];
  exceptions: LedgerEntry[];
  report: ReadinessReportResponse | null;
  loading: boolean;
  error: string | null;
}

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay },
});

export default function Dashboard() {
  const [state, setState] = useState<PageState>({
    balance: null,
    ledger: [],
    exceptions: [],
    report: null,
    loading: true,
    error: null,
  });

  async function fetchAll() {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [balance, ledger, exceptions, report] = await Promise.all([
        api.getPayoutableBalance(),
        api.getLedgerEntries(),
        api.getExceptions(),
        api.getReadinessReport(),
      ]);
      setState({ balance, ledger, exceptions, report, loading: false, error: null });
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error:
          "Cannot reach the Atlas Ledger backend. Make sure it is running at localhost:8000 and the database is seeded.",
      }));
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Hero */}
        <motion.div {...fade(0)} className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1.5">
              Know exactly what money is safe to pay out before every payout run.
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
              Atlas Ledger reconciles PSP, bank, payout, and ERP data into one payoutable balance decision.
            </p>
          </div>
          <button
            onClick={fetchAll}
            disabled={state.loading}
            className="shrink-0 flex items-center gap-2 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${state.loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {/* Error banner */}
        {state.error && (
          <motion.div
            {...fade(0.05)}
            className="flex items-start gap-3 bg-red-900/20 border border-red-800 rounded-xl p-4"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-red-300 font-medium text-sm mb-0.5">Backend Unavailable</div>
              <div className="text-red-400/80 text-sm">{state.error}</div>
            </div>
          </motion.div>
        )}

        {/* Verdict hero card */}
        {state.balance && (
          <motion.div
            {...fade(0.1)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <div className="text-slate-500 text-sm mb-2">Payoutable Balance</div>
                <div className="text-4xl font-bold text-white mb-3">
                  {formatMoney(state.balance.payoutable_balance)}
                </div>
                <VerdictBadge verdict={state.balance.verdict} size="lg" />
              </div>
              <div className="text-right space-y-1">
                {state.balance.explanation.map((line, i) => (
                  <p key={i} className={`text-sm ${i === 0 ? "text-slate-300 font-medium" : "text-slate-500"}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Metric cards */}
        {state.balance && (
          <motion.div {...fade(0.15)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Paper Balance"
              value={formatMoney(state.balance.paper_balance)}
              icon={<DollarSign className="w-5 h-5" />}
              accent="blue"
              sub="Settled credits minus debits"
            />
            <MetricCard
              label="Payoutable Balance"
              value={formatMoney(state.balance.payoutable_balance)}
              icon={<TrendingUp className="w-5 h-5" />}
              accent="green"
              sub="Safe to disburse now"
            />
            <MetricCard
              label="Blocked Funds"
              value={formatMoney(state.balance.blocked_amount)}
              icon={<Lock className="w-5 h-5" />}
              accent="amber"
              sub="Pending release"
            />
            <MetricCard
              label="Already Paid Out"
              value={formatMoney(state.balance.blockers.already_paid_out)}
              icon={<ArrowUpRight className="w-5 h-5" />}
              accent="blue"
              sub="Settled payouts to date"
            />
          </motion.div>
        )}

        {/* Blockers + Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {state.balance && (
            <motion.div {...fade(0.2)}>
              <BlockersBreakdown blockers={state.balance.blockers} />
            </motion.div>
          )}
          <motion.div {...fade(0.25)}>
            <PayoutSimulation />
          </motion.div>
        </div>

        {/* Exceptions + Report */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div {...fade(0.3)}>
            <ExceptionsPanel exceptions={state.exceptions} />
          </motion.div>
          {state.report && (
            <motion.div {...fade(0.35)}>
              <ReadinessReport report={state.report} />
            </motion.div>
          )}
        </div>

        {/* Ledger table */}
        <motion.div {...fade(0.4)}>
          <LedgerTable entries={state.ledger} />
        </motion.div>
      </main>
    </div>
  );
}

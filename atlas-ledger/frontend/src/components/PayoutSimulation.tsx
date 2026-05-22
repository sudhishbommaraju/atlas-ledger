import { useState } from "react";
import { Play, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { api, type SimulatePayoutResponse, type Verdict } from "../lib/api";
import { formatMoney, cn } from "../lib/utils";

const verdictIcon: Record<Verdict, React.ReactNode> = {
  SAFE: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  PARTIAL: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  BLOCKED: <XCircle className="w-5 h-5 text-red-400" />,
};

const verdictBg: Record<Verdict, string> = {
  SAFE: "border-emerald-700 bg-emerald-900/20",
  PARTIAL: "border-amber-700 bg-amber-900/20",
  BLOCKED: "border-red-700 bg-red-900/20",
};

export default function PayoutSimulation() {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<SimulatePayoutResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function simulate() {
    const num = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(num) || num <= 0) {
      setError("Enter a valid positive amount.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.simulatePayout(num.toFixed(2));
      setResult(res);
    } catch {
      setError("Simulation failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full">
      <h3 className="text-slate-300 font-semibold mb-1">Payout Simulation</h3>
      <p className="text-slate-500 text-sm mb-4">
        Enter a planned payout amount to check if it is safe to run.
      </p>

      <div className="flex gap-3 mb-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && simulate()}
            placeholder="1,930,000.00"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>
        <button
          onClick={simulate}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          <Play className="w-4 h-4" />
          {loading ? "Running…" : "Simulate"}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {result && (
        <div className={cn("border rounded-xl p-4 mt-2", verdictBg[result.verdict])}>
          <div className="flex items-center gap-2 mb-2">
            {verdictIcon[result.verdict]}
            <span className="font-semibold text-slate-100 text-sm">{result.verdict}</span>
          </div>
          <p className="text-slate-300 text-sm mb-4">{result.message}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-500 text-xs mb-1">Planned</div>
              <div className="font-mono text-slate-200 font-semibold">{formatMoney(result.planned_payout_amount)}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Available</div>
              <div className="font-mono text-emerald-400 font-semibold">{formatMoney(result.payoutable_balance)}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Shortfall</div>
              <div className={cn("font-mono font-semibold", parseFloat(result.shortfall) > 0 ? "text-red-400" : "text-slate-500")}>
                {parseFloat(result.shortfall) > 0 ? formatMoney(result.shortfall) : "None"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

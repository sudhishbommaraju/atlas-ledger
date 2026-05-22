import { FileText, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { type ReadinessReportResponse, type Verdict } from "../lib/api";
import { formatMoney, formatDate } from "../lib/utils";
import VerdictBadge from "./VerdictBadge";

interface Props {
  report: ReadinessReportResponse;
}

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  if (verdict === "SAFE") return <CheckCircle className="w-5 h-5 text-emerald-400" />;
  if (verdict === "PARTIAL") return <AlertTriangle className="w-5 h-5 text-amber-400" />;
  return <XCircle className="w-5 h-5 text-red-400" />;
}

export default function ReadinessReport({ report }: Props) {
  const { summary, decision, top_exceptions } = report;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-blue-400" />
        <h3 className="text-slate-300 font-semibold">{report.report_name}</h3>
        <span className="ml-auto text-xs text-slate-600">{formatDate(report.generated_at)}</span>
      </div>

      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
        <VerdictIcon verdict={summary.verdict} />
        <div>
          <VerdictBadge verdict={summary.verdict} />
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{decision.recommendation}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800">
          <div className="text-slate-500 text-xs mb-1">Safe to pay out now</div>
          <div className="font-mono text-emerald-400 font-semibold">{formatMoney(decision.safe_amount_now)}</div>
        </div>
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800">
          <div className="text-slate-500 text-xs mb-1">Currently blocked</div>
          <div className="font-mono text-amber-400 font-semibold">{formatMoney(decision.blocked_amount)}</div>
        </div>
      </div>

      {top_exceptions.length > 0 && (
        <div>
          <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Top Exceptions</div>
          <div className="space-y-2">
            {top_exceptions.map((e) => (
              <div
                key={e.id}
                className="flex items-start justify-between text-sm p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/60"
              >
                <div className="min-w-0">
                  <span className="text-slate-400 capitalize">{e.exception_type?.replace(/_/g, " ")}</span>
                  {e.description && (
                    <p className="text-slate-600 text-xs mt-0.5 truncate max-w-xs">{e.description}</p>
                  )}
                </div>
                <span className="font-mono text-red-400 ml-3 whitespace-nowrap text-xs font-semibold">
                  {formatMoney(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

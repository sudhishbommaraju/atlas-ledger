import { AlertTriangle } from "lucide-react";
import { type LedgerEntry } from "../lib/api";
import { formatMoney, formatDate, cn } from "../lib/utils";

interface Props {
  exceptions: LedgerEntry[];
}

const severityStyle: Record<string, string> = {
  critical: "text-red-300 bg-red-900/40 border-red-700",
  high: "text-orange-300 bg-orange-900/40 border-orange-700",
  medium: "text-amber-300 bg-amber-900/40 border-amber-700",
  low: "text-yellow-300 bg-yellow-900/40 border-yellow-700",
};

export default function ExceptionsPanel({ exceptions }: Props) {
  if (exceptions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-slate-300 font-semibold mb-3">Open Exceptions</h3>
        <p className="text-emerald-400 text-sm">No open exceptions.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-orange-400" />
        <h3 className="text-slate-300 font-semibold">Open Exceptions</h3>
        <span className="ml-auto text-xs bg-red-900/40 text-red-300 border border-red-800 rounded px-2 py-0.5 font-medium">
          {exceptions.length} open
        </span>
      </div>
      <div className="space-y-3">
        {exceptions.map((e) => (
          <div key={e.id} className="border border-slate-800 rounded-lg p-3 bg-slate-950/50">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-slate-100 text-sm font-semibold">{formatMoney(e.amount)}</span>
                {e.severity && (
                  <span className={cn("text-xs border rounded px-1.5 py-0.5 capitalize", severityStyle[e.severity] ?? "text-slate-400")}>
                    {e.severity}
                  </span>
                )}
                {e.exception_type && (
                  <span className="text-xs text-slate-400 bg-slate-800 rounded px-1.5 py-0.5">
                    {e.exception_type.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <span className="text-slate-600 text-xs whitespace-nowrap shrink-0">{formatDate(e.event_timestamp)}</span>
            </div>
            {e.description && <p className="text-slate-500 text-xs leading-relaxed">{e.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

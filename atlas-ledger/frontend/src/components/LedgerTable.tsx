import { type LedgerEntry } from "../lib/api";
import { formatMoney, formatDate, cn } from "../lib/utils";

interface Props {
  entries: LedgerEntry[];
}

const statusColor: Record<string, string> = {
  settled: "text-emerald-400",
  pending: "text-amber-400",
  open: "text-orange-400",
  failed: "text-red-400",
  reversed: "text-red-400",
  resolved: "text-slate-400",
  ignored: "text-slate-500",
};

const typeColor: Record<string, string> = {
  charge: "text-emerald-300",
  settlement: "text-blue-300",
  payout: "text-violet-300",
  refund: "text-red-300",
  fee: "text-orange-300",
  reserve: "text-yellow-300",
  exception: "text-red-400",
  adjustment: "text-cyan-300",
};

export default function LedgerTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-slate-300 font-semibold mb-3">Ledger Entries</h3>
        <p className="text-slate-500 text-sm">No entries found.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-slate-300 font-semibold mb-4">
        Ledger Entries
        <span className="ml-2 text-xs text-slate-500 font-normal">({entries.length})</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              {["Source", "Type", "Amount", "Status", "Timestamp", "Description"].map((h) => (
                <th key={h} className="pb-3 pr-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pr-4 text-slate-300 capitalize">{e.source}</td>
                <td className={cn("py-3 pr-4 capitalize", typeColor[e.transaction_type] ?? "text-slate-300")}>
                  {e.transaction_type}
                </td>
                <td className="py-3 pr-4 font-mono text-slate-200">{formatMoney(e.amount)}</td>
                <td className={cn("py-3 pr-4 capitalize", statusColor[e.status] ?? "text-slate-300")}>
                  {e.status}
                </td>
                <td className="py-3 pr-4 text-slate-400 whitespace-nowrap text-xs">
                  {formatDate(e.event_timestamp)}
                </td>
                <td className="py-3 text-slate-500 text-xs max-w-xs truncate">{e.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

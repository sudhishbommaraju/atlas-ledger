import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { type BlockersDetail } from "../lib/api";
import { formatMoney } from "../lib/utils";

interface Props {
  blockers: BlockersDetail;
}

const COLORS = ["#f59e0b", "#ef4444", "#8b5cf6", "#f97316", "#3b82f6"];

const LABELS: Array<[keyof BlockersDetail, string]> = [
  ["unsettled_funds", "Unsettled Funds"],
  ["refunds_in_flight", "Refunds In Flight"],
  ["reserve_hold", "Reserve Holds"],
  ["unresolved_exceptions", "Unresolved Exceptions"],
  ["fees", "Pending Fees"],
];

export default function BlockersBreakdown({ blockers }: Props) {
  const data = LABELS.map(([key, name]) => ({
    name,
    value: parseFloat(blockers[key]),
  })).filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full">
        <h3 className="text-slate-300 font-semibold mb-3">Blockers Breakdown</h3>
        <p className="text-emerald-400 text-sm">No active blockers — all funds available.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-slate-300 font-semibold mb-4">Blockers Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
          <XAxis
            type="number"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            width={145}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v: number) => [formatMoney(v), "Blocked"]}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 8,
              color: "#cbd5e1",
            }}
            labelStyle={{ color: "#94a3b8" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

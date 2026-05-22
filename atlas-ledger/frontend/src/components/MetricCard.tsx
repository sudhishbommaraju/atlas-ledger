import { type ReactNode } from "react";
import { cn } from "../lib/utils";

interface Props {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: "blue" | "green" | "red" | "amber";
  sub?: string;
}

const accentClass: Record<NonNullable<Props["accent"]>, string> = {
  blue: "text-blue-400",
  green: "text-emerald-400",
  red: "text-red-400",
  amber: "text-amber-400",
};

export default function MetricCard({ label, value, icon, accent = "blue", sub }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <span className={accentClass[accent]}>{icon}</span>
      </div>
      <div className={cn("text-2xl font-bold", accentClass[accent])}>{value}</div>
      {sub && <div className="text-slate-500 text-xs">{sub}</div>}
    </div>
  );
}

import { type Verdict } from "../lib/api";
import { cn } from "../lib/utils";

const config: Record<Verdict, { className: string }> = {
  SAFE: { className: "bg-emerald-900/60 text-emerald-300 border-emerald-700" },
  PARTIAL: { className: "bg-amber-900/60 text-amber-300 border-amber-700" },
  BLOCKED: { className: "bg-red-900/60 text-red-300 border-red-700" },
};

interface Props {
  verdict: Verdict;
  size?: "sm" | "lg";
}

export default function VerdictBadge({ verdict, size = "sm" }: Props) {
  return (
    <span
      className={cn(
        "border rounded-md font-bold tracking-widest uppercase",
        config[verdict].className,
        size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs"
      )}
    >
      {verdict}
    </span>
  );
}

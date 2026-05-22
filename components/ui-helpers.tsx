import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    matched: "bg-green-500/10 text-green-400 border-green-500/20",
    partial: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    timing_drift: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    duplicate: "bg-red-500/10 text-red-400 border-red-500/20",
    unmatched: "bg-red-500/10 text-red-400 border-red-500/20",
    eligibility_hold: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    reserve_hold: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    invalid: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  };

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.invalid}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const toneClass = {
    neutral: "text-neutral-100",
    green: "text-green-400",
    amber: "text-amber-400",
    red: "text-red-400",
  }[tone];

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

export function WorkflowStepper({
  uploaded,
  normalized,
  matched,
  reviewed,
}: {
  uploaded: boolean;
  normalized: boolean;
  matched: boolean;
  reviewed: boolean;
}) {
  const steps = [
    { label: "Upload", done: uploaded },
    { label: "Normalize", done: normalized },
    { label: "Match", done: matched },
    { label: "Review", done: reviewed },
    { label: "Export", done: false },
  ];

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-4">
      <div className="flex items-center gap-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center gap-3">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
              step.done
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-neutral-700 bg-neutral-900 text-neutral-500"
            }`}>
              {index + 1}
            </div>
            <span className={step.done ? "text-neutral-200" : "text-neutral-500"}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="h-px flex-1 bg-neutral-800" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

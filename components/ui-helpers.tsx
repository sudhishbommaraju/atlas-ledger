import React from 'react';
import { motion } from 'framer-motion';

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    matched: "bg-green-50/50 text-green-700 border-green-200",
    partial: "bg-amber-50/50 text-amber-700 border-amber-200",
    timing_drift: "bg-amber-50/50 text-amber-700 border-amber-200",
    duplicate: "bg-orange-50/50 text-orange-700 border-orange-200",
    unmatched: "bg-red-50/50 text-red-700 border-red-200",
    eligibility_hold: "bg-amber-50/50 text-amber-700 border-amber-200",
    reserve_hold: "bg-amber-50/50 text-amber-700 border-amber-200",
    invalid: "bg-neutral-50/50 text-neutral-500 border-neutral-200",
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
  tone?: "neutral" | "green" | "amber" | "red" | "blue" | "orange";
}) {
  const toneClass = {
    neutral: "text-[#0B1220]",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
    blue: "text-[#1D4ED8]",
    orange: "text-orange-600",
  }[tone];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-[rgba(11,18,32,0.10)] bg-[#FFFFFF] p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B6472]">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-bold tracking-tight ${toneClass}`}>
        {value}
      </div>
    </motion.div>
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
    <div className="rounded-xl border border-[rgba(11,18,32,0.10)] bg-[#FFFFFF] p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center gap-3">
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs transition-colors duration-300 ${
              step.done
                ? "border-[#1D4ED8] bg-[#DBEAFE] text-[#1D4ED8] font-semibold"
                : "border-neutral-200 bg-neutral-50 text-neutral-400"
            }`}>
              {index + 1}
            </div>
            <span className={`text-sm font-medium transition-colors duration-300 ${step.done ? "text-[#0B1220]" : "text-neutral-400"}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`h-px flex-1 transition-colors duration-300 ${step.done ? "bg-[#DBEAFE]" : "bg-neutral-100"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

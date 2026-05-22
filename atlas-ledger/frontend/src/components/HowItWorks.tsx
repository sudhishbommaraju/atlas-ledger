import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Database, Calculator, Gavel } from "lucide-react";

const steps = [
  {
    number: "01", icon: Database, title: "Reconcile financial reality",
    description: "PSP, bank, payout, and ERP data flows into one canonical ledger — normalized, deduplicated, and timestamped to the millisecond.",
    detail: ["Stripe · Adyen · Braintree", "ACH · wire · FX settlements", "ERP GL reconciliation"],
    verdictDetail: false,
  },
  {
    number: "02", icon: Calculator, title: "Compute payoutable balance",
    description: "Atlas subtracts unsettled funds, reserves, fees, refunds, and unresolved exceptions from gross — producing a defensible net balance.",
    detail: ["Settlement waterfall logic", "Reserve & holdback rules", "Exception impact scoring"],
    verdictDetail: false,
  },
  {
    number: "03", icon: Gavel, title: "Decide before payouts move",
    description: "Every payout run receives a deterministic verdict — computed, auditable, and explainable. Finance teams sign off with confidence.",
    detail: ["SAFE", "PARTIAL", "BLOCKED"],
    verdictDetail: true,
  },
];

const verdictColors: Record<string, string> = { SAFE: "var(--safe)", PARTIAL: "var(--partial)", BLOCKED: "var(--blocked)" };
const verdictBg: Record<string, string> = {
  SAFE: "var(--safe-bg)", PARTIAL: "var(--partial-bg)", BLOCKED: "var(--blocked-bg)",
};
const verdictBorder: Record<string, string> = {
  SAFE: "var(--safe-border)", PARTIAL: "var(--partial-border)", BLOCKED: "var(--blocked-border)",
};

function StepCard({ step, delay, inView }: { step: typeof steps[0]; delay: number; inView: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="rounded-[24px] p-8 h-full relative overflow-hidden cursor-default"
        style={{
          background: hov ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.5)",
          border: `1px solid ${hov ? "rgba(184,155,94,0.25)" : "rgba(0,0,0,0.05)"}`,
          boxShadow: hov ? "0 12px 32px rgba(0,0,0,0.04)" : "0 2px 10px rgba(0,0,0,0.02)",
          transform: hov ? "translateY(-3px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <div className="flex items-start justify-between mb-8">
          <span className="text-[52px] font-medium select-none" style={{ color: "rgba(0,0,0,0.03)", letterSpacing: "-0.04em" }}>
            {step.number}
          </span>
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-300"
            style={{
              background: hov ? "rgba(184,155,94,0.08)" : "transparent",
              border: `1px solid ${hov ? "rgba(184,155,94,0.2)" : "rgba(0,0,0,0.05)"}`,
            }}>
            <step.icon size={18} style={{ color: hov ? "var(--accent)" : "var(--text-tertiary)" }} />
          </div>
        </div>

        <h3 className="text-[17px] font-medium mb-3" style={{ color: "var(--text-primary)", letterSpacing: "-0.025em" }}>
          {step.title}
        </h3>
        <p className="text-[14px] leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
          {step.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {step.detail.map((d) =>
            step.verdictDetail ? (
              <span key={d} className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded-[8px]"
                style={{ color: verdictColors[d], background: verdictBg[d], border: `1px solid ${verdictBorder[d]}` }}>
                <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: verdictColors[d] }}
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: d === "PARTIAL" ? 0.5 : d === "BLOCKED" ? 1 : 0 }} />
                {d}
              </span>
            ) : (
              <span key={d} className="text-[11px] font-medium px-2.5 py-1 rounded-[8px]"
                style={{ color: "var(--text-secondary)", background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}>
                {d}
              </span>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="relative py-36 overflow-hidden" style={{ zIndex: 1 }}>
      <div className="divider absolute top-0 left-0 right-0" />
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <span className="section-label">How Atlas Works</span>
          </div>
          <h2 className="text-[38px] sm:text-[46px] font-medium mb-5"
            style={{ letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
            From raw data to payout <span className="text-gradient">decision.</span>
          </h2>
          <p className="text-[16px] max-w-lg mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Three deterministic steps between your payment data and a confident, defensible payout verdict.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} delay={i * 0.12} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

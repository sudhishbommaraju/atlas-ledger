import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ShieldCheck, Activity, BookOpen, Scale, Eye, Crosshair } from "lucide-react";

const capabilities = [
  {
    icon: ShieldCheck, title: "Payout readiness",
    description: "A single verdictized status before every disbursement: SAFE, PARTIAL, or BLOCKED. No ambiguity.",
  },
  {
    icon: Eye, title: "Exception visibility",
    description: "Surface every unresolved exception — from missing bank credits to reserve drifts — before it causes a failure.",
  },
  {
    icon: Scale, title: "Audit defensibility",
    description: "Every decision is logged, explainable, and exportable. Finance reviews and regulator requests handled with confidence.",
  },
  {
    icon: Activity, title: "PSP reconciliation",
    description: "Stripe, Adyen, Braintree, and more — reconciled continuously against your bank and ERP in real time.",
  },
  {
    icon: BookOpen, title: "Operational lineage",
    description: "Trace every dollar. From PSP transaction to settled credit to payoutable balance — full operational provenance.",
  },
  {
    icon: Crosshair, title: "Settlement truth",
    description: "Know when funds are actually in your account — not when they were expected. Settlement lag surfaced automatically.",
  },
];

function CapabilityCell({ cap, i, inView }: { cap: typeof capabilities[0]; i: number; inView: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ delay: i * 0.06, duration: 0.5 }}
      className="p-8 cursor-default relative overflow-hidden"
      style={{
        borderRight: i % 3 !== 2 ? "1px solid rgba(0,0,0,0.05)" : "none",
        borderBottom: i < 3 ? "1px solid rgba(0,0,0,0.05)" : "none",
        background: hov ? "rgba(255,255,255,0.4)" : "transparent",
        transition: "background 0.3s ease",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {hov && (
        <motion.div className="absolute top-0 left-0 w-28 h-28 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: `radial-gradient(circle at top left, rgba(184,155,94,0.06), transparent)` }} />
      )}
      <div className="w-10 h-10 rounded-[14px] flex items-center justify-center mb-5 transition-all duration-300"
        style={{
          background: hov ? "rgba(184,155,94,0.08)" : "transparent",
          border: `1px solid ${hov ? "rgba(184,155,94,0.2)" : "rgba(0,0,0,0.06)"}`,
        }}>
        <cap.icon size={18} style={{ color: hov ? "var(--accent)" : "var(--text-tertiary)" }} />
      </div>
      <h3 className="text-[16px] font-medium mb-3" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{cap.title}</h3>
      <p className="text-[14px] leading-relaxed" style={{ color: hov ? "var(--text-primary)" : "var(--text-secondary)", transition: "color 0.3s ease" }}>
        {cap.description}
      </p>
    </motion.div>
  );
}

export default function WhyAtlas() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="why-atlas" ref={ref} className="relative py-36 overflow-hidden" style={{ zIndex: 1 }}>
      <div className="divider absolute top-0 left-0 right-0" />
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-xl mb-16">
          <div className="flex mb-6">
            <span className="section-label">Operational confidence</span>
          </div>
          <h2 className="text-[38px] sm:text-[46px] font-medium mb-5"
            style={{ letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
            Infrastructure built for <span className="text-gradient">payout confidence.</span>
          </h2>
          <p className="text-[16px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Atlas is not an analytics dashboard. It is the decisioning layer your payout operations team has been missing —
            operational, auditable, infrastructure-grade software.
          </p>
        </motion.div>

        <div className="mx-auto max-w-[1360px] px-6 lg:px-8 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 rounded-[24px] overflow-hidden"
             style={{ border: `1px solid rgba(0,0,0,0.08)` }}>
          {capabilities.map((cap, i) => (
            <CapabilityCell key={cap.title} cap={cap} i={i} inView={inView} />
          ))}
        </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45, duration: 0.6 }} className="mt-12 flex flex-wrap items-center justify-center gap-8">
          {["SOC 2 Ready", "Audit log on every event", "No production data required in pilot", "Finance-team first design"].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-[12px] font-medium" style={{ color: "var(--text-tertiary)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.15)" }} />
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

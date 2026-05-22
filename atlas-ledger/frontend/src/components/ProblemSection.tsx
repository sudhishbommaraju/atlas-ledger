import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const item = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] } },
};

function CompareCard({
  label, badge, badgeStyle, amount, amountColor, subtitle, bullets, bulletColor,
}: {
  label: string; badge: string; badgeStyle: React.CSSProperties;
  amount: string; amountColor: string; subtitle: string;
  bullets: string[]; bulletColor: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      style={{
        background: hov ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.6)",
        border: badgeStyle.color === "var(--blocked)"
          ? `1px solid ${hov ? "var(--blocked-border)" : "rgba(139,94,94,0.15)"}`
          : `1px solid ${hov ? "var(--safe-border)" : "rgba(115,139,106,0.15)"}`,
        boxShadow: hov ? "0 12px 36px rgba(0,0,0,0.06)" : "0 4px 16px rgba(0,0,0,0.02)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        borderRadius: 24, padding: 28, position: "relative", overflow: "hidden",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--text-tertiary)" }}>{label}</span>
        <span className="text-[9px] px-2 py-0.5 rounded-[8px] font-bold tracking-wide uppercase" style={badgeStyle}>{badge}</span>
      </div>
      <div className="text-[36px] font-semibold tabular-nums mb-1.5" style={{ color: amountColor, letterSpacing: "-0.04em" }}>{amount}</div>
      <div className="text-[14px] mb-6" style={{ color: "var(--text-secondary)" }}>{subtitle}</div>
      <div className="space-y-3">
        {bullets.map((b) => (
          <div key={b} className="flex items-center gap-3 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: bulletColor }} />
            {b}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="problem" ref={ref} className="relative py-36 overflow-hidden" style={{ zIndex: 1 }}>
      <div className="divider absolute top-0 left-0 right-0" />
      <div className="relative mx-auto max-w-[1000px] px-6 lg:px-8">
        <motion.div variants={container} initial="hidden" animate={inView ? "visible" : "hidden"} className="text-center mb-20">
          <motion.div variants={item} className="flex justify-center mb-6">
            <span className="section-label">The balance gap</span>
          </motion.div>
          <motion.h2 variants={item} className="text-[38px] sm:text-[46px] lg:text-[54px] font-medium mb-6"
            style={{ letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
            Your bank balance is not<br />
            <span className="text-gradient pr-1">your payoutable balance.</span>
          </motion.h2>
          <motion.p variants={item} className="text-[16px] max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Payments settle late. Refunds stay in flight. Reserves change without notice.
            Every one of these variables creates a gap between what you think you can pay out
            and what is actually safe to move.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}>
            <CompareCard
              label="What you see" badge="Misleading"
              badgeStyle={{ color: "var(--blocked)", background: "rgba(140,74,74,0.06)" }}
              amount="$2,410,000" amountColor="var(--text-primary)"
              subtitle="Bank account balance"
              bulletColor="var(--blocked)"
              bullets={["Unsettled PSP funds mixed in", "Pending refunds not deducted", "Reserve changes not reflected", "Unresolved exceptions hidden"]}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}>
            <CompareCard
              label="What Atlas computes" badge="True"
              badgeStyle={{ color: "var(--safe)", background: "rgba(62,107,82,0.06)" }}
              amount="$1,930,000" amountColor="var(--safe)"
              subtitle="Payoutable balance — safe to disburse"
              bulletColor="var(--safe)"
              bullets={["All settlements reconciled", "Refunds and reserves deducted", "Fee exposure accounted for", "Exceptions surfaced and blocked"]}
            />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.46, duration: 0.6 }} className="flex justify-center">
          <a href="#how-it-works"
            className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")}>
            See how Atlas computes the truth
            <ArrowRight size={13} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

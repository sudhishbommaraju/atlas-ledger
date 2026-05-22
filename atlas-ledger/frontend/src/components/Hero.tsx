import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center overflow-hidden pt-28 pb-8 lg:pt-36 lg:pb-12"
      style={{ zIndex: 1 }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(184,155,94,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[880px] px-6 md:px-10 text-center z-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-5"
        >
          <span className="section-label">Payout infrastructure</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="text-[40px] sm:text-[52px] lg:text-[58px] font-medium leading-[1.06] mb-5 tracking-tight max-w-[820px] mx-auto"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.045em" }}
        >
          The financial operating system
          <br />
          <span className="text-gradient font-normal">for payout operations.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.85 }}
          className="text-[15px] sm:text-[17px] leading-relaxed mb-8 max-w-[540px] mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Reconcile fragmented financial systems, determine disbursable funds, route approvals,
          and execute payout runs — with one operational ledger trusted to move billions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a href="#demo" className="btn-primary px-6 py-2.5">
            Book a readiness demo <ArrowRight size={14} style={{ opacity: 0.75 }} />
          </a>
          <a href="#design-partners" className="btn-ghost px-5 py-2.5 text-[13px]">
            Apply for access <ChevronRight size={14} style={{ opacity: 0.45 }} />
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-[11px] uppercase tracking-[0.16em] font-medium"
          style={{ color: "var(--text-tertiary)" }}
        >
          Institutional · Operational · Auditable
        </motion.p>
      </div>
    </section>
  );
}

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function DesignPartners() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="design-partners"
      ref={ref}
      className="relative py-36 overflow-hidden"
      style={{ background: "var(--ink-2)" }}
    >
      {/* Warm champagne diffusion */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 55% at 50% 95%, rgba(184,155,94,0.06) 0%, transparent 65%)",
      }} />

      {/* Dot grid — very quiet */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />

      <div className="divider absolute top-0 left-0 right-0" />

      <div id="demo" className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="flex justify-center mb-8"
        >
          <span className="section-label">
            Design Partners · 2–3 spots remaining
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[36px] sm:text-[44px] lg:text-[52px] font-medium mb-7"
          style={{ letterSpacing: "-0.04em", color: "var(--text-primary)" }}
        >
          Still running payout<br />
          decisions through{" "}
          <span className="text-gradient">spreadsheets?</span>
        </motion.h2>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[16px] leading-relaxed mb-10 max-w-lg mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Atlas is onboarding a limited number of payout-heavy platforms to test
          the next generation of payout readiness infrastructure. You get early
          access, direct product influence, and a reconciled payout readiness
          signal before launch.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          <a id="apply-partner-cta" href="#" className="btn-primary px-6 py-3">
            Apply for access <ArrowRight size={14} />
          </a>
          <a id="book-demo-cta" href="#" className="btn-ghost px-6 py-3">
            Book demo <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </a>
        </motion.div>

        {/* Trust items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          {[
            "No production data required",
            "Direct access to founders",
            "Shaped by real payout operations",
          ].map((item) => (
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

import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import { ChevronDown } from "lucide-react";

const navLinks = ["Product", "Platform", "Solutions", "Resources", "Company"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 24));
    return () => unsub();
  }, [scrollY]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 px-4"
    >
      <motion.div
        className="w-full max-w-6xl flex items-center justify-between px-4 py-2.5 rounded-[8px]"
        style={{
          background: scrolled ? "rgba(247,245,242,0.85)" : "transparent",
          border: `1px solid ${scrolled ? "rgba(0,0,0,0.08)" : "transparent"}`,
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.03)" : "none",
          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div
            className="w-6 h-6 rounded-[4px] flex items-center justify-center"
            style={{
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 2L12.5 11.5H1.5L7 2Z" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M4.5 8.5H9.5" stroke="var(--text-primary)" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          <span
            className="text-[13px] font-semibold tracking-tight uppercase"
            style={{ color: "var(--text-primary)", letterSpacing: "0.04em" }}
          >
            Atlas Ledger
          </span>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavItem key={link} label={link} />
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <a
            href="#/reconciliation"
            id="try-reconciliation-nav"
            className="btn-ghost"
            style={{ padding: "6px 14px", fontSize: "11px", letterSpacing: "0.02em" }}
          >
            Try Reconciliation
          </a>
          <a
            href="#demo"
            id="book-demo-nav"
            className="btn-primary"
            style={{ padding: "6px 14px", fontSize: "11px", letterSpacing: "0.02em" }}
          >
            Book demo
          </a>
        </div>
      </motion.div>
    </motion.header>
  );
}

function NavItem({ label }: { label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      className="relative nav-link flex items-center gap-1"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
      <motion.span animate={{ rotate: hov ? 180 : 0 }} transition={{ duration: 0.18 }}>
        <ChevronDown size={10} style={{ opacity: 0.4 }} />
      </motion.span>
    </button>
  );
}

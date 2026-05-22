import { ArrowRight } from "lucide-react";

const footerLinks = {
  Product:  ["Payout Readiness", "Ledger", "Exceptions", "Simulations", "Reports"],
  Platform: ["Integrations", "API Reference", "Security", "Status"],
  Company:  ["About", "Blog", "Design Partners", "Contact"],
  Legal:    ["Privacy", "Terms", "Security"],
};

export default function Footer() {
  return (
    <footer
      className="relative"
      style={{
        background: "var(--ink)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
        {/* Top row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-9 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
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
              <span className="text-[13px] font-semibold tracking-tight uppercase" style={{ color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                Atlas Ledger
              </span>
            </div>
            <p className="text-[13px] leading-relaxed max-w-xs" style={{ color: "var(--text-secondary)" }}>
              The operating layer for modern payouts. Financial certainty before capital moves.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks)
            .filter(([k]) => k !== "Legal")
            .map(([heading, links]) => (
              <div key={heading}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-4"
                  style={{ color: "var(--text-tertiary)" }}>
                  {heading}
                </div>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[13px] transition-colors duration-200"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")
                        }
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            © 2026 Atlas Ledger, Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {footerLinks.Legal.map((link) => (
              <a
                key={link}
                href="#"
                className="text-[12px] transition-colors duration-200"
                style={{ color: "var(--text-tertiary)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-tertiary)")
                }
              >
                {link}
              </a>
            ))}
          </div>

          <a
            href="#demo"
            className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-200"
            style={{ color: "var(--accent)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)")
            }
          >
            Book a demo
            <ArrowRight size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}

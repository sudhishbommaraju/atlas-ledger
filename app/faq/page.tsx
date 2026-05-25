'use client'
import { useState, useMemo } from 'react'
import AtlasNav from '@/components/atlas/AtlasNav'
import AtlasFooter from '@/components/atlas/AtlasFooter'
import PageCurtain from '@/components/atlas/PageCurtain'
import Link from 'next/link'

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const GROUPS = [
  {
    id: 'g1',
    label: 'PRODUCT',
    items: [
      {
        id: 'g1-q1',
        q: 'What does Atlas actually do?',
        a: 'Atlas is a continuous operational control layer for payout-heavy companies. It reads from Stripe, your bank, and your ERP in real time, builds a canonical model of every dollar in flight, and detects + autonomously remediates drift — settlement mismatches, missing payouts, duplicates, timing skew — before unsafe capital moves.',
      },
      {
        id: 'g1-q2',
        q: 'How is Atlas different from a reconciliation tool?',
        a: 'Reconciliation tools work after the fact, in nightly batches. Atlas runs continuously, with sub-second drift detection, and is empowered to take action — freezing payouts, pausing channels, requiring approvals — not just produce a report.',
      },
      {
        id: 'g1-q3',
        q: 'What sources does Atlas read from?',
        a: 'Payment processors (Stripe, Adyen, Braintree), bank aggregators (Plaid, Mercury, direct ACH), and ERPs (NetSuite, Sage Intacct, QuickBooks Online). Custom internal systems can be added via the universal connector API.',
      },
      {
        id: 'g1-q4',
        q: 'Does Atlas move money?',
        a: 'No. Atlas is read-only by design. It never holds funds, never initiates payouts, and never has write credentials to any source. When Atlas "freezes a payout," it does so by calling your processor\'s native freeze endpoint with a scoped action token, on your behalf, with your audit-logged consent.',
      },
    ],
  },
  {
    id: 'g2',
    label: 'SECURITY',
    items: [
      {
        id: 'g2-q1',
        q: 'Where is data stored?',
        a: 'Atlas runs on AWS with primary in us-east-1 and EU-resident tenants pinned to eu-west-1. Data at rest is envelope-encrypted with per-tenant KEKs in AWS KMS.',
      },
      {
        id: 'g2-q2',
        q: 'Who can access my data internally?',
        a: 'Nobody, by default. Every row is encrypted with a per-tenant key Atlas engineers cannot decrypt without a break-glass action that\'s logged, audited, and surfaced to your security contact within 5 minutes.',
      },
      {
        id: 'g2-q3',
        q: 'What about audit and compliance?',
        a: 'Atlas is SOC 2 Type II and ISO 27001 certified. Our trust center documents all sub-processors, retention policies, and incident-response procedures. We sign DPAs and BAAs on request.',
      },
    ],
  },
  {
    id: 'g3',
    label: 'INTEGRATION',
    items: [
      {
        id: 'g3-q1',
        q: 'How long does setup take?',
        a: 'Most tenants complete the integration in 30–90 minutes. OAuth handshakes with Stripe + Plaid take ~5 minutes each; ERP connector setup is the longest step (usually a single engineering session).',
      },
      {
        id: 'g3-q2',
        q: 'Do you support self-hosted deployments?',
        a: 'Yes — Atlas Sovereign is available for tenants with regulatory or jurisdictional constraints. Sovereign runs the same control plane inside your VPC with a quarterly bill-of-materials and signed binaries.',
      },
      {
        id: 'g3-q3',
        q: "What's the SLA?",
        a: 'Standard tier targets 99.95% control-plane uptime and <1s drift detection at p95. Enterprise tier includes 99.99% control-plane availability and a dedicated incident channel.',
      },
    ],
  },
  {
    id: 'g4',
    label: 'PRICING',
    items: [
      {
        id: 'g4-q1',
        q: 'How is Atlas priced?',
        a: 'Per observed payout volume, with a flat platform fee. Pricing scales linearly through $50M / month, then steps down. We do not charge for additional source integrations or seats.',
      },
      {
        id: 'g4-q2',
        q: 'Is there a free trial?',
        a: 'We run a 30-day shadow-mode trial: Atlas observes your flows in read-only-no-action mode, surfaces what it would have flagged, and you decide whether to enable autonomous remediation at the end. The trial is included for any waitlisted tenant.',
      },
    ],
  },
]

export default function FaqPage() {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>('g1-q1')
  const [cat, setCat] = useState('all')

  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    return GROUPS.map(g => ({
      ...g,
      items: g.items.filter(it =>
        (cat === 'all' || cat === g.id) &&
        (!q || it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q))
      ),
    })).filter(g => g.items.length > 0)
  }, [q, cat])

  const total = GROUPS.reduce((n, g) => n + g.items.length, 0)
  const shown = filtered.reduce((n, g) => n + g.items.length, 0)

  return (
    <>
      <div className="bg-grid" />
      <PageCurtain />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--canvas)', minHeight: '100vh' }}>
        <AtlasNav />

        {/* Hero */}
        <section style={{ padding: '96px 0 56px', position: 'relative' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="rise" style={{ marginBottom: 24 }}>
              <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>ANSWERS · UPDATED MAY 2026</span>
            </div>
            <h1 className="rise" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 7vw, 84px)',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-2px',
              maxWidth: 900,
              margin: 0,
              animationDelay: '0.05s',
            }}>
              Atlas, explained.
            </h1>
            <p className="rise" style={{
              marginTop: 28, maxWidth: 640, color: 'var(--body)',
              fontSize: 18, lineHeight: '28px', animationDelay: '0.1s',
            }}>
              Operator questions, security questions, and the boring contract ones. If you can&apos;t find what you need, ask us directly — we&apos;ll add the answer here.
            </p>
          </div>
        </section>

        {/* Search + filter */}
        <section style={{ padding: '0 0 24px' }}>
          <div className="container" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--body-mid)', pointerEvents: 'none' }}>
                <svg viewBox="0 0 16 16" width={16} height={16} fill="none">
                  <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="atlas-input"
                placeholder="Search the FAQ…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft: 44 }}
              />
            </div>
            <div className="seg">
              <button data-on={cat === 'all' ? 'true' : undefined} onClick={() => setCat('all')}>ALL</button>
              {GROUPS.map(g => (
                <button key={g.id} data-on={cat === g.id ? 'true' : undefined} onClick={() => setCat(g.id)}>{g.label}</button>
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
              {shown} / {total} ANSWERS
            </span>
          </div>
        </section>

        {/* Accordion groups */}
        <section style={{ padding: '32px 0 80px' }}>
          <div className="container">
            {filtered.length === 0 && (
              <div className="atlas-card" style={{ padding: 40, textAlign: 'center' }}>
                <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>NO RESULTS</span>
                <p style={{ marginTop: 14, color: 'var(--body-mid)' }}>
                  Nothing matches &ldquo;{query}&rdquo;. Try fewer terms, or contact us — we&apos;ll write the answer.
                </p>
              </div>
            )}

            {filtered.map(g => (
              <div key={g.id} style={{ marginBottom: 48 }}>
                <div style={{ marginBottom: 12 }}>
                  <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>{g.label}</span>
                </div>
                <div>
                  {g.items.map(it => (
                    <div key={it.id} className="faq-item" data-open={openId === it.id ? 'true' : undefined}>
                      <button
                        className="faq-trigger"
                        onClick={() => setOpenId(openId === it.id ? null : it.id)}
                      >
                        <span>{it.q}</span>
                        <span className="faq-icon" style={{ flexShrink: 0, color: 'var(--body-mid)' }}>
                          <PlusIcon size={18} />
                        </span>
                      </button>
                      <div className="faq-body">
                        <div>
                          <div className="faq-content">{it.a}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--hairline)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="atlas-card" style={{ padding: 36 }}>
              <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>STILL CURIOUS?</span>
              <h2 style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.8px' }}>
                Book a 30-minute walkthrough.
              </h2>
              <p style={{ marginTop: 14, color: 'var(--body)', fontSize: 14, lineHeight: '22px' }}>
                A founding engineer will walk you through the dashboard with one of your own data sources connected in shadow mode.
              </p>
              <div style={{ marginTop: 24 }}>
                <a href="mailto:team@atlasfinancial.io" className="atlas-btn" style={{ gap: 8 }}>
                  Schedule call <ArrowIcon size={13} />
                </a>
              </div>
            </div>
            <div className="atlas-card" style={{ padding: 36 }}>
              <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>READY TO BUILD?</span>
              <h2 style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.8px' }}>
                Join the waitlist.
              </h2>
              <p style={{ marginTop: 14, color: 'var(--body)', fontSize: 14, lineHeight: '22px' }}>
                Invitation-only access for payout operations teams. We onboard one cohort every two weeks.
              </p>
              <div style={{ marginTop: 24 }}>
                <Link href="/waitlist" className="atlas-btn atlas-btn--primary" style={{ gap: 8 }}>
                  Join waitlist <ArrowIcon size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <AtlasFooter />
      </div>
    </>
  )
}

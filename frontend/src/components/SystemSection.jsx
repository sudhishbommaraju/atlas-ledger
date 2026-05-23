import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    n: '01',
    id: 'ingest',
    label: 'Ingest',
    title: 'Universal source connector',
    body: 'Accepts CSV, JSON, XML, webhooks, and direct API feeds. Normalizes schema, timestamp, and currency across all PSPs in one pass.',
    tags: ['Stripe', 'Adyen', 'Braintree', 'Bank API', 'FX Ledger'],
    metric: { label: 'Sources ingested', val: '2,847 rows', sub: '< 200ms' },
    color: 'var(--gold)',
  },
  {
    n: '02',
    id: 'reconcile',
    label: 'Reconcile',
    title: 'Row-level match engine',
    body: 'Every transaction cross-referenced against settlements, refunds, reserves, and fee schedules. Mismatches surfaced with root cause.',
    tags: ['Exact match', 'Fuzzy match', 'Reserve detection', 'Fee validation'],
    metric: { label: 'Match accuracy', val: '99.8%', sub: '2 exceptions' },
    color: 'var(--sage)',
  },
  {
    n: '03',
    id: 'determine',
    label: 'Determine',
    title: 'Balance computation engine',
    body: 'Computes verified payoutable balance: Paper − (settlements + reserves + refunds + exceptions + fees). Deterministic. Auditable.',
    tags: ['Paper balance', 'Reserve hold', 'Exception carve-out', 'Fee netting'],
    metric: { label: 'Verdict latency', val: '< 800ms', sub: 'end-to-end' },
    color: 'var(--gold)',
  },
  {
    n: '04',
    id: 'approve',
    label: 'Approve',
    title: 'Operator approval gate',
    body: 'SAFE payouts auto-execute. PARTIAL payouts queue for review. BLOCKED payouts halt with exception detail and suggested resolution.',
    tags: ['Auto-approve', 'Manual review', 'RBAC controls', 'Audit trail'],
    metric: { label: 'Auto-resolve rate', val: '94%', sub: 'of all payouts' },
    color: 'var(--amber)',
  },
  {
    n: '05',
    id: 'execute',
    label: 'Execute',
    title: 'Multi-rail payout engine',
    body: 'Routes to ACH, Wire, or SWIFT based on amount, jurisdiction, and SLA. Confirmation codes returned. Ledger updated immutably.',
    tags: ['ACH', 'Wire', 'SWIFT', 'Webhook notify', 'Ledger finalize'],
    metric: { label: 'Settlement speed', val: 'Same day', sub: 'ACH & Wire' },
    color: 'var(--sage)',
  },
]

function StepDetail({ step }) {
  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'var(--elevated)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: '28px 28px',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)' }}>{step.n}</div>
        <div style={{ width: 1, height: 14, background: 'var(--line-2)' }} />
        <div style={{
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: step.color,
        }}>{step.label}</div>
      </div>

      <div style={{
        fontSize: 'clamp(1.1rem, 1.5vw, 1.4rem)',
        fontWeight: 700,
        color: 'var(--chalk)',
        letterSpacing: '-0.02em',
        marginBottom: 12,
        lineHeight: 1.2,
      }}>{step.title}</div>

      <p style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.65, marginBottom: 24 }}>
        {step.body}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
        {step.tags.map(tag => (
          <span key={tag} className="mono badge" style={{
            fontSize: '0.55rem', padding: '3px 9px',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--silver)',
            border: '1px solid var(--line-2)',
          }}>{tag}</span>
        ))}
      </div>

      {/* Metric */}
      <div style={{
        padding: '16px 18px',
        background: `${step.color}0f`,
        border: `1px solid ${step.color}28`,
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--stone)' }}>{step.metric.label}</span>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: step.color }}>{step.metric.val}</div>
          <div className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)' }}>{step.metric.sub}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function SystemSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState(0)

  return (
    <section ref={ref} className="section" style={{ background: 'var(--base)', position: 'relative', overflow: 'hidden' }}>
      {/* Grid */}
      <div className="grid-dark" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Ambient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 60% at 50% 100%, rgba(107,158,134,0.06) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 64px' }}
        >
          <div className="label-gold" style={{ marginBottom: 16 }}>The System</div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 700,
            color: 'var(--chalk)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 16,
          }}>
            Five stages.<br />One verified decision.
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--stone)', lineHeight: 1.7 }}>
            A deterministic pipeline that transforms raw settlement data into a mathematically-verified payout authorization.
          </p>
        </motion.div>

        {/* Step nav + detail */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Left — step list */}
          <div style={{
            background: 'var(--raised)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {STEPS.map((step, i) => {
              const isActive = i === active
              return (
                <motion.button
                  key={step.id}
                  onClick={() => setActive(i)}
                  whileHover={{ background: 'rgba(255,255,255,0.025)' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    padding: '16px 20px',
                    background: isActive ? 'rgba(198,166,107,0.08)' : 'transparent',
                    borderBottom: i < STEPS.length - 1 ? '1px solid var(--line)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s ease',
                    position: 'relative',
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeStep"
                      style={{
                        position: 'absolute',
                        left: 0, top: 0, bottom: 0,
                        width: 2,
                        background: step.color,
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  )}

                  {/* Step number */}
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: isActive ? `${step.color}1a` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? step.color + '40' : 'var(--line-2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.25s ease',
                  }}>
                    <span className="mono" style={{
                      fontSize: '0.58rem', fontWeight: 700,
                      color: isActive ? step.color : 'var(--stone)',
                    }}>{step.n}</span>
                  </div>

                  {/* Label */}
                  <div>
                    <div style={{
                      fontSize: '0.8rem', fontWeight: 600,
                      color: isActive ? 'var(--chalk)' : 'var(--stone)',
                      letterSpacing: '-0.01em',
                      transition: 'color 0.2s ease',
                    }}>{step.label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--dust)', marginTop: 2 }}>{step.metric.val}</div>
                  </div>

                  {/* Arrow */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ marginLeft: 'auto', color: step.color, fontSize: '0.7rem' }}
                    >→</motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Right — step detail */}
          <div style={{ minHeight: 340 }}>
            <AnimatePresence mode="wait">
              <StepDetail key={STEPS[active].id} step={STEPS[active]} />
            </AnimatePresence>
          </div>
        </div>

        {/* Flow connector line at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 48,
            padding: '20px 24px',
            background: 'var(--raised)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none', gap: 0 }}>
              <motion.button
                onClick={() => setActive(i)}
                whileHover={{ scale: 1.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  border: 'none', cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: active === i ? `${step.color}12` : 'transparent',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: active === i ? step.color : 'var(--line-3)',
                  transition: 'background 0.25s ease',
                  boxShadow: active === i ? `0 0 8px ${step.color}` : 'none',
                }} />
                <span className="mono" style={{
                  fontSize: '0.6rem',
                  color: active === i ? step.color : 'var(--stone)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s ease',
                }}>{step.label}</span>
              </motion.button>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: 'var(--line)', margin: '0 4px' }} />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

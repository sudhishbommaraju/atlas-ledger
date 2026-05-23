import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const CHAOS_ITEMS = [
  { label: 'Stripe CSV', status: 'delayed', val: '+$842,000', color: 'var(--amber)', note: '4h delayed' },
  { label: 'Adyen Batch', status: 'mismatch', val: '+$1,240,000', color: 'var(--scarlet)', note: 'fee mismatch' },
  { label: 'Refund Export', status: 'pending', val: '−$128,000', color: 'var(--amber)', note: 'unmatched' },
  { label: 'Reserve Hold', status: 'blocked', val: '−$480,000', color: 'var(--scarlet)', note: 'locked' },
  { label: 'Bank Statement', status: 'missing', val: '+$620,000', color: 'var(--stone)', note: 'not received' },
  { label: 'FX Ledger', status: 'partial', val: '+$214,000', color: 'var(--amber)', note: 'partial match' },
]

const PAIN_POINTS = [
  {
    n: '01',
    title: 'Spreadsheet reconciliation',
    body: 'Finance teams manually reconcile PSP reports against bank statements. Errors compound. Settlements disappear.',
  },
  {
    n: '02',
    title: 'Frozen payout cycles',
    body: 'A single mismatch freezes the entire payout queue. Operations teams spend days finding a $200 discrepancy.',
  },
  {
    n: '03',
    title: 'No audit trail',
    body: 'Decisions made in email threads and Slack DMs. Zero immutable record of who approved what and when.',
  },
  {
    n: '04',
    title: 'Multi-PSP chaos',
    body: 'Stripe, Adyen, Braintree, and 6 internal ledgers each use different schemas, timestamps, and rounding.',
  },
]

function ChaosCard({ item, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ background: 'rgba(255,255,255,0.025)', borderColor: 'var(--line-2)', y: -2 }}
      style={{
        background: 'var(--elevated)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'default',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: item.color, flexShrink: 0,
          boxShadow: `0 0 6px ${item.color}`,
        }} />
        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--silver)' }}>{item.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--chalk)' }}>{item.val}</span>
        <span className="mono badge" style={{
          fontSize: '0.52rem', padding: '2px 7px',
          background: `${item.color}18`, color: item.color,
          border: `1px solid ${item.color}30`,
        }}>{item.note}</span>
      </div>
    </motion.div>
  )
}

export default function ProblemSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="section" style={{ background: 'var(--raised)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient noise */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 0% 50%, rgba(168,74,66,0.05) 0%, transparent 70%)',
      }} />

      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 540, marginBottom: 72 }}
        >
          <div className="label-gold" style={{ marginBottom: 16 }}>The Problem</div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 700,
            color: 'var(--chalk)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 20,
          }}>
            Finance operations<br />built on fragile glue.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--stone)', lineHeight: 1.7, maxWidth: 420 }}>
            Every payout cycle starts the same way: a Slack message, a spreadsheet, and a prayer.
            Modern payment stacks generate data across 8+ systems that never agree.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

          {/* Left — chaos feeds */}
          <div>
            <div className="label" style={{ marginBottom: 16 }}>Live data sources · unreconciled</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CHAOS_ITEMS.map((item, i) => (
                <ChaosCard key={item.label} item={item} i={i} />
              ))}
            </div>
            {/* Total row */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              style={{
                marginTop: 12,
                padding: '14px 14px',
                background: 'rgba(168,74,66,0.08)',
                border: '1px solid rgba(168,74,66,0.2)',
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--stone)' }}>RECONCILABLE BALANCE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--scarlet)' }}>UNKNOWN</span>
                <span className="badge badge-blocked" style={{ fontSize: '0.5rem' }}>BLOCKED</span>
              </div>
            </motion.div>
          </div>

          {/* Right — pain points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PAIN_POINTS.map(({ n, title, body }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                style={{
                  padding: '24px 0',
                  borderBottom: i < PAIN_POINTS.length - 1 ? '1px solid var(--line)' : 'none',
                  display: 'flex',
                  gap: 20,
                  cursor: 'default',
                  borderRadius: 4,
                  transition: 'background 0.2s ease',
                }}
              >
                <div className="mono" style={{ fontSize: '0.58rem', color: 'var(--dust)', flexShrink: 0, paddingTop: 4 }}>{n}</div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--chalk)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--stone)', lineHeight: 1.6 }}>{body}</div>
                </div>
              </motion.div>
            ))}

            {/* Arrow to Atlas */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              style={{
                marginTop: 32,
                padding: '20px 24px',
                background: 'rgba(198,166,107,0.06)',
                border: '1px solid rgba(198,166,107,0.18)',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)' }} />
                <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--gold-dim)', letterSpacing: '0.12em' }}>ATLAS LEDGER</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--silver)', lineHeight: 1.6 }}>
                One platform that ingests every source, reconciles every row, and delivers a mathematically verified payout decision — in under a second.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

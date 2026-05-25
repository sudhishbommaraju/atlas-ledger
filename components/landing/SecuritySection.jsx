"use client";
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PILLARS = [
  {
    n: '01',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1L2 4v5c0 4 3.1 7.5 7 8.5C13 16.5 16 13 16 9V4L9 1z" stroke="#C6A66B" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
        <path d="M6 9l2 2 4-4" stroke="#C6A66B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Immutable audit ledger',
    body: 'Every balance computation, approval decision, and payout instruction is written to an append-only ledger. Nothing overwrites. Nothing deletes.',
    tags: ['Append-only', 'Cryptographic hash', 'Tamper-evident'],
    color: 'var(--gold)',
  },
  {
    n: '02',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="8" width="12" height="8" rx="2" stroke="#6B9E86" strokeWidth="1.2" fill="none"/>
        <path d="M6 8V6a3 3 0 016 0v2" stroke="#6B9E86" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="9" cy="12" r="1" fill="#6B9E86"/>
      </svg>
    ),
    title: 'Role-based approvals',
    body: 'Granular RBAC controls define who can view, approve, or release payout decisions. Multi-signature required above configurable thresholds.',
    tags: ['RBAC', 'Multi-sig', 'Threshold controls'],
    color: 'var(--sage)',
  },
  {
    n: '03',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="#8BBFAC" strokeWidth="1.2" fill="none"/>
        <path d="M9 5v4l2.5 2.5" stroke="#8BBFAC" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Real-time compliance checks',
    body: 'Every payout is validated against configurable compliance rules before execution. Sanctions screening, velocity limits, jurisdiction rules.',
    tags: ['OFAC screening', 'Velocity limits', 'Geo controls'],
    color: 'var(--sage)',
  },
  {
    n: '04',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 14l4-4 3 3 5-6 2 2" stroke="#D4B87A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="4" cy="14" r="1.5" fill="#D4B87A"/>
        <circle cx="9" cy="13" r="1.5" fill="#D4B87A"/>
        <circle cx="14" cy="9" r="1.5" fill="#D4B87A"/>
      </svg>
    ),
    title: 'Anomaly detection',
    body: 'Statistical models flag unusual fee patterns, duplicate settlement rows, and round-trip transaction anomalies before they reach payout.',
    tags: ['Statistical models', 'Duplicate detection', 'Fee anomaly'],
    color: 'var(--gold)',
  },
]

const COMPLIANCE = [
  { label: 'SOC 2 Type II',    status: 'In progress', color: 'var(--amber)' },
  { label: 'PCI DSS Level 1',  status: 'Architecture ready', color: 'var(--gold)' },
  { label: 'ISO 27001',        status: 'In progress', color: 'var(--amber)' },
  { label: 'GDPR / DSGVO',     status: 'Compliant', color: 'var(--sage)' },
]

export default function SecuritySection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: "easeOut" }} ref={ref} className="section" style={{ background: 'var(--raised)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 50% at 100% 30%, rgba(107,158,134,0.05) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64 }}
        >
          <div style={{ maxWidth: 500 }}>
            <div className="label-gold" style={{ marginBottom: 16 }}>Security</div>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 700,
              color: 'var(--chalk)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}>
              Institutional-grade<br />trust infrastructure.
            </h2>
          </div>
          {/* Compliance badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
            {COMPLIANCE.map(({ label, status, color }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 14px',
                background: 'var(--elevated)',
                border: '1px solid var(--line)',
                borderRadius: 8,
              }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--silver)' }}>{label}</span>
                <span className="mono" style={{ fontSize: '0.55rem', color }}>{status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pillars grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {PILLARS.map(({ n, icon, title, body, tags, color }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ background: 'rgba(255,255,255,0.025)', borderColor: 'var(--line-2)', y: -2 }}
              style={{
                background: 'var(--elevated)',
                border: '1px solid var(--line)',
                borderRadius: 16,
                padding: '28px 28px',
                cursor: 'default',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${color}0f`,
                  border: `1px solid ${color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{icon}</div>
                <div className="mono" style={{ fontSize: '0.56rem', color: 'var(--stone)' }}>{n}</div>
              </div>
              <div style={{
                fontSize: '1rem', fontWeight: 600, color: 'var(--chalk)',
                letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.3,
              }}>{title}</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--stone)', lineHeight: 1.65, marginBottom: 18 }}>{body}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map(tag => (
                  <span key={tag} className="mono" style={{
                    fontSize: '0.52rem', padding: '3px 8px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--line-2)',
                    color: 'var(--stone)',
                    borderRadius: 5,
                  }}>{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: 40,
            padding: '20px 28px',
            background: 'rgba(198,166,107,0.04)',
            border: '1px solid rgba(198,166,107,0.12)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          {[
            { label: 'Audit log entries', val: '∞ retained' },
            { label: 'Approval latency', val: '< 200ms' },
            { label: 'Uptime SLA', val: '99.99%' },
            { label: 'Encryption', val: 'AES-256 at rest' },
            { label: 'TLS', val: '1.3 in transit' },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold)', marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--stone)' }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

"use client";
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PROBLEMS = [
  { n: '01', title: 'Spreadsheet reconciliation', body: 'Finance teams manually reconcile PSP reports against bank statements. Errors compound. Settlements disappear.' },
  { n: '02', title: 'Frozen payout cycles', body: 'A single mismatch freezes the entire payout queue. Operations teams spend days finding a $200 discrepancy.' },
  { n: '03', title: 'No audit trail', body: 'Decisions made in email threads and Slack DMs. Zero immutable record of who approved what and when.' },
  { n: '04', title: 'Multi-PSP chaos', body: 'Stripe, Adyen, Braintree, and 6 internal ledgers each use different schemas, timestamps, and rounding.' }
]

const CHAOS = [
  { label: 'Stripe CSV', status: 'delayed', val: '+$842,000', note: '4h delayed' },
  { label: 'Adyen Batch', status: 'error', val: '+$1,240,000', note: 'fee mismatch' },
  { label: 'Reserve Hold', status: 'error', val: '−$480,000', note: 'locked' },
  { label: 'Bank Statement', status: 'warning', val: '+$620,000', note: 'not received' },
  { label: 'FX Ledger', status: 'warning', val: '+$214,000', note: 'partial match' },
]

export default function ProblemSection() {
  const ref = useRef(null)
  const iv = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.section ref={ref}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ padding: '120px 0', background: 'var(--bg-base)' }}
    >
      <div className="container">
        
        <div style={{ maxWidth: 600, marginBottom: 80 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Finance operations built <br/> on fragile glue.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Modern payout operations generate fragmented data across banks, PSPs, ERPs, and internal ledgers that rarely reconcile cleanly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          
          {/* Left: Issue Queue UI */}
          <div className="card" style={{ padding: 24 }}>
            <div className="label" style={{ marginBottom: 20 }}>Live Data Sources · Unreconciled</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CHAOS.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.status === 'error' ? 'var(--error)' : 'var(--warning)' }} />
                    <span className="mono" style={{ fontSize: '0.8rem' }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.val}</span>
                    <span className={`badge ${item.status}`} style={{ width: 85, justifyContent: 'center' }}>{item.note}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label">Reconcilable Balance</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="mono" style={{ fontSize: '0.9rem', color: 'var(--error)', fontWeight: 600 }}>UNKNOWN</span>
                <span className="badge error">BLOCKED</span>
              </div>
            </div>
          </div>

          {/* Right: Problem List */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {PROBLEMS.map((prob, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, padding: '24px 0', borderBottom: i !== PROBLEMS.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{prob.n}</div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{prob.title}</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{prob.body}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </motion.section>
  )
}

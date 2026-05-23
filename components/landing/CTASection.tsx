"use client";
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function CTASection() {
  const ref = useRef(null)
  const iv = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section ref={ref}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ padding: '140px 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)' }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        
        <h2 style={{ fontSize: '2.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 20 }}>
          Stop reconciling payouts <br/> in spreadsheets.
        </h2>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.6, marginBottom: 40 }}>
          Invitation-only access for payout operations teams processing high-volume settlement flows.
        </p>

        <form style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 400, marginBottom: 48 }} onSubmit={e => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Work email address" 
            required
            style={{ flex: 1, padding: '14px 16px', fontSize: '1rem', borderRadius: 8 }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 8 }}>
            Request Access
          </button>
        </form>

        <div style={{ display: 'flex', gap: 48, borderTop: '1px solid var(--border-default)', paddingTop: 40 }}>
          {[
            { val: '$2.4B+', label: 'Tracked' },
            { val: '99.8%', label: 'Match Accuracy' },
            { val: '<1s', label: 'Reconciliation Latency' }
          ].map(m => (
            <div key={m.label}>
              <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{m.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.label}</div>
            </div>
          ))}
        </div>

      </div>
    </motion.section>
  )
}

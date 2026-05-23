"use client";
import { useState } from 'react'
import { motion } from 'framer-motion'

const EXCEPTIONS = [
  { id: 'EX-912', type: 'Merchant payout mismatch', amount: '$4,250.00', status: 'Pending Review' },
  { id: 'EX-913', type: 'Duplicate settlement', amount: '$120.00', status: 'Auto-flagged' },
  { id: 'EX-914', type: 'Settlement timing drift', amount: '$8,400.00', status: 'Pending Review' },
  { id: 'EX-915', type: 'Reserve discrepancy', amount: '$45,000.00', status: 'Escalated' },
]

export default function ExceptionResolution() {
  const [activeEx, setActiveEx] = useState(EXCEPTIONS[0].id)

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ padding: '120px 0', background: 'var(--bg-surface)' }}
    >
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Resolve payout issues <br/> before they freeze operations.
          </h2>
        </div>

        <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', minHeight: 480, overflow: 'hidden' }}>
          
          {/* Left: Review Queue */}
          <div style={{ borderRight: '1px solid var(--border-default)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-card)' }}>
              <span className="label">Exception Queue (4)</span>
            </div>
            <div>
              {EXCEPTIONS.map(ex => (
                <div key={ex.id} 
                  onClick={() => setActiveEx(ex.id)}
                  style={{ 
                    padding: '20px 24px', borderBottom: '1px solid var(--border-default)', 
                    cursor: 'pointer', background: activeEx === ex.id ? 'var(--bg-surface)' : 'transparent',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ex.id}</span>
                      <span className={`badge ${ex.status === 'Escalated' ? 'error' : 'warning'}`}>{ex.status}</span>
                    </div>
                    <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{ex.type}</div>
                  </div>
                  <div className="mono" style={{ fontWeight: 500 }}>{ex.amount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Drawer Panel */}
          <div style={{ background: 'var(--bg-surface)', padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span className="label">Resolution Details</span>
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{activeEx}</span>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>Candidate Matches</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: 8, marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: '0.75rem' }}>Bank: tx_9921</span>
                <span className="mono" style={{ fontSize: '0.75rem' }}>$4,250.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--error)' }}>PSP: set_4421</span>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--error)' }}>$4,210.00</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>System Analysis</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.85rem' }}>Confidence Score</span>
                <span className="mono badge success">98.2%</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                PSP batch is missing $40.00 fee deduction. Known rounding issue with this provider. 
              </p>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button className="btn-primary" style={{ width: '100%', marginBottom: 8 }}>
                Accept Match & Adjust Ledger
              </button>
              <button className="btn-secondary" style={{ width: '100%' }}>
                Escalate to Finance
              </button>
            </div>

          </div>
        </div>
      </div>
    </motion.section>
  )
}

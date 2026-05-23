"use client";
import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function ReconciliationDemo() {
  const ref = useRef(null)
  const iv = useInView(ref, { once: true, margin: '-100px' })
  const [step, setStep] = useState(0)

  // Subtle sequencing
  useEffect(() => {
    if (!iv) return
    const s1 = setTimeout(() => setStep(1), 800)
    const s2 = setTimeout(() => setStep(2), 2000)
    const s3 = setTimeout(() => setStep(3), 3200)
    return () => { clearTimeout(s1); clearTimeout(s2); clearTimeout(s3) }
  }, [iv])

  return (
    <motion.section ref={ref}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ padding: '120px 0', background: 'var(--bg-surface)' }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 16 }}>
            From raw settlement data <br />
            to payout authorization.
          </h2>
        </div>

        {/* Focused Operational Panel */}
        <div className="card" style={{ maxWidth: 900, margin: '0 auto', overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>Reconciliation Engine</span>
            <span className="badge">PROCESSING</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', minHeight: 380 }}>
            
            {/* Left: Processing steps & queue */}
            <div style={{ padding: 32, borderRight: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24, fontWeight: 500 }}>UPLOAD QUEUE</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { file: 'stripe_settlement_0823.csv', rows: '4,821 rows', t: 0 },
                  { file: 'adyen_batch_22.json', rows: '1,204 rows', t: 1 },
                  { file: 'internal_ledger.xlsx', rows: '6,025 rows', t: 2 }
                ].map((item, i) => (
                  <motion.div key={item.file} 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: step >= item.t ? 1 : 0.4, x: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: step > item.t ? 'var(--success)' : (step === item.t ? 'var(--primary-blue)' : 'var(--border-default)') }} />
                      <span className="mono" style={{ fontSize: '0.8rem' }}>{item.file}</span>
                    </div>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.rows}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Metrics & Output */}
            <div style={{ padding: 32, background: 'rgba(29, 78, 216, 0.02)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24, fontWeight: 500 }}>RECONCILIATION OUTPUT</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>Match Rate</div>
                  <motion.div className="mono" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {step === 0 ? '0.0%' : step === 1 ? '42.8%' : step === 2 ? '94.1%' : '99.8%'}
                  </motion.div>
                </div>
                
                <div style={{ display: 'flex', gap: 24 }}>
                  <div>
                    <div className="label" style={{ marginBottom: 4 }}>Exceptions</div>
                    <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--error)' }}>
                      {step === 3 ? '4' : '0'}
                    </div>
                  </div>
                  <div>
                    <div className="label" style={{ marginBottom: 4 }}>Duplicates</div>
                    <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--warning)' }}>
                      {step === 3 ? '12' : '0'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border-default)' }}>
                  <div className="label" style={{ marginBottom: 8, color: 'var(--primary-blue)' }}>Safe to Disburse</div>
                  <motion.div className="mono" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-blue)', letterSpacing: '-0.02em' }}>
                    {step === 3 ? '$38,161,174' : 'CALCULATING...'}
                  </motion.div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.section>
  )
}

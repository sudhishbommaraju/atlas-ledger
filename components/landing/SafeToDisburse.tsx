"use client";
import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function SafeToDisburse() {
  const ref = useRef(null)
  const iv = useInView(ref, { once: true, margin: '-100px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!iv) return
    const id = setInterval(() => {
      setVal(v => (v < 38161174 ? v + 763223 : 38161174))
    }, 30)
    return () => clearInterval(id)
  }, [iv])

  const ROWS = [
    { label: 'Gross Settled', val: 39500000, type: 'positive' },
    { label: 'Fees', val: -450000, type: 'negative' },
    { label: 'Refunds', val: -120000, type: 'negative' },
    { label: 'Chargebacks', val: -85000, type: 'negative' },
    { label: 'Reserves', val: -500000, type: 'negative' },
    { label: 'Unresolved Exposure', val: -183826, type: 'negative' },
  ]

  const format = (n: number) => 
    (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US')

  return (
    <motion.section ref={ref}
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ padding: '140px 0', background: 'var(--bg-base)' }}
    >
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Know what funds are <br/> actually safe to move.
          </h2>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 16, padding: '48px 64px', boxShadow: '0 24px 64px rgba(11,18,32,0.04)' }}>
          <div className="label" style={{ textAlign: 'center', marginBottom: 32 }}>Payout Calculation Ledger</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderBottom: '1px solid var(--text-primary)', paddingBottom: 24, marginBottom: 24 }}>
            {ROWS.map((row, i) => (
              <motion.div key={row.label}
                initial={{ opacity: 0, x: -10 }}
                animate={iv ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '1.05rem', color: row.type === 'positive' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{row.label}</span>
                <span className="mono" style={{ fontSize: '1.05rem', color: row.type === 'negative' ? 'var(--error)' : 'var(--text-primary)' }}>
                  {format(row.val)}
                </span>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Safe To Disburse</span>
            <span className="mono" style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--primary-blue)', letterSpacing: '-0.02em' }}>
              {format(val)}
            </span>
          </div>

        </div>

      </div>
    </motion.section>
  )
}

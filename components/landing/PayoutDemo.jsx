"use client";
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const PAYEES = [
  { id: 'PAY-9901', merchant: 'Meridian Commerce',    amount: 420000, rail: 'ACH',   account: '****4821' },
  { id: 'PAY-9902', merchant: 'Vantage Retail Group', amount: 315000, rail: 'Wire',  account: '****7740' },
  { id: 'PAY-9903', merchant: 'Northfield Digital',   amount: 280000, rail: 'ACH',   account: '****3317' },
  { id: 'PAY-9904', merchant: 'Solaris Payments',     amount: 195000, rail: 'SWIFT', account: '****9982' },
  { id: 'PAY-9905', merchant: 'Arc Financial',        amount: 720000, rail: 'Wire',  account: '****5510' },
]

const RAIL_COLOR = {
  ACH:   { color: 'var(--sage)',  bar: '#6B9E86', delay: '1–2 days'  },
  Wire:  { color: 'var(--gold)',  bar: '#C6A66B', delay: 'Same day'  },
  SWIFT: { color: 'var(--amber)', bar: '#B8784A', delay: '2–5 days'  },
}

const fmt = (n) => '$' + n.toLocaleString('en-US')
const total = PAYEES.reduce((s, p) => s + p.amount, 0)

export default function PayoutDemo() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-120px' })

  const [phase, setPhase] = useState(0)
  const [statuses, setStatuses] = useState({})
  const [activeFlow, setActiveFlow] = useState(null)
  const [confirmations, setConfirmations] = useState({})
  const [batchStatus, setBatchStatus] = useState('PENDING')

  useEffect(() => {
    if (!inView) return
    let mounted = true
    const timers = []

    const run = () => {
      setPhase(0); setStatuses({}); setActiveFlow(null); setConfirmations({}); setBatchStatus('PENDING')

      timers.push(setTimeout(() => { if (!mounted) return; setPhase(1) }, 1200))
      timers.push(setTimeout(() => { if (!mounted) return; setPhase(2); setBatchStatus('EXECUTING') }, 2200))

      PAYEES.forEach((p, i) => {
        const base = 2800 + i * 900
        timers.push(setTimeout(() => {
          if (!mounted) return
          setActiveFlow(i)
          setStatuses(prev => ({ ...prev, [i]: 'sending' }))
        }, base))
        timers.push(setTimeout(() => {
          if (!mounted) return
          setActiveFlow(null)
          const conf = 'TXN-' + Math.random().toString(36).slice(2, 10).toUpperCase()
          setConfirmations(prev => ({ ...prev, [i]: conf }))
          setStatuses(prev => ({ ...prev, [i]: 'confirmed' }))
        }, base + 600))
      })

      const allDone = 2800 + PAYEES.length * 900 + 700
      timers.push(setTimeout(() => { if (!mounted) return; setBatchStatus('COMPLETE'); setPhase(3) }, allDone))
      timers.push(setTimeout(run, allDone + 2400))
    }

    run()
    return () => { mounted = false; timers.forEach(clearTimeout) }
  }, [inView])

  const confirmedCount = Object.values(statuses).filter(s => s === 'confirmed').length

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: "easeOut" }} ref={ref} className="section" style={{ background: 'var(--base)', borderTop: '1px solid var(--line)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <div className="label-gold" style={{ marginBottom: 12 }}>Payout Execution</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              fontWeight: 700,
              color: 'var(--chalk)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}>
              Route, execute,<br />
              <span style={{ color: 'var(--stone)' }}>confirm — automatically.</span>
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--stone)', maxWidth: 240, textAlign: 'right', lineHeight: 1.65 }}>
            Atlas selects the optimal rail for each payee, batches disbursements,
            handles retries, and closes the loop with confirmation codes in the audit ledger.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 264px', gap: 16, alignItems: 'start' }}>
          {/* Main batch panel */}
          <div style={{
            background: 'var(--raised)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Batch header chrome */}
            <div className="chrome">
              <div className="chrome-dots">
                <span style={{ background: '#A84A42' }} />
                <span style={{ background: '#B8784A' }} />
                <span style={{ background: '#6B9E86' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: batchStatus === 'COMPLETE' ? 'var(--sage)' : batchStatus === 'EXECUTING' ? 'var(--amber)' : 'var(--stone)',
                }} />
                <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)' }}>
                  BATCH-{new Date().toISOString().slice(0, 10)}-001
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontSize: '0.55rem', color: 'var(--stone)' }}>{confirmedCount}/{PAYEES.length} sent</span>
                <span className={`badge ${batchStatus === 'COMPLETE' ? 'badge-safe' : batchStatus === 'EXECUTING' ? 'badge-partial' : 'badge-open'}`}
                  style={{ fontSize: '0.5rem' }}>
                  {batchStatus}
                </span>
              </div>
            </div>

            {/* Payee rows */}
            <div>
              {PAYEES.map((p, i) => {
                const st = statuses[i]
                const isActive = activeFlow === i
                const railStyle = RAIL_COLOR[p.rail]
                return (
                  <motion.div
                    key={p.id}
                    animate={{ background: isActive ? 'rgba(198,166,107,0.04)' : 'transparent' }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto auto',
                      gap: 16,
                      alignItems: 'center',
                      padding: '14px 18px',
                      borderBottom: i < PAYEES.length - 1 ? '1px solid var(--line)' : 'none',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {/* Merchant */}
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--chalk)', marginBottom: 3 }}>{p.merchant}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mono" style={{ fontSize: '0.56rem', color: 'var(--stone)' }}>{p.id}</span>
                        <span style={{ color: 'var(--dust)' }}>·</span>
                        <span className="mono" style={{ fontSize: '0.56rem', color: 'var(--stone)' }}>{p.account}</span>
                      </div>
                    </div>

                    {/* Rail */}
                    <span className="mono" style={{ fontSize: '0.62rem', fontWeight: 600, color: railStyle.color }}>{p.rail}</span>

                    {/* Amount */}
                    <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--chalk)' }}>{fmt(p.amount)}</span>

                    {/* Status */}
                    <div style={{ minWidth: 112, textAlign: 'right' }}>
                      <AnimatePresence mode="wait">
                        {!st && (
                          <motion.span key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="mono" style={{ fontSize: '0.58rem', color: 'var(--dust)' }}>QUEUED</motion.span>
                        )}
                        {st === 'sending' && (
                          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            <motion.div
                              style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)' }}
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{ repeat: Infinity, duration: 0.6 }}
                            />
                            <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--gold)' }}>SENDING</span>
                          </motion.div>
                        )}
                        {st === 'confirmed' && (
                          <motion.div key="c" initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--sage)' }}>✓ CONFIRMED</span>
                            <span className="mono" style={{ fontSize: '0.52rem', color: 'var(--dust)' }}>{confirmations[i]}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Footer total */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 18px',
              borderTop: '1px solid var(--line)',
              background: 'rgba(255,255,255,0.015)',
            }}>
              <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--stone)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Total Disbursed
              </span>
              <span className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--chalk)' }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Approval panel */}
            <motion.div
              animate={{
                borderColor: phase === 1 ? 'rgba(198,166,107,0.5)' : 'var(--line)',
              }}
              style={{
                background: 'var(--raised)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '16px 18px',
                transition: 'border-color 0.3s ease',
              }}
            >
              <div className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                Approval
              </div>
              <div style={{ marginBottom: 16 }}>
                {[
                  { l: 'Payoutable balance',  v: '$1,930,000', c: 'var(--sage)'  },
                  { l: 'Batch total',          v: fmt(total),   c: 'var(--chalk)' },
                  { l: 'Remaining after',      v: fmt(1930000 - total), c: 'var(--sage)' },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--stone)' }}>{l}</span>
                    <span className="mono" style={{ fontSize: '0.68rem', color: c }}>{v}</span>
                  </div>
                ))}
              </div>
              <motion.div
                animate={{
                  background:
                    batchStatus === 'COMPLETE'  ? 'rgba(107,158,134,0.15)' :
                    batchStatus === 'EXECUTING' ? 'rgba(198,166,107,0.12)' :
                    'rgba(255,255,255,0.04)',
                  color:
                    batchStatus === 'COMPLETE'  ? 'var(--sage)' :
                    batchStatus === 'EXECUTING' ? 'var(--gold)' :
                    'var(--stone)',
                }}
                style={{
                  width: '100%', padding: '11px',
                  textAlign: 'center', borderRadius: 10,
                  border: '1px solid var(--line-2)',
                  fontSize: '0.68rem', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontFamily: 'JetBrains Mono, Menlo, monospace',
                  cursor: 'default',
                }}
              >
                {batchStatus === 'COMPLETE' ? '✓ Executed' : batchStatus === 'EXECUTING' ? 'Executing…' : 'Execute Batch'}
              </motion.div>
            </motion.div>

            {/* Rail routing */}
            <div style={{
              background: 'var(--raised)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: '16px 18px',
            }}>
              <div className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                Rail Routing
              </div>
              {[
                { rail: 'ACH',   count: 2, ...RAIL_COLOR.ACH   },
                { rail: 'Wire',  count: 2, ...RAIL_COLOR.Wire   },
                { rail: 'SWIFT', count: 1, ...RAIL_COLOR.SWIFT  },
              ].map(({ rail, count, color, bar, delay }) => (
                <div key={rail} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span className="mono" style={{ fontSize: '0.62rem', color }}>{rail}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--stone)' }}>{count} payee{count > 1 ? 's' : ''} · {delay}</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 2, background: bar }}
                      animate={{ width: batchStatus !== 'PENDING' ? `${(count / PAYEES.length) * 100}%` : '0%' }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Audit */}
            <div style={{
              background: 'var(--raised)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: '16px 18px',
            }}>
              <div className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                Audit Trail
              </div>
              <AnimatePresence>
                {confirmedCount > 0
                  ? Array.from({ length: confirmedCount }).map((_, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ color: 'var(--sage)', fontSize: '0.7rem' }}>✓</span>
                        <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)' }}>{PAYEES[i].id} confirmed</span>
                      </motion.div>
                    ))
                  : <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--dust)' }}>Awaiting execution…</span>
                }
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

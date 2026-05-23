import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const EXCEPTIONS = [
  { id: 'EX-0041', type: 'SETTLEMENT_DELAY',    source: 'adyen',  amount: '$110,000', desc: 'Settlement delayed 72h past SLA',               severity: 'high'     },
  { id: 'EX-0042', type: 'FEE_MISMATCH',         source: 'stripe', amount: '$2,400',   desc: 'Processed fee differs from contracted rate',     severity: 'medium'   },
  { id: 'EX-0043', type: 'RESERVE_HOLD',         source: 'manual', amount: '$80,000',  desc: 'Rolling reserve hold not yet released',           severity: 'high'     },
  { id: 'EX-0044', type: 'MISSING_BANK_CREDIT',  source: 'bank',   amount: '$47,600',  desc: 'ACH credit expected, not received',               severity: 'critical' },
]

const SEVERITY_STYLE = {
  critical: { bg: 'rgba(168,74,66,0.1)',  border: 'rgba(168,74,66,0.25)',  dot: 'var(--scarlet)' },
  high:     { bg: 'rgba(184,120,74,0.1)', border: 'rgba(184,120,74,0.25)', dot: 'var(--amber)'   },
  medium:   { bg: 'rgba(198,166,107,0.08)', border: 'rgba(198,166,107,0.2)', dot: 'var(--gold)'  },
}

const PHASE_DURATIONS = [2000, 700, 1200, 1200, 1200, 1200, 1400, 2000]

const INFO_ITEMS = [
  { type: 'Settlement Delay',     action: 'Applies grace-period adjustment, retries reconciliation' },
  { type: 'Fee Mismatch',         action: 'Flags to contracted rate, adjusts paper balance'         },
  { type: 'Reserve Hold',         action: 'Schedules release, marks hold as time-bounded'           },
  { type: 'Missing Bank Credit',  action: 'Initiates trace, holds payoutable until confirmed'       },
]

export default function AutoFixesDemo() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-120px' })

  const [phase, setPhase] = useState(0)
  const [statuses, setStatuses] = useState({ 0: 'open', 1: 'open', 2: 'open', 3: 'open' })
  const [btnPressed, setBtnPressed] = useState(false)
  const [health, setHealth] = useState(28)
  const [payoutable, setPayoutable] = useState('$1,690,000')

  useEffect(() => {
    if (!inView) return
    let mounted = true
    const timers = []

    const run = () => {
      setPhase(0)
      setStatuses({ 0: 'open', 1: 'open', 2: 'open', 3: 'open' })
      setBtnPressed(false)
      setHealth(28)
      setPayoutable('$1,690,000')

      let elapsed = 0
      timers.push(setTimeout(() => { if (!mounted) return; setPhase(1) }, elapsed += PHASE_DURATIONS[0]))
      timers.push(setTimeout(() => { if (!mounted) return; setPhase(2); setBtnPressed(true) }, elapsed += PHASE_DURATIONS[1]))

      EXCEPTIONS.forEach((_, i) => {
        timers.push(setTimeout(() => {
          if (!mounted) return
          setPhase(3 + i)
          setStatuses(prev => ({ ...prev, [i]: 'processing' }))
        }, elapsed += PHASE_DURATIONS[2 + i] / 2))
        timers.push(setTimeout(() => {
          if (!mounted) return
          setStatuses(prev => ({ ...prev, [i]: 'resolved' }))
          setHealth(h => Math.min(h + 17, 95))
          if (i === 3) setPayoutable('$1,930,000')
        }, elapsed += PHASE_DURATIONS[2 + i] / 2))
      })

      timers.push(setTimeout(() => { if (!mounted) return; setBtnPressed(false); setPhase(7) }, elapsed += PHASE_DURATIONS[6]))
      timers.push(setTimeout(run, elapsed += PHASE_DURATIONS[7]))
    }

    run()
    return () => { mounted = false; timers.forEach(clearTimeout) }
  }, [inView])

  const resolvedCount = Object.values(statuses).filter(s => s === 'resolved').length
  const allResolved = resolvedCount === EXCEPTIONS.length

  return (
    <section className="section" style={{ background: 'var(--raised)', borderTop: '1px solid var(--line)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 56, alignItems: 'start' }}>

          {/* Left — animated panel */}
          <div ref={ref} style={{
            background: 'var(--elevated)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Panel header */}
            <div className="chrome">
              <div className="chrome-dots">
                <span style={{ background: '#A84A42' }} />
                <span style={{ background: '#B8784A' }} />
                <span style={{ background: '#6B9E86' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: allResolved ? 'var(--sage)' : 'var(--amber)',
                }} />
                <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)', letterSpacing: '0.14em' }}>
                  EXCEPTION MANAGER
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontSize: '0.55rem', color: 'var(--stone)' }}>{resolvedCount}/{EXCEPTIONS.length} resolved</span>
                <span className={`badge ${allResolved ? 'badge-safe' : 'badge-partial'}`} style={{ fontSize: '0.5rem' }}>
                  {allResolved ? 'HEALTHY' : 'ATTENTION'}
                </span>
              </div>
            </div>

            <div style={{ padding: 16 }}>
              {/* Exception cards */}
              {EXCEPTIONS.map((ex, i) => {
                const st = statuses[i]
                const sty = SEVERITY_STYLE[ex.severity]
                const isResolved = st === 'resolved'
                const isProcessing = st === 'processing'
                return (
                  <motion.div
                    key={ex.id}
                    animate={{ opacity: isResolved ? 0.5 : 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      borderRadius: 10,
                      border: `1px solid ${isResolved ? 'var(--line)' : sty.border}`,
                      background: isResolved ? 'var(--elevated)' : sty.bg,
                      padding: '12px 14px',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: isResolved ? 'var(--dust)' : sty.dot, flexShrink: 0 }} />
                          <span className="mono" style={{ fontSize: '0.56rem', color: 'var(--stone)' }}>{ex.id}</span>
                          <span className="mono" style={{ fontSize: '0.56rem', color: 'var(--silver)', fontWeight: 600, letterSpacing: '0.06em' }}>
                            {ex.type.replace(/_/g, ' ')}
                          </span>
                          <span className="mono" style={{ fontSize: '0.54rem', color: 'var(--stone)' }}>{ex.source}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--stone)', lineHeight: 1.5 }}>{ex.desc}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                        <span className="mono" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--chalk)' }}>{ex.amount}</span>
                        <AnimatePresence mode="wait">
                          {st === 'open' && (
                            <motion.span key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="badge badge-blocked" style={{ fontSize: '0.5rem' }}>OPEN</motion.span>
                          )}
                          {st === 'processing' && (
                            <motion.span key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="badge badge-partial" style={{ fontSize: '0.5rem' }}>PROCESSING</motion.span>
                          )}
                          {st === 'resolved' && (
                            <motion.span key="res" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                              className="badge badge-safe" style={{ fontSize: '0.5rem' }}>✓ RESOLVED</motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    {isProcessing && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 10 }}>
                        <div style={{ height: 2, background: 'var(--line)', borderRadius: 1, overflow: 'hidden' }}>
                          <motion.div
                            style={{ height: '100%', background: 'var(--sage)', borderRadius: 1 }}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: PHASE_DURATIONS[2 + i] / 2000, ease: 'linear' }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}

              {/* Action row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
                <motion.button
                  animate={{
                    scale: btnPressed ? 0.97 : phase === 1 ? 1.02 : 1,
                    background: allResolved ? 'rgba(107,158,134,0.15)' : btnPressed ? 'rgba(198,166,107,0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: phase === 1 ? 'rgba(198,166,107,0.5)' : 'var(--line-2)',
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    border: '1px solid var(--line-2)',
                    color: allResolved ? 'var(--sage)' : btnPressed ? 'var(--gold)' : 'var(--silver)',
                    fontSize: '0.72rem', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    cursor: 'default', fontFamily: 'JetBrains Mono, Menlo, monospace',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {allResolved ? '✓ All Exceptions Resolved' : btnPressed ? 'Applying Fixes…' : 'Run Automatic Fixes'}
                </motion.button>

                {/* Health bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 72 }}>
                  <span className="mono" style={{ fontSize: '0.52rem', color: 'var(--stone)' }}>Health</span>
                  <div style={{ width: '100%', height: 3, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 2, background: health > 80 ? 'var(--sage)' : health > 50 ? 'var(--amber)' : 'var(--scarlet)' }}
                      animate={{ width: `${health}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="mono" style={{ fontSize: '0.56rem', color: health > 80 ? 'var(--sage)' : 'var(--amber)' }}>{health}%</span>
                </div>
              </div>

              {/* Updated balance */}
              <AnimatePresence>
                {allResolved && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      marginTop: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'rgba(107,158,134,0.08)',
                      border: '1px solid rgba(107,158,134,0.2)',
                      borderRadius: 10,
                    }}
                  >
                    <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--sage)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Payoutable Balance Updated
                    </span>
                    <span className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--sage)' }}>{payoutable}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right — editorial */}
          <div style={{ paddingTop: 8 }}>
            <div className="label-gold" style={{ marginBottom: 16 }}>Auto Fixes</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              fontWeight: 700,
              color: 'var(--chalk)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 20,
            }}>
              Atlas resolves<br />what blocks you.
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.7, marginBottom: 36 }}>
              Settlement delays, fee mismatches, reserve holds, missing bank credits —
              Atlas detects each class of operational exception and applies the
              appropriate remediation automatically.
            </p>
            <div>
              {INFO_ITEMS.map(({ type, action }, i) => (
                <motion.div
                  key={type}
                  whileHover={{ background: 'rgba(255,255,255,0.015)' }}
                  style={{
                    padding: '18px 0',
                    borderTop: '1px solid var(--line)',
                    cursor: 'default',
                    borderRadius: 4,
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--chalk)', marginBottom: 6, letterSpacing: '-0.01em' }}>{type}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--stone)', lineHeight: 1.5 }}>{action}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

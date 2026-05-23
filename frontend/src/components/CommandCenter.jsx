import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Data ─────────────────────────────────────────────────────────────────────

const OPERATORS = {
  SK: { color: '#C6A66B', label: 'SK' },
  JL: { color: '#6B9E86', label: 'JL' },
  PM: { color: '#B8784A', label: 'PM' },
  DT: { color: '#8BBFAC', label: 'DT' },
}

const INITIAL_CARDS = [
  { id: 'c1',  merchant: 'Acme Corp',       psp: 'Stripe',   amount: 284000, op: 'SK', col: 0, ts: '09:12', status: 'new' },
  { id: 'c2',  merchant: 'Vertex Labs',      psp: 'Adyen',    amount: 641000, op: 'JL', col: 0, ts: '09:14', status: 'new' },
  { id: 'c3',  merchant: 'Meridian Pay',     psp: 'Stripe',   amount: 128000, op: 'PM', col: 1, ts: '09:08', status: 'matching' },
  { id: 'c4',  merchant: 'Covalent Inc',     psp: 'Braintree',amount: 310000, op: 'DT', col: 1, ts: '09:05', status: 'matching' },
  { id: 'c5',  merchant: 'Solaris Finance',  psp: 'Adyen',    amount: 482000, op: 'SK', col: 2, ts: '08:54', status: 'fee_mismatch' },
  { id: 'c6',  merchant: 'Nexus Retail',     psp: 'Stripe',   amount:  92000, op: 'JL', col: 2, ts: '08:47', status: 'reserve_hold' },
  { id: 'c7',  merchant: 'Polaris Trading',  psp: 'Wire',     amount: 920000, op: 'PM', col: 3, ts: '08:30', status: 'safe' },
  { id: 'c8',  merchant: 'Quorum Health',    psp: 'ACH',      amount: 214000, op: 'DT', col: 3, ts: '08:22', status: 'safe' },
]

const COL_META = [
  { id: 0, label: 'Incoming',    color: 'var(--stone)' },
  { id: 1, label: 'Reconciling', color: 'var(--gold)' },
  { id: 2, label: 'Exceptions',  color: 'var(--scarlet)' },
  { id: 3, label: 'Ready',       color: 'var(--sage)' },
]

const STATUS_BADGE = {
  new:          { label: 'NEW',          bg: 'rgba(106,101,96,0.15)',  color: 'var(--stone)'   },
  matching:     { label: 'MATCHING',     bg: 'rgba(198,166,107,0.12)', color: 'var(--gold)'    },
  fee_mismatch: { label: 'FEE MISMATCH', bg: 'rgba(168,74,66,0.12)',   color: 'var(--scarlet)' },
  reserve_hold: { label: 'RESERVE HOLD', bg: 'rgba(184,120,74,0.12)',  color: 'var(--amber)'   },
  safe:         { label: 'SAFE',         bg: 'rgba(107,158,134,0.12)', color: 'var(--sage)'    },
}

const PSP_DOT = {
  Stripe:    '#6B9E86',
  Adyen:     '#C6A66B',
  Braintree: '#B8784A',
  ACH:       '#8BBFAC',
  Wire:      '#D4B87A',
}

const fmt = (n) => '$' + (n >= 1000000 ? (n / 1000000).toFixed(2) + 'M' : (n / 1000).toFixed(0) + 'K')

const LOG_POOL = [
  { msg: 'adyen_batch.json · 641 rows ingested',          col: 'var(--silver)'  },
  { msg: 'Vertex Labs · match confirmed · 99.7%',          col: 'var(--sage)'    },
  { msg: 'Solaris Finance · fee delta $240 flagged',       col: 'var(--scarlet)' },
  { msg: 'Polaris Trading · payout APPROVED · ACH',        col: 'var(--sage)'    },
  { msg: 'Quorum Health · reserve released',               col: 'var(--gold)'    },
  { msg: 'Nexus Retail · reserve_hold detected',           col: 'var(--amber)'   },
  { msg: 'Acme Corp · ingestion started · 1,204 rows',     col: 'var(--silver)'  },
  { msg: 'Balance computed · $1,934,000 payoutable',       col: 'var(--gold)'    },
  { msg: 'Row match engine · pass complete',               col: 'var(--sage)'    },
  { msg: 'Exception flagged · reserve hold detected',      col: 'var(--scarlet)' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function OpAvatar({ opKey, size = 22 }) {
  const op = OPERATORS[opKey]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: op.color + '22',
      border: `1px solid ${op.color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span className="mono" style={{ fontSize: '0.5rem', color: op.color, fontWeight: 700 }}>{op.label}</span>
    </div>
  )
}

function KanbanCard({ card }) {
  const badge = STATUS_BADGE[card.status] || STATUS_BADGE.new
  const isReconciling = card.col === 1
  const [progress, setProgress] = useState(Math.random() * 60 + 20)

  useEffect(() => {
    if (!isReconciling) return
    const iv = setInterval(() => setProgress(p => p >= 98 ? 20 : p + 0.6), 80)
    return () => clearInterval(iv)
  }, [isReconciling])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ background: 'rgba(255,255,255,0.03)' }}
      style={{
        background: 'var(--elevated)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: '11px 12px',
        cursor: 'default',
        transition: 'background 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--chalk)', letterSpacing: '-0.01em' }}>
          {card.merchant}
        </div>
        <OpAvatar opKey={card.op} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: PSP_DOT[card.psp] || 'var(--stone)' }} />
          <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)' }}>{card.psp}</span>
        </div>
        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--chalk)', fontWeight: 600 }}>{fmt(card.amount)}</span>
      </div>
      {isReconciling && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ height: 2, background: 'var(--line)', borderRadius: 1, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'var(--gold)', borderRadius: 1 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.08, ease: 'linear' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            <span className="mono" style={{ fontSize: '0.5rem', color: 'var(--stone)' }}>matching</span>
            <span className="mono" style={{ fontSize: '0.5rem', color: 'var(--gold)' }}>{Math.round(progress)}%</span>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="mono" style={{
          fontSize: '0.48rem', padding: '2px 6px', borderRadius: 5,
          background: badge.bg, color: badge.color, border: `1px solid ${badge.color}40`,
        }}>{badge.label}</span>
        <span className="mono" style={{ fontSize: '0.52rem', color: 'var(--dust)' }}>{card.ts}</span>
      </div>
    </motion.div>
  )
}

function MetricTile({ label, val, sub, color, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
      style={{
        padding: '14px 16px',
        background: 'var(--elevated)',
        border: '1px solid var(--line)',
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: '0.62rem', color: 'var(--stone)', marginBottom: 6 }}>{label}</div>
      <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: color || 'var(--chalk)', letterSpacing: '-0.02em' }}>{val}</div>
      {sub && <div className="mono" style={{ fontSize: '0.53rem', color: 'var(--dust)', marginTop: 3 }}>{sub}</div>}
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CommandCenter() {
  const [cards, setCards] = useState(INITIAL_CARDS)
  const [logLines, setLogLines] = useState(
    LOG_POOL.slice(0, 8).map((l, i) => ({
      ...l,
      t: `09:1${i}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      key: `init-${i}`,
    }))
  )
  const [tick, setTick] = useState(0)
  const mounted = useRef(true)

  // Card advancement
  useEffect(() => {
    mounted.current = true
    const iv = setInterval(() => {
      if (!mounted.current) return
      setTick(t => t + 1)
      setCards(prev => {
        const next = [...prev]
        const candidates = next.filter(c => c.col < 3)
        if (!candidates.length) return prev
        const target = candidates[Math.floor(Math.random() * candidates.length)]
        const idx = next.indexOf(target)
        const newCol = target.col + 1
        const newStatus = newCol === 1 ? 'matching' : newCol === 3 ? 'safe' : target.status
        next[idx] = { ...target, col: newCol, status: newStatus }
        // Recycle oldest ready card
        const readyCards = next.filter(c => c.col === 3)
        if (readyCards.length > 3) {
          const oi = next.indexOf(readyCards[0])
          next[oi] = { ...readyCards[0], col: 0, status: 'new', ts: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) }
        }
        return next
      })
    }, 2800)
    return () => { mounted.current = false; clearInterval(iv) }
  }, [])

  // Log drip
  useEffect(() => {
    const iv = setInterval(() => {
      if (!mounted.current) return
      const pool = LOG_POOL[tick % LOG_POOL.length]
      const newLine = {
        ...pool,
        t: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        key: `log-${Date.now()}`,
      }
      setLogLines(prev => [newLine, ...prev].slice(0, 10))
    }, 3200)
    return () => clearInterval(iv)
  }, [tick])

  const cols = COL_META.map(col => ({ ...col, cards: cards.filter(c => c.col === col.id) }))
  const readyTotal = cards.filter(c => c.col === 3).reduce((s, c) => s + c.amount, 0)
  const exceptionCount = cards.filter(c => c.col === 2).length
  const inFlight = cards.filter(c => c.col === 1).length

  return (
    <section className="section" style={{ background: 'var(--base)', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-dark" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div className="label-gold" style={{ marginBottom: 12 }}>Command Center</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 700,
              color: 'var(--chalk)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}>Live payout operations.</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="dot-live" />
            <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--stone)' }}>LIVE · {tick} events</span>
          </div>
        </div>

        {/* Metrics row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          <MetricTile i={0} label="Ready to pay"      val={fmt(readyTotal)}    sub="verified balance"  color="var(--sage)"    />
          <MetricTile i={1} label="In reconciliation"  val={inFlight}           sub="merchants active"  color="var(--gold)"    />
          <MetricTile i={2} label="Exceptions"         val={exceptionCount}     sub="require review"    color="var(--scarlet)" />
          <MetricTile i={3} label="Match accuracy"     val="99.8%"              sub="this cycle"         color="var(--chalk)"   />
        </div>

        {/* Three-panel layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 210px', gap: 12, alignItems: 'start' }}>

          {/* Panel A: Operators */}
          <div style={{ background: 'var(--raised)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
            <div className="chrome">
              <div className="chrome-dots">
                <span style={{ background: '#A84A42' }} />
                <span style={{ background: '#B8784A' }} />
                <span style={{ background: '#6B9E86' }} />
              </div>
              <span className="mono" style={{ fontSize: '0.56rem', color: 'var(--stone)' }}>OPERATORS</span>
              <span />
            </div>
            <div style={{ padding: 12 }}>
              {Object.entries(OPERATORS).map(([key, op]) => {
                const opCards = cards.filter(c => c.op === key)
                const opReady = opCards.filter(c => c.col === 3).length
                const opActive = opCards.filter(c => c.col < 3).length
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                    <OpAvatar opKey={key} size={26} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--chalk)', marginBottom: 2 }}>Operator {key}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span className="mono" style={{ fontSize: '0.53rem', color: 'var(--stone)' }}>{opActive} active</span>
                        <span className="mono" style={{ fontSize: '0.53rem', color: 'var(--sage)' }}>{opReady} done</span>
                      </div>
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: opActive > 0 ? 'var(--sage)' : 'var(--dust)' }} />
                  </div>
                )
              })}
              <div style={{ paddingTop: 12 }}>
                {[
                  { l: 'Pipeline total', v: fmt(cards.reduce((s, c) => s + c.amount, 0)) },
                  { l: 'Cycle time',     v: '< 800ms' },
                ].map(({ l, v }) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--stone)' }}>{l}</span>
                    <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--chalk)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel B: Kanban */}
          <div style={{ background: 'var(--raised)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
            <div className="chrome">
              <div className="chrome-dots">
                <span style={{ background: '#A84A42' }} />
                <span style={{ background: '#B8784A' }} />
                <span style={{ background: '#6B9E86' }} />
              </div>
              <span className="mono" style={{ fontSize: '0.56rem', color: 'var(--stone)' }}>PAYOUT PIPELINE</span>
              <span />
            </div>
            <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {cols.map(col => (
                <div key={col.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: col.color }} />
                      <span className="mono" style={{ fontSize: '0.52rem', color: col.color, letterSpacing: '0.06em' }}>
                        {col.label.toUpperCase()}
                      </span>
                    </div>
                    <span className="mono" style={{
                      fontSize: '0.5rem',
                      background: 'var(--elevated)',
                      border: '1px solid var(--line-2)',
                      color: 'var(--stone)',
                      padding: '1px 5px', borderRadius: 4,
                    }}>{col.cards.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 60 }}>
                    <AnimatePresence mode="popLayout">
                      {col.cards.map(card => (
                        <KanbanCard key={card.id} card={card} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel C: Audit log */}
          <div style={{ background: 'var(--raised)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
            <div className="chrome">
              <div className="chrome-dots">
                <span style={{ background: '#A84A42' }} />
                <span style={{ background: '#B8784A' }} />
                <span style={{ background: '#6B9E86' }} />
              </div>
              <span className="mono" style={{ fontSize: '0.56rem', color: 'var(--stone)' }}>AUDIT LOG</span>
              <div className="dot-live" />
            </div>
            <div style={{ padding: '8px 12px' }}>
              <AnimatePresence mode="popLayout">
                {logLines.map(line => (
                  <motion.div
                    key={line.key}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{ padding: '6px 0', borderBottom: '1px solid rgba(30,35,48,0.5)' }}
                  >
                    <div className="mono" style={{ fontSize: '0.48rem', color: 'var(--dust)', marginBottom: 2 }}>{line.t}</div>
                    <div className="mono" style={{ fontSize: '0.56rem', color: line.col, lineHeight: 1.4 }}>{line.msg}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

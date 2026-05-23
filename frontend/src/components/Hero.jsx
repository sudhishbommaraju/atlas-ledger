import { useEffect, useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

/* ── count-up ─────────────────────────────────────── */
function useCountUp(target, dur = 1800, go = false) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!go) return
    let raf; const t0 = performance.now()
    const step = (now) => {
      const t = Math.min((now - t0) / dur, 1)
      setV(Math.round((1 - Math.pow(1 - t, 4)) * target))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, dur, go])
  return v
}
const usd = n => '$' + n.toLocaleString('en-US')

/* ── sparkline ────────────────────────────────────── */
const SPK = [0.31, 0.42, 0.38, 0.54, 0.49, 0.63, 0.58, 0.71, 0.67, 0.80, 0.75, 0.89]
function Sparkline({ w = 80, h = 28 }) {
  const pts = SPK.map((v, i) => [i / (SPK.length - 1) * w, h - v * (h - 4) - 2])
  const ln = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(107,158,134,0.28)" />
          <stop offset="100%" stopColor="rgba(107,158,134,0)" />
        </linearGradient>
      </defs>
      <path d={`${ln} L${w},${h} L0,${h} Z`} fill="url(#sg2)" />
      <motion.path d={ln} stroke="rgba(107,158,134,0.8)" strokeWidth="1.5"
        strokeLinecap="round" fill="none"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 1.8, ease: 'easeInOut', delay: 0.8 }, opacity: { duration: 0.4, delay: 0.8 } }} />
      <motion.circle cx={lx} cy={ly} r="2.5" fill="var(--sage)"
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, duration: 0.3 }} />
      <motion.circle cx={lx} cy={ly} r="5" stroke="rgba(107,158,134,0.3)" strokeWidth="1" fill="none"
        animate={{ r: [4, 9, 4], opacity: [0.5, 0, 0.5] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 2.5 }} />
    </svg>
  )
}

/* ── operation phases ─────────────────────────────── */
const OPS = [
  { id: 'ingest',    label: 'INGESTING',           color: 'var(--gold)',    file: 'stripe_settlement.csv', rows: 2847, detail: 'Parsing 2,847 transaction rows across 4 settlement batches', logs: ['stripe.csv → loaded 487 KB', 'validating schema integrity', 'parsing 2,847 transaction rows', '2,843 rows cleared · 4 exceptions routed', '✓ paper balance recalculated'], progress: 78 },
  { id: 'reconcile', label: 'RECONCILING',          color: 'var(--sage)',    file: 'adyen_batch.json',      rows: 5124, detail: 'Cross-referencing 5,124 settlements to charge records', logs: ['adyen.json → loaded 2.1 MB', 'cross-referencing 5,124 records', 'matched 5,119 / 5,124 entries', '5 gaps → exception queue', '✓ paper balance updated'], progress: 100 },
  { id: 'exception', label: 'EXCEPTION DETECTED',   color: 'var(--scarlet)', file: 'reserve_hold.json',     rows: 1,    detail: 'Rolling reserve hold — $80,000 unconfirmed', logs: ['⚠ type: RESERVE_HOLD detected', 'source: manual · $80,000', 'blocking payoutable balance', 'auto-fix: scheduling release review', 'exception routed to ops queue'], progress: 100 },
  { id: 'ready',     label: 'PAYOUT READY',         color: 'var(--sage)',    file: 'payout_obligations.xlsx', rows: 88, detail: '$1,930,000 cleared for disbursement', logs: ['✓ all sources reconciled', '✓ exceptions resolved or queued', '✓ paper balance: $2,410,000', '✓ blocked: $480,000', '✓ payoutable: $1,930,000'], progress: 100 },
]

const FEED = [
  { id: 'f1', type: 'CHARGE',     src: 'stripe', amt: '+$1,250,000', st: 'settled', ts: '08:42:31' },
  { id: 'f2', type: 'SETTLEMENT', src: 'adyen',  amt: '+$110,000',   st: 'pending', ts: '08:41:18' },
  { id: 'f3', type: 'FEE',        src: 'stripe', amt: '−$45,000',    st: 'settled', ts: '08:41:31' },
  { id: 'f4', type: 'RESERVE',    src: 'manual', amt: '−$80,000',    st: 'open',    ts: '08:40:55' },
  { id: 'f5', type: 'CHARGE',     src: 'stripe', amt: '+$750,000',   st: 'settled', ts: '08:38:10' },
  { id: 'f6', type: 'REFUND',     src: 'adyen',  amt: '−$50,000',    st: 'pending', ts: '08:36:44' },
  { id: 'f7', type: 'EXCEPTION',  src: 'erp',    amt: '$30,000',     st: 'open',    ts: '08:34:12' },
  { id: 'f8', type: 'PAYOUT',     src: 'stripe', amt: '−$420,000',   st: 'settled', ts: '08:30:01' },
]
const SRC_DOT = { stripe: '#7B6FCC', adyen: '#4A8AC4', erp: '#C4A84A', manual: '#8C8C8C', bank: '#4AC4A0' }
const ST_COL  = { settled: 'var(--sage)', pending: 'var(--amber)', open: 'var(--scarlet)' }

/* ── chrome divider ───────────────────────────────── */
const GD = () => <div style={{ height: 1, background: 'rgba(255,255,255,0.055)', margin: '0 -1px' }} />

/* ══════════════════════════════════════════════════ */
export default function Hero() {
  const ref = useRef(null)
  const iv  = useInView(ref, { once: true, margin: '-80px' })

  const paper      = useCountUp(2410000, 1700, iv)
  const blocked    = useCountUp(480000,  1500, iv)
  const payoutable = useCountUp(1930000, 1900, iv)

  /* cycling operations */
  const [opIdx, setOpIdx]     = useState(0)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs]       = useState([])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      while (mounted) {
        for (let i = 0; i < OPS.length; i++) {
          if (!mounted) break
          const op = OPS[i]
          setOpIdx(i); setProgress(0); setLogs([])
          for (let p = 0; p <= op.progress; p += 4) {
            if (!mounted) break
            await new Promise(r => setTimeout(r, op.id === 'ingest' ? 60 : 40))
            setProgress(Math.min(p, op.progress))
          }
          for (let li = 0; li < op.logs.length; li++) {
            if (!mounted) break
            await new Promise(r => setTimeout(r, 480))
            setLogs(prev => [...prev, op.logs[li]])
          }
          await new Promise(r => setTimeout(r, 1000))
        }
      }
    }
    run(); return () => { mounted = false }
  }, [])

  /* live entry feed */
  const [feed, setFeed] = useState(FEED.slice(0, 4))
  const fi = useRef(4)
  useEffect(() => {
    const id = setInterval(() => {
      const nx = { ...FEED[fi.current % FEED.length], id: `f-${fi.current}` }
      fi.current++
      setFeed(prev => [nx, ...prev.slice(0, 3)])
    }, 3400)
    return () => clearInterval(id)
  }, [])

  /* clock */
  const [clk, setClk] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setClk(new Date()), 1000); return () => clearInterval(id) }, [])

  const op = OPS[opIdx]

  return (
    <section ref={ref} style={{
      position: 'relative', minHeight: '100vh', paddingTop: 56,
      display: 'flex', alignItems: 'center',
      overflow: 'hidden',
      background: 'var(--base)',
    }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none grid-dark" style={{ opacity: 0.7 }} />

      {/* Ambient diffusion — gold behind terminal */}
      <motion.div className="absolute pointer-events-none" style={{
        right: -80, top: '10%', width: 800, height: 700,
        background: 'radial-gradient(ellipse at center, rgba(198,166,107,0.06) 0%, rgba(107,158,134,0.03) 45%, transparent 70%)',
        borderRadius: '50%',
      }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
      />
      {/* Ambient sage — bottom left */}
      <div className="absolute pointer-events-none" style={{
        left: -100, bottom: '5%', width: 500, height: 400,
        background: 'radial-gradient(ellipse at center, rgba(107,158,134,0.04) 0%, transparent 65%)',
        borderRadius: '50%',
      }} />

      <div className="container relative z-10" style={{ width: '100%', paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 580px', gap: 64, alignItems: 'center' }}>

          {/* ═══════ LEFT ══════════════════════════ */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={iv ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}
            >
              <div className="dot-live" />
              <span className="label">Payout Infrastructure · v0.1.0</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={iv ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'clamp(3.2rem,5.5vw,5.8rem)',
                fontWeight: 600, lineHeight: 0.93, letterSpacing: '-0.04em',
                color: 'var(--chalk)', marginBottom: 28,
              }}
            >
              Financial<br />
              <span style={{ color: 'var(--stone)' }}>certainty before</span><br />
              capital moves.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={iv ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ fontSize: '0.9rem', color: 'var(--stone)', lineHeight: 1.7, maxWidth: 420, marginBottom: 36 }}
            >
              Atlas reconciles every settlement source, computes your true disbursable balance,
              and executes payout workflows with institutional-grade controls.
              Know exactly what you can pay — before you pay it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={iv ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.44 }}
              style={{ display: 'flex', gap: 12, marginBottom: 64 }}
            >
              <motion.a href="#" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                className="btn-gold">View Architecture →</motion.a>
              <motion.a href="http://localhost:8000/docs" target="_blank" rel="noreferrer"
                whileHover={{ y: -1 }} className="btn-ghost">API Explorer</motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }} animate={iv ? { opacity: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.58 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, paddingTop: 36, borderTop: '1px solid var(--line)' }}
            >
              {[
                { v: '< 800ms', l: 'Reconciliation latency' },
                { v: '7',       l: 'Transaction types' },
                { v: '100%',    l: 'Payout accuracy' },
              ].map(({ v, l }) => (
                <motion.div key={l} whileHover={{ y: -1 }} className="lift">
                  <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--chalk)', letterSpacing: '-0.03em', marginBottom: 4 }}>{v}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--stone)' }}>{l}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ═══════ RIGHT — window ════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={iv ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="window"
            style={{
              boxShadow: [
                'inset 0 1px 0 rgba(255,255,255,0.06)',
                'inset 0 0 0 1px rgba(198,166,107,0.04)',
                '0 48px 96px rgba(0,0,0,0.5)',
                '0 12px 32px rgba(0,0,0,0.3)',
              ].join(', '),
            }}
          >
            {/* Warm inner wash */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 24, background: 'linear-gradient(160deg,rgba(198,166,107,0.04) 0%,transparent 80px)' }} />

            {/* Subtle scan line */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 24, zIndex: 1 }}>
              <motion.div
                style={{ position: 'absolute', left: 0, right: 0, height: 120,
                  background: 'linear-gradient(transparent,rgba(198,166,107,0.018),transparent)' }}
                animate={{ y: ['-100%', '500%'] }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              />
            </div>

            {/* ── Chrome ── */}
            <div className="chrome">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="dot-live" />
                <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--stone)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  Atlas Terminal · Live Operations
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <motion.span className="mono" style={{ fontSize: '0.6rem', color: 'var(--dust)' }}
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  {clk.toLocaleTimeString('en-US', { hour12: false })}
                </motion.span>
                <div className="chrome-dots">
                  <span style={{ background: 'rgba(168,74,66,0.55)' }} />
                  <span style={{ background: 'rgba(184,120,74,0.55)' }} />
                  <span style={{ background: 'rgba(107,158,134,0.55)' }} />
                </div>
              </div>
            </div>

            {/* ── Paper balance ── */}
            <div style={{ padding: '18px 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="mono" style={{ fontSize: '0.57rem', color: 'var(--dust)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>Paper Balance</div>
                <div className="mono" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--chalk)', letterSpacing: '-0.03em', fontFeatureSettings: '"tnum"' }}>
                  {usd(paper)}
                </div>
                <div className="mono" style={{ fontSize: '0.57rem', color: 'rgba(107,158,134,0.8)', marginTop: 5 }}>↑ settled · all sources · 4 PSPs</div>
              </div>
              <div style={{ paddingTop: 4 }}><Sparkline w={84} h={32} /></div>
            </div>

            <GD />

            {/* ── Blocked / Payoutable ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 18px' }}>
              {[
                { label: 'Blocked', val: usd(blocked), color: 'var(--scarlet)', pct: (480000 / 2410000) * 100, barColor: 'rgba(168,74,66,0.5)', tag: '20% of paper' },
                { label: 'Payoutable', val: usd(payoutable), color: 'var(--sage)', pct: (1930000 / 2410000) * 100, barColor: 'rgba(107,158,134,0.55)', tag: '80% of paper' },
              ].map(({ label, val, color, pct, barColor, tag }) => (
                <motion.div key={label} whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                  style={{ background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 12, padding: '11px 13px', transition: 'background 0.2s ease' }}>
                  <div className="mono" style={{ fontSize: '0.56rem', color: 'var(--dust)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 7 }}>{label}</div>
                  <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 600, color, letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"' }}>{val}</div>
                  <div style={{ marginTop: 8, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                    <motion.div style={{ height: '100%', background: barColor, borderRadius: 1 }}
                      initial={{ width: 0 }} animate={{ width: iv ? `${pct}%` : 0 }}
                      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.7 }} />
                  </div>
                  <div className="mono" style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>{tag}</div>
                </motion.div>
              ))}
            </div>

            <GD />

            {/* ── Active operation ── */}
            <AnimatePresence mode="wait">
              <motion.div key={op.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <motion.div animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 1.3 }}
                      style={{ width: 5, height: 5, borderRadius: '50%', background: op.color, flexShrink: 0 }} />
                    <span className="mono" style={{ fontSize: '0.6rem', fontWeight: 700, color: op.color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{op.label}</span>
                  </div>
                  <span className="mono" style={{ fontSize: '0.57rem', color: 'var(--dust)' }}>{op.file}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--stone)', marginBottom: 10, lineHeight: 1.4 }}>{op.detail}</div>
                {/* progress bar */}
                <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden', marginBottom: 10 }}>
                  <motion.div style={{ height: '100%', background: op.color, borderRadius: 1, opacity: 0.85 }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.15, ease: 'linear' }} />
                </div>
                {/* log drip */}
                <div style={{ minHeight: 66, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <AnimatePresence mode="popLayout">
                    {logs.map(log => (
                      <motion.div key={log}
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="mono"
                        style={{ fontSize: '0.57rem', lineHeight: 1.5, color: log.startsWith('⚠') ? 'var(--scarlet)' : log.startsWith('✓') ? 'var(--sage)' : 'var(--dust)' }}
                      >{log}</motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── Verdict ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', background: 'rgba(184,120,74,0.05)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--dust)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Payout Verdict</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }}
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2.4 }} />
                <span className="badge badge-partial">PARTIAL</span>
              </div>
            </div>

            {/* ── Live feed ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 7px', background: 'rgba(0,0,0,0.18)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="dot-live" />
                  <span className="mono" style={{ fontSize: '0.57rem', color: 'var(--dust)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Ledger Feed</span>
                </div>
                <span className="mono" style={{ fontSize: '0.56rem', color: 'var(--dust)' }}>live</span>
              </div>
              <div style={{ padding: '4px 10px 10px', background: 'rgba(0,0,0,0.12)' }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {feed.map((e, i) => (
                    <motion.div key={e.id} layout
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1 - i * 0.22, y: 0 }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: 8, cursor: 'default', transition: 'background 0.15s ease' }}
                      whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: SRC_DOT[e.src] || '#6A6460', flexShrink: 0 }} />
                        <span className="mono" style={{ fontSize: '0.55rem', color: 'var(--dust)', width: 48 }}>{e.ts}</span>
                        <span className="mono" style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--silver)', letterSpacing: '0.04em' }}>{e.type}</span>
                        <span className="mono" style={{ fontSize: '0.57rem', color: 'var(--dust)' }}>{e.src}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mono" style={{ fontSize: '0.63rem', color: ST_COL[e.st], fontFeatureSettings: '"tnum"' }}>{e.amt}</span>
                        <span className="mono" style={{ fontSize: '0.54rem', color: ST_COL[e.st], opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{e.st}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

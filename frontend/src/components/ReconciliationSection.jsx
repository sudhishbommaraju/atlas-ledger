import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

// ── Design tokens ────────────────────────────────────────────────────────────
const NAVY     = '#5C6B8A'
const NAVY_HI  = '#6B7A9B'
const NAVY_DIM = '#4E5D78'

// ── Data ─────────────────────────────────────────────────────────────────────
const FILES = [
  { name: 'stripe_settlement.csv',   size: '487 KB', psp: 'Stripe',  rows: 2847, ex: 2, trace: 'TR-8X92' },
  { name: 'adyen_batch.json',        size: '2.1 MB', psp: 'Adyen',   rows: 5124, ex: 3, trace: 'TR-4F71' },
  { name: 'refund_export.csv',       size: '94 KB',  psp: 'ERP',     rows: 312,  ex: 1, trace: 'TR-2B45' },
  { name: 'payout_obligations.xlsx', size: '231 KB', psp: 'Payout',  rows: 88,   ex: 0, trace: 'TR-9K33' },
  { name: 'chase_bank_credit.csv',   size: '128 KB', psp: 'Bank',    rows: 144,  ex: 0, trace: 'TR-7M18' },
]

const PSP_DOT = { Stripe: NAVY_HI, Adyen: '#C6A66B', ERP: '#B8784A', Payout: '#6B9E86', Bank: NAVY }

const PIPELINE = [
  { id: 'ingest',    label: 'Ingest'    },
  { id: 'reconcile', label: 'Reconcile' },
  { id: 'verify',    label: 'Verify'    },
  { id: 'simulate',  label: 'Simulate'  },
  { id: 'ready',     label: 'Ready'     },
]

const LOGS = [
  { msg: '→ stripe source connected',           c: NAVY_HI  },
  { msg: '→ 2,847 rows ingested · 487 KB',      c: '#6A6560' },
  { msg: '→ adyen batch loaded · 5,124 rows',   c: NAVY_HI  },
  { msg: '→ schema validation passed',           c: '#6A6560' },
  { msg: '→ 2 exceptions flagged · routed',      c: '#A84A42' },
  { msg: '→ reserve hold detected · $80K',       c: '#B8784A' },
  { msg: '✓ row-level match complete · 99.2%',   c: '#6B9E86' },
  { msg: '✓ verdict computed · PARTIAL',         c: '#6B9E86' },
]

// Phase timing (ms)
const T = {
  LOAD_START:     400,
  FILE_INTERVAL:  260,   // per file
  PIPELINE_START: 1900,
  STAGE_INTERVAL: 440,   // per stage
  OUTCOME_START:  4300,
  CYCLE:          8200,
}

// ── Outcome card ─────────────────────────────────────────────────────────────
function OutcomeCard({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="outcome"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 0 }}
        >
          {/* Outcome header */}
          <div style={{
            padding: '12px 16px',
            background: `${NAVY}10`,
            borderBottom: `1px solid ${NAVY}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#6B9E86' }}
              />
              <span className="mono" style={{ fontSize: '0.6rem', color: '#6B9E86', letterSpacing: '0.14em' }}>
                RECONCILIATION COMPLETE
              </span>
            </div>
            <span className="mono" style={{ fontSize: '0.54rem', color: 'var(--stone)' }}>
              TR-8X92-ATLAS-001
            </span>
          </div>

          {/* Metrics grid */}
          <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Balance trio */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {[
                { l: 'Paper Balance', v: '$2,410,000', c: 'var(--chalk)' },
                { l: 'Blocked Funds', v: '$480,000',   c: 'var(--scarlet)' },
                { l: 'Payoutable',    v: '$1,930,000', c: '#6B9E86' },
              ].map(({ l, v, c }) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + (l === 'Payoutable' ? 0.2 : l === 'Blocked Funds' ? 0.1 : 0) }}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: '0.58rem', color: 'var(--stone)', marginBottom: 5 }}>{l}</div>
                  <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: c, letterSpacing: '-0.02em' }}>{v}</div>
                </motion.div>
              ))}
            </div>

            {/* Secondary metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { l: 'Confidence',  v: '99.2%',   c: '#6B9E86'           },
                { l: 'Exceptions',  v: '2 open',  c: 'var(--scarlet)'    },
                { l: 'Total rows',  v: '8,515',   c: 'var(--chalk)'      },
                { l: 'Latency',     v: '< 800ms', c: NAVY_HI             },
              ].map(({ l, v, c }, i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid var(--line)',
                    borderRadius: 7,
                  }}
                >
                  <span style={{ fontSize: '0.62rem', color: 'var(--stone)' }}>{l}</span>
                  <span className="mono" style={{ fontSize: '0.68rem', fontWeight: 600, color: c }}>{v}</span>
                </motion.div>
              ))}
            </div>

            {/* Verdict strip */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              style={{
                padding: '12px 14px',
                background: 'rgba(184,120,74,0.08)',
                border: '1px solid rgba(184,120,74,0.25)',
                borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.58rem', color: 'var(--stone)', marginBottom: 4 }}>Operational Verdict</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--stone)', lineHeight: 1.4 }}>
                  Execute partial payout only. 2 exceptions pending resolution.
                </div>
              </div>
              <span className="badge badge-partial" style={{ fontSize: '0.52rem', flexShrink: 0, marginLeft: 12 }}>PARTIAL</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Pipeline ─────────────────────────────────────────────────────────────────
function PipelineBar({ activeStage }) {
  return (
    <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {PIPELINE.map((stage, i) => {
          const done    = i < activeStage
          const active  = i === activeStage
          const pending = i > activeStage
          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: i < PIPELINE.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* Dot */}
                <motion.div
                  animate={{
                    background: active ? NAVY : done ? '#6B9E86' : 'var(--line-3)',
                    boxShadow:  active ? `0 0 8px ${NAVY}80` : done ? '0 0 6px rgba(107,158,134,0.4)' : 'none',
                    scale:      active ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ width: 7, height: 7, borderRadius: '50%' }}
                />
                {/* Label */}
                <span className="mono" style={{
                  fontSize: '0.48rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: active ? NAVY_HI : done ? '#6B9E86' : 'var(--dust)',
                  transition: 'color 0.3s ease',
                  whiteSpace: 'nowrap',
                }}>{stage.label}</span>
              </div>

              {/* Connector line */}
              {i < PIPELINE.length - 1 && (
                <div style={{ flex: 1, height: 1, background: 'var(--line)', position: 'relative', margin: '0 4px', marginBottom: 14 }}>
                  <motion.div
                    animate={{ width: done ? '100%' : active ? '50%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ height: '100%', background: done ? '#6B9E86' : NAVY, position: 'absolute', left: 0, top: 0, borderRadius: 1 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ReconciliationSection() {
  const sectionRef = useRef(null)
  const inView     = useInView(sectionRef, { once: false, margin: '-80px' })

  const [loadedFiles,   setLoadedFiles]   = useState([])
  const [pipelineStage, setPipelineStage] = useState(-1)
  const [showOutcome,   setShowOutcome]   = useState(false)
  const [logs,          setLogs]          = useState([])
  const [logIdx,        setLogIdx]        = useState(0)
  const [syncAge,       setSyncAge]       = useState(0)

  // Cursor tracking
  const workRef    = useRef(null)
  const [cursor,   setCursor]   = useState({ x: 48, y: 52 })
  const [userCtrl, setUserCtrl] = useState(false)
  const userCtrlRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [dragFile, setDragFile] = useState(null)

  const onMouseMove = useCallback((e) => {
    if (!workRef.current) return
    const r = workRef.current.getBoundingClientRect()
    setCursor({ x: e.clientX - r.left, y: e.clientY - r.top })
  }, [])
  const onEnter = () => { setUserCtrl(true); userCtrlRef.current = true }
  const onLeave = () => { setUserCtrl(false); userCtrlRef.current = false; setDragging(false) }

  // Sync age ticker
  useEffect(() => {
    const iv = setInterval(() => setSyncAge(a => a + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  // Main animation loop
  useEffect(() => {
    if (!inView) return
    let mounted = true
    const timers = []

    const resetState = () => {
      setLoadedFiles([])
      setPipelineStage(-1)
      setShowOutcome(false)
      setLogs([])
      setLogIdx(0)
      setDragging(false)
      setDragFile(null)
      setSyncAge(0)
    }

    const runCycle = () => {
      resetState()

      // Load files one by one
      FILES.forEach((f, i) => {
        timers.push(setTimeout(() => {
          if (!mounted) return
          setLoadedFiles(prev => [...prev, i])
          // Drip a log per file
          setLogs(prev => {
            const logEntry = LOGS[Math.min(i * 2, LOGS.length - 1)]
            return [logEntry, ...prev].slice(0, 8)
          })
        }, T.LOAD_START + i * T.FILE_INTERVAL))
      })

      // Show cursor dragging last file
      timers.push(setTimeout(() => {
        if (!mounted || userCtrlRef.current) return
        setDragging(true)
        setDragFile(FILES[FILES.length - 1].name)
        setCursor({ x: 36, y: 156 })
      }, T.LOAD_START + FILES.length * T.FILE_INTERVAL + 100))

      timers.push(setTimeout(() => {
        if (!mounted || userCtrlRef.current) return
        setCursor({ x: 280, y: 100 })
      }, T.LOAD_START + FILES.length * T.FILE_INTERVAL + 350))

      timers.push(setTimeout(() => {
        if (!mounted) return
        setDragging(false)
        setDragFile(null)
      }, T.PIPELINE_START - 80))

      // Pipeline stages
      PIPELINE.forEach((_, i) => {
        timers.push(setTimeout(() => {
          if (!mounted) return
          setPipelineStage(i)
          // Add log on each stage
          const logEntry = LOGS[Math.min(4 + i, LOGS.length - 1)]
          setLogs(prev => [logEntry, ...prev].slice(0, 8))
        }, T.PIPELINE_START + i * T.STAGE_INTERVAL))
      })

      // Outcome
      timers.push(setTimeout(() => {
        if (!mounted) return
        setShowOutcome(true)
        setPipelineStage(PIPELINE.length)
      }, T.OUTCOME_START))

      // Reset
      timers.push(setTimeout(() => {
        if (!mounted) return
        runCycle()
      }, T.CYCLE))
    }

    runCycle()
    return () => { mounted = false; timers.forEach(clearTimeout) }
  }, [inView])

  const isProcessing = pipelineStage >= 0 && !showOutcome

  return (
    <section
      ref={sectionRef}
      className="section"
      style={{ background: 'var(--raised)', borderTop: '1px solid var(--line)' }}
    >
      <div className="container">
        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 40,
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginBottom: 14,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: NAVY }} />
              <span className="mono" style={{
                fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                color: NAVY_HI, fontWeight: 600,
              }}>Live Workflow</span>
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 700,
              color: 'var(--chalk)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}>
              From raw data<br />
              <span style={{ color: 'var(--stone)' }}>to payout decision.</span>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--stone)', maxWidth: 240, lineHeight: 1.65, marginBottom: 12 }}>
              Atlas ingests fragmented settlement data from every PSP and delivers
              a mathematically verified payout authorization in under a second.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <div className="dot-live" />
              <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)' }}>
                SYNCED {syncAge}s ago · CYCLE RUNNING
              </span>
            </div>
          </div>
        </div>

        {/* Main workspace */}
        <div
          ref={workRef}
          style={{
            position: 'relative',
            background: 'var(--elevated)',
            border: `1px solid ${showOutcome ? NAVY_DIM + '60' : 'var(--line)'}`,
            borderRadius: 16,
            overflow: 'hidden',
            cursor: userCtrl ? 'none' : 'default',
            transition: 'border-color 0.5s ease',
          }}
          onMouseMove={onMouseMove}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          {/* Window chrome */}
          <div className="chrome">
            <div className="chrome-dots">
              <span style={{ background: '#A84A42' }} />
              <span style={{ background: '#B8784A' }} />
              <span style={{ background: '#6B9E86' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <motion.div
                animate={{ background: showOutcome ? '#6B9E86' : isProcessing ? NAVY : 'var(--stone)' }}
                transition={{ duration: 0.4 }}
                style={{ width: 6, height: 6, borderRadius: '50%' }}
              />
              <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)' }}>
                Atlas Reconciliation Engine · v1.0
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{ fontSize: '0.54rem', color: 'var(--dust)' }}>
                {showOutcome ? 'RECONCILIATION COMPLETE' : isProcessing ? 'PROCESSING' : 'AWAITING INPUT'}
              </span>
              {showOutcome && (
                <span className="badge badge-partial" style={{ fontSize: '0.48rem' }}>PARTIAL</span>
              )}
            </div>
          </div>

          {/* 3-column workspace */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 192px', minHeight: 340 }}>

            {/* ── Left: File browser ── */}
            <div style={{ borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '8px 12px 6px',
                borderBottom: '1px solid rgba(30,35,48,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span className="mono" style={{ fontSize: '0.54rem', color: 'var(--stone)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  Sources
                </span>
                <span className="mono" style={{ fontSize: '0.5rem', color: 'var(--dust)' }}>
                  {loadedFiles.length}/{FILES.length}
                </span>
              </div>

              <div style={{ flex: 1, padding: '6px 8px' }}>
                {FILES.map((f, i) => {
                  const loaded = loadedFiles.includes(i)
                  return (
                    <motion.div
                      key={f.name}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: loaded ? 1 : 0.2, x: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '6px 7px',
                        borderRadius: 6,
                        marginBottom: 2,
                        background: loaded && showOutcome ? 'rgba(107,158,134,0.06)' :
                                    loaded ? `${NAVY}08` : 'transparent',
                        transition: 'background 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: loaded ? (PSP_DOT[f.psp] || NAVY) : 'var(--line-3)',
                        flexShrink: 0,
                        boxShadow: loaded ? `0 0 4px ${PSP_DOT[f.psp] || NAVY}80` : 'none',
                        transition: 'all 0.3s ease',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="mono" style={{
                          fontSize: '0.58rem',
                          color: loaded ? 'var(--silver)' : 'var(--dust)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          transition: 'color 0.3s ease',
                        }}>{f.name.replace('.csv', '').replace('.json', '').replace('.xlsx', '')}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                          <span className="mono" style={{ fontSize: '0.5rem', color: 'var(--dust)' }}>{f.psp}</span>
                          {loaded && (
                            <span className="mono" style={{ fontSize: '0.5rem', color: 'var(--stone)' }}>
                              {f.rows.toLocaleString()} rows
                            </span>
                          )}
                        </div>
                      </div>
                      {loaded && showOutcome && (
                        <span style={{ fontSize: '0.6rem', color: '#6B9E86', flexShrink: 0 }}>✓</span>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* PSP legend */}
              <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(30,35,48,0.6)' }}>
                <div className="mono" style={{ fontSize: '0.5rem', color: 'var(--dust)', marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  PSP Sources
                </div>
                {Object.entries(PSP_DOT).map(([psp, color]) => (
                  <div key={psp} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />
                    <span className="mono" style={{ fontSize: '0.52rem', color: 'var(--stone)' }}>{psp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Center: Main action area ── */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Content area */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

                {/* Idle / loading state */}
                <AnimatePresence>
                  {!showOutcome && (
                    <motion.div
                      key="working"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: 20, gap: 14,
                      }}
                    >
                      {/* Drop zone or processing indicator */}
                      <motion.div
                        animate={{
                          borderColor: isProcessing
                            ? `${NAVY}60`
                            : loadedFiles.length > 0
                              ? `${NAVY}40`
                              : 'rgba(30,35,48,0.8)',
                          background: isProcessing
                            ? `${NAVY}08`
                            : loadedFiles.length > 0
                              ? `${NAVY}04`
                              : 'transparent',
                        }}
                        transition={{ duration: 0.4 }}
                        style={{
                          width: '100%',
                          border: '1px dashed rgba(30,35,48,0.8)',
                          borderRadius: 10,
                          padding: '20px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          minHeight: 110,
                        }}
                      >
                        {loadedFiles.length === 0 ? (
                          <>
                            <div style={{ fontSize: '1.2rem', opacity: 0.15 }}>⬇</div>
                            <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--stone)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                              Drop files to ingest
                            </span>
                          </>
                        ) : (
                          <div style={{ width: '100%' }}>
                            {/* Processing indicator */}
                            {isProcessing && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <motion.div
                                  animate={{ opacity: [1, 0.3, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.1 }}
                                  style={{ width: 5, height: 5, borderRadius: '50%', background: NAVY }}
                                />
                                <span className="mono" style={{ fontSize: '0.58rem', color: NAVY_HI }}>
                                  {PIPELINE[Math.min(pipelineStage, PIPELINE.length - 1)]?.label || 'Processing'}…
                                </span>
                              </div>
                            )}
                            {/* Loaded file chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {loadedFiles.map(idx => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.88 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '4px 8px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid var(--line-2)',
                                    borderRadius: 5,
                                  }}
                                >
                                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: PSP_DOT[FILES[idx].psp] || NAVY }} />
                                  <span className="mono" style={{ fontSize: '0.52rem', color: 'var(--silver)' }}>
                                    {FILES[idx].psp}
                                  </span>
                                  <span className="mono" style={{ fontSize: '0.5rem', color: 'var(--stone)' }}>
                                    {FILES[idx].rows.toLocaleString()}r
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Stats row when files loaded */}
                      {loadedFiles.length > 0 && (
                        <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                          {[
                            { l: 'Total rows',    v: loadedFiles.reduce((s, i) => s + FILES[i].rows, 0).toLocaleString() },
                            { l: 'Exceptions',    v: loadedFiles.reduce((s, i) => s + FILES[i].ex, 0).toString() },
                            { l: 'Sources',       v: `${loadedFiles.length} of ${FILES.length}` },
                          ].map(({ l, v }) => (
                            <div key={l} style={{ flex: 1, padding: '7px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 6 }}>
                              <div style={{ fontSize: '0.54rem', color: 'var(--stone)', marginBottom: 3 }}>{l}</div>
                              <div className="mono" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--chalk)' }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Outcome panel */}
                <OutcomeCard visible={showOutcome} />
              </div>

              {/* Pipeline bar */}
              <PipelineBar activeStage={pipelineStage} />
            </div>

            {/* ── Right: Audit log ── */}
            <div style={{ borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '8px 12px 6px',
                borderBottom: '1px solid rgba(30,35,48,0.6)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div className="dot-live" />
                <span className="mono" style={{ fontSize: '0.54rem', color: 'var(--stone)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Audit Log
                </span>
              </div>

              <div style={{ flex: 1, padding: '8px 10px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <AnimatePresence mode="popLayout">
                  {logs.map((log, i) => (
                    <motion.div
                      key={log.msg + i}
                      layout
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="mono"
                      style={{ fontSize: '0.54rem', lineHeight: 1.55, color: log.c }}
                    >{log.msg}</motion.div>
                  ))}
                </AnimatePresence>
                {logs.length === 0 && (
                  <span className="mono" style={{ fontSize: '0.54rem', color: 'var(--dust)' }}>Awaiting events…</span>
                )}
              </div>

              {/* Sync status */}
              <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(30,35,48,0.6)' }}>
                <div className="mono" style={{ fontSize: '0.5rem', color: 'var(--stone)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>
                  Status
                </div>
                {[
                  { l: 'Operator',  v: 'atlas-sys' },
                  { l: 'Trace ID',  v: showOutcome ? 'TR-8X92' : '—' },
                  { l: 'Confidence', v: showOutcome ? '99.2%' : '—' },
                  { l: 'Rail',      v: showOutcome ? 'ACH · Wire' : '—' },
                ].map(({ l, v }) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span className="mono" style={{ fontSize: '0.52rem', color: 'var(--stone)' }}>{l}</span>
                    <span className="mono" style={{ fontSize: '0.52rem', color: showOutcome && v !== '—' ? NAVY_HI : 'var(--dust)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom cursor overlay */}
          {(userCtrl || dragging) && (
            <motion.div
              animate={{ x: cursor.x - 8, y: cursor.y - 4 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.6 }}
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 30, pointerEvents: 'none' }}
            >
              <svg width="14" height="18" viewBox="0 0 16 20" fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }}>
                <path d="M0 0L0 14L3.5 10.5L6 16L8 15L5.5 9.5L10 9.5L0 0Z" fill="white" />
                <path d="M0.5 1.7L0.5 12.5L3.5 9.5L6.3 15.2L7.3 14.8L4.5 9H9L0.5 1.7Z" fill="#0B0D12" />
              </svg>
              {dragging && dragFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    position: 'absolute', top: 16, left: 14,
                    background: NAVY,
                    color: 'var(--chalk)',
                    fontSize: '0.52rem', fontWeight: 600,
                    padding: '3px 7px', borderRadius: 4,
                    whiteSpace: 'nowrap',
                    fontFamily: 'JetBrains Mono, Menlo, monospace',
                    boxShadow: `0 4px 12px ${NAVY}60`,
                  }}
                >{dragFile.slice(0, 22)}{dragFile.length > 22 ? '…' : ''}</motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Feature callouts */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, marginTop: 1, background: 'var(--line)', borderRadius: 0,
          overflow: 'hidden',
        }}>
          {[
            { icon: '◎', title: 'Schema validation',    desc: 'Every row validated before ingestion'          },
            { icon: '◈', title: 'Duplicate detection',   desc: 'External ID dedup across all PSP sources'      },
            { icon: '◇', title: 'Exception routing',     desc: 'Anomalies isolated, never silently dropped'    },
            { icon: '◉', title: 'Live recalculation',    desc: 'Payoutable balance updates on every commit'    },
          ].map(({ icon, title, desc }) => (
            <motion.div
              key={title}
              whileHover={{ background: 'rgba(255,255,255,0.025)' }}
              style={{ background: 'var(--elevated)', padding: '22px 24px', cursor: 'default', transition: 'background 0.2s ease' }}
            >
              <div style={{ fontSize: '1rem', color: NAVY_HI, marginBottom: 8, opacity: 0.8 }}>{icon}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--chalk)', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--stone)', lineHeight: 1.5 }}>{desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

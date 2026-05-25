"use client";
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const FILES = [
  { name: 'stripe_settlement.csv', size: '487 KB', source: 'stripe', rows: 2847, settled: 2843, exceptions: 4, balance: '$2,410,000' },
  { name: 'adyen_batch.json', size: '2.1 MB', source: 'adyen', rows: 5124, settled: 5119, exceptions: 5, balance: '$2,396,500' },
  { name: 'refund_export.csv', size: '94 KB', source: 'erp', rows: 312, settled: 309, exceptions: 3, balance: '$2,381,200' },
  { name: 'payout_obligations.xlsx', size: '231 KB', source: 'payout_processor', rows: 88, settled: 88, exceptions: 0, balance: '$1,930,000' },
]

const LOG_TEMPLATES = [
  (f) => `→ ${f.source}.${f.name.split('.')[1]} loaded (${f.size})`,
  (f) => `→ parsing ${f.rows.toLocaleString()} rows`,
  (f) => `→ validating schemas`,
  (f) => `→ ${f.settled.toLocaleString()} records reconciled`,
  (f) => f.exceptions > 0 ? `⚠ ${f.exceptions} exceptions flagged` : `✓ no exceptions`,
  (f) => `→ balance recalculated → ${f.balance}`,
  (f) => `✓ ingestion complete`,
]

const PHASE_TIMES = [0, 900, 1500, 2000, 2700, 3600, 4400, 5000, 6200]
const LOOP_DURATION = 7800

export default function IngestionDemo() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: '-120px' })

  const [fileIdx, setFileIdx] = useState(0)
  const [phase, setPhase] = useState(0)
  const [logs, setLogs] = useState([])
  const [droppedFiles, setDroppedFiles] = useState([])
  const [progress, setProgress] = useState(0)
  const [balance, setBalance] = useState('$2,410,000')
  const [cursorPos, setCursorPos] = useState({ x: 32, y: 72 })

  useEffect(() => {
    if (!inView) return
    let mounted = true
    let timers = []

    const runCycle = (fi) => {
      const f = FILES[fi % FILES.length]
      setPhase(0)
      setLogs([])
      setProgress(0)
      setCursorPos({ x: 32, y: 72 + (fi % 4) * 36 })

      timers.push(setTimeout(() => { if (!mounted) return; setPhase(1); setCursorPos({ x: 32, y: 72 + (fi % 4) * 36 }) }, 200))
      timers.push(setTimeout(() => { if (!mounted) return; setPhase(2) }, 900))
      timers.push(setTimeout(() => { if (!mounted) return; setPhase(3); setCursorPos({ x: 240, y: 130 }) }, 1500))
      timers.push(setTimeout(() => { if (!mounted) return; setPhase(4); setDroppedFiles(prev => [...prev, f]) }, 2000))
      timers.push(setTimeout(() => { if (!mounted) return; setPhase(5) }, 2200))

      // Log lines trickle in
      LOG_TEMPLATES.forEach((fn, i) => {
        timers.push(setTimeout(() => {
          if (!mounted) return
          const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
          setLogs(prev => [...prev.slice(-9), `[${ts}] ${fn(f)}`])
          if (i === 5) { setBalance(f.balance); setProgress(100) }
          else if (i >= 3) setProgress(30 + i * 14)
          else setProgress(i * 15)
        }, 2700 + i * 420))
      })

      timers.push(setTimeout(() => {
        if (!mounted) return
        setPhase(6)
        setFileIdx((fi + 1) % FILES.length)
      }, LOOP_DURATION))
    }

    let fi = 0
    runCycle(fi)
    const loopInterval = setInterval(() => {
      if (!mounted) return
      fi = (fi + 1) % FILES.length
      timers.forEach(clearTimeout)
      timers = []
      runCycle(fi)
    }, LOOP_DURATION + 600)

    return () => {
      mounted = false
      timers.forEach(clearTimeout)
      clearInterval(loopInterval)
    }
  }, [inView])

  const currentFile = FILES[fileIdx % FILES.length]

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: "easeOut" }} className="py-32 bg-cream border-t border-border overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-20 items-start">
          {/* Left — editorial */}
          <div className="pt-8">
            <div className="label mb-5">01 — Ingestion</div>
            <h2 className="text-4xl font-semibold tracking-tight leading-tight text-ink mb-6">
              Reconcile every<br />source in one pass.
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-8">
              Drop financial files from Stripe, Adyen, your ERP, or payout processor.
              Atlas parses every row, validates schemas, resolves duplicates,
              and recalculates your payoutable balance — in under 800 milliseconds.
            </p>
            <div className="space-y-4">
              {[
                { icon: '◎', label: 'Schema validation', detail: 'Rejects malformed rows before ingestion' },
                { icon: '◈', label: 'Duplicate detection', detail: 'External ID deduplication across sources' },
                { icon: '◇', label: 'Exception flagging', detail: 'Automatically isolates anomalous rows' },
                { icon: '◉', label: 'Balance recalculation', detail: 'Real-time payoutable update on every ingest' },
              ].map(({ icon, label, detail }) => (
                <div key={label} className="flex gap-3">
                  <span className="text-gold text-sm mt-0.5">{icon}</span>
                  <div>
                    <div className="text-sm font-medium text-ink">{label}</div>
                    <div className="text-2xs text-muted mt-0.5">{detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated demo */}
          <div ref={ref} className="op-panel min-h-[520px] relative overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <div className="live-dot" />
                <span className="text-2xs font-mono text-muted-light tracking-widest uppercase">Atlas Reconciliation Engine</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xs font-mono text-muted">ingesting {currentFile.name}</span>
                <span className="badge badge-settled">{progress}%</span>
              </div>
            </div>

            <div className="grid grid-cols-[200px_1fr_200px] h-full min-h-[470px]">
              {/* File list pane */}
              <div className="border-r border-dark-border px-3 py-3 relative">
                <div className="text-2xs font-mono text-muted tracking-widest uppercase mb-3 px-2">Sources</div>
                <div className="space-y-0.5">
                  {FILES.map((f, i) => {
                    const isActive = i === fileIdx % FILES.length
                    const isDone = droppedFiles.includes(f)
                    return (
                      <motion.div
                        key={f.name}
                        animate={{
                          backgroundColor: isActive && phase >= 1 && phase < 4
                            ? 'rgba(201,169,110,0.08)' : 'transparent',
                          x: isActive && phase === 3 ? 6 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="rounded-sm px-2 py-2 cursor-default select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm ${isDone ? 'opacity-30' : 'opacity-70'}`}>
                            {f.source === 'stripe' ? '🟣' : f.source === 'adyen' ? '🔵' : f.source === 'erp' ? '🟡' : '⚫'}
                          </span>
                          <div>
                            <div className={`text-2xs font-mono leading-none ${isDone ? 'text-muted opacity-40 line-through' : isActive ? 'text-gold' : 'text-muted-light'}`}>
                              {f.name.length > 18 ? f.name.slice(0, 17) + '…' : f.name}
                            </div>
                            <div className="text-2xs text-muted opacity-60 mt-0.5">{f.size}</div>
                          </div>
                          {isDone && (
                            <span className="ml-auto text-sage text-xs">✓</span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Animated cursor */}
                <motion.div
                  animate={cursorPos}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute pointer-events-none z-10"
                  style={{ left: cursorPos.x, top: cursorPos.y }}
                >
                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                    <path d="M0 0L0 14L3.5 10.5L6 16L8 15L5.5 9.5L10 9.5L0 0Z" fill="white" />
                    <path d="M0.5 1.7L0.5 12.5L3.5 9.5L6.3 15.2L7.3 14.8L4.5 9H9L0.5 1.7Z" fill="#0D0D0D" />
                  </svg>
                </motion.div>
              </div>

              {/* Center — drop zone */}
              <div className="flex flex-col items-center justify-center px-6 py-8 border-r border-dark-border relative">
                <div
                  className="w-full border border-dashed border-dark-border-light rounded-sm p-6 flex flex-col items-center justify-center min-h-[180px] relative"
                  style={{ background: phase >= 4 ? 'rgba(126,158,139,0.05)' : 'transparent', transition: 'background 0.5s' }}
                >
                  {phase < 4 ? (
                    <div className="text-center">
                      <div className="text-2xl mb-2 opacity-20">⬇</div>
                      <div className="text-2xs text-muted font-mono tracking-widest uppercase">Drop to Ingest</div>
                    </div>
                  ) : (
                    <div className="space-y-2 w-full">
                      {droppedFiles.map((f) => (
                        <motion.div
                          key={f.name}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="flex items-center gap-2 bg-graphite-light rounded-sm px-3 py-2"
                        >
                          <span className="text-sage text-xs">✓</span>
                          <span className="text-2xs font-mono text-muted-light truncate flex-1">{f.name}</span>
                          <span className="text-2xs font-mono text-sage">{f.rows.toLocaleString()} rows</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {phase >= 5 && (
                  <div className="w-full mt-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-2xs font-mono text-muted tracking-widest">Reconciling</span>
                      <span className="text-2xs font-mono text-sage">{progress}%</span>
                    </div>
                    <div className="w-full h-0.5 bg-graphite-surface rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-sage rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}

                {/* Balance update */}
                {phase >= 6 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-4 flex items-center justify-between bg-graphite-surface rounded-sm px-3 py-2.5"
                  >
                    <span className="text-2xs font-mono text-muted tracking-widest uppercase">Payoutable</span>
                    <span className="text-sm font-semibold font-mono text-sage">{balance}</span>
                  </motion.div>
                )}
              </div>

              {/* Log pane */}
              <div className="px-3 py-3 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <div className="live-dot" />
                  <span className="text-2xs font-mono text-muted tracking-widest uppercase">Operational Log</span>
                </div>
                <div className="flex-1 space-y-1 overflow-hidden font-mono">
                  <AnimatePresence mode="popLayout">
                    {logs.map((log, i) => (
                      <motion.div
                        key={log}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`text-2xs leading-relaxed ${
                          log.includes('⚠') ? 'text-amber' :
                          log.includes('✓') ? 'text-sage' :
                          'text-muted'
                        }`}
                      >
                        {log}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Exception badge */}
                {phase >= 6 && currentFile.exceptions > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 px-2 py-2 bg-red/10 border border-red/20 rounded-sm"
                  >
                    <div className="text-2xs text-red font-mono">
                      ⚠ {currentFile.exceptions} exception{currentFile.exceptions > 1 ? 's' : ''} flagged
                    </div>
                    <div className="text-2xs text-red/60 font-mono mt-0.5">→ review required</div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

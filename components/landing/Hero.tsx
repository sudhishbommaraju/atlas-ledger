"use client";
import { useEffect, useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

function LiveReconciliationPreview() {
  const prefersReducedMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      const t = setTimeout(() => setProgress(100), 0)
      return () => clearTimeout(t)
    }

    let startTime = Date.now()
    const DURATION = 6500 // 6.5 seconds for full loop
    let animationFrameId: number

    const tick = () => {
      const elapsed = Date.now() - startTime
      let p = (elapsed / DURATION) * 100
      
      // Pause at 100% for a bit before resetting
      if (p > 120) {
        startTime = Date.now()
        p = 0
      }
      
      setProgress(Math.min(100, p))
      animationFrameId = requestAnimationFrame(tick)
    }
    
    animationFrameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrameId)
  }, [prefersReducedMotion])

  let stageText = "Uploading files..."
  if (progress > 15) stageText = "Parsing rows..."
  if (progress > 35) stageText = "Normalizing references..."
  if (progress > 55) stageText = "Matching transactions..."
  if (progress > 75) stageText = "Calculating safe disbursement..."
  if (progress === 100) stageText = "Reconciliation complete"

  const files = [
    "bank_statement.csv",
    "stripe_payouts.csv",
    "internal_ledger.csv",
    "erp_export.csv"
  ]

  return (
    <div style={{ width: '100%', maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-blue)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-blue)', animation: prefersReducedMotion ? 'none' : 'pulse 2s infinite' }}></span>
          LIVE RECONCILIATION
        </span>
      </div>
      
      <div className="card" style={{ padding: 24, boxShadow: '0 12px 32px rgba(11,18,32,0.06)' }}>
        {/* Title Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-default)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Atlas Reconciliation Engine</h3>
          <div className="badge blue" style={{ padding: '4px 8px' }}>Active</div>
        </div>

        {/* Content Area */}
        <div style={{ minHeight: 340, display: 'flex', flexDirection: 'column' }}>
          
          {/* Drag and drop / files stack */}
          <div style={{ position: 'relative', height: 140, marginBottom: 24 }}>
            <AnimatePresence mode="wait">
              {progress < 5 ? (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ position: 'absolute', inset: 0, border: '1px dashed var(--border-default)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" style={{ marginBottom: 8 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Drop settlement files</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CSV, XLSX, JSON</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="files"
                  style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}
                >
                  {files.map((file, idx) => {
                    const showAt = 5 + (idx * 3);
                    return (
                      <motion.div 
                        key={file}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: progress > showAt ? 1 : 0, y: progress > showAt ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border-default)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-primary)' }}>{file}</span>
                        {progress > showAt + 10 && (
                          <motion.span 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--success)', fontWeight: 500 }}
                          >
                            Parsed
                          </motion.span>
                        )}
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Bar Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{stageText}</span>
              <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', fontWeight: 600 }}>{Math.floor(progress)}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div 
                style={{ height: '100%', background: 'var(--primary-blue)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Match Rate', value: '99.2%' },
              { label: 'Exceptions', value: '3' },
              { label: 'Duplicates', value: '12' },
              { label: 'Safe to Disburse', value: '$38.1M', primary: true }
            ].map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: progress === 100 ? 1 : 0.4, 
                  borderColor: (progress === 100 && metric.primary) ? 'var(--primary-blue)' : 'var(--border-default)' 
                }}
                transition={{ delay: progress === 100 ? idx * 0.1 : 0 }}
                style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-default)' }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>{metric.label}</div>
                <div className="mono" style={{ fontSize: metric.primary ? '1.4rem' : '1.1rem', fontWeight: 600, color: metric.primary ? 'var(--primary-blue)' : 'var(--text-primary)' }}>
                  {progress > 80 || progress === 100 ? metric.value : '-'}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0.2 }}
            animate={{ opacity: progress === 100 ? 1 : 0.2 }}
            style={{ height: 40, position: 'relative', marginTop: 'auto', borderBottom: '1px solid var(--border-default)' }}
          >
            <svg width="100%" height="100%" preserveAspectRatio="none">
              <motion.path 
                d="M 0 40 L 40 35 L 80 32 L 120 28 L 160 30 L 200 20 L 240 18 L 280 22 L 320 12 L 360 8 L 400 10 L 440 2" 
                fill="none" 
                stroke="var(--primary-blue)" 
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress === 100 ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: progress === 100 ? 0.3 : 0 }}
              />
            </svg>
          </motion.div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  )
}

export default function Hero() {
  return (
    <section style={{
      position: 'relative', minHeight: '100vh', paddingTop: 120,
      display: 'flex', alignItems: 'center',
      overflow: 'hidden',
    }}>
      <div className="container relative z-10" style={{ width: '100%', paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* LEFT */}
          <div style={{ maxWidth: 540 }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ marginBottom: 32 }}
            >
              <span className="label">Payout Operations Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              style={{
                fontSize: 'clamp(3rem, 5vw, 4.2rem)',
                fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em',
                color: 'var(--text-primary)', marginBottom: 28,
              }}
            >
              Financial certainty <br/>
              <span style={{ color: 'var(--text-secondary)' }}>before capital moves.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 48 }}
            >
              Atlas reconciles banks, PSPs, internal ledgers, and ERP exports to determine what funds are actually settled, payable, and operationally safe to disburse.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              style={{ display: 'flex', gap: 16 }}
            >
              <Link href="/demo-access" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                View Demo
              </Link>
              <Link href="/request-access" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Request Access
              </Link>
            </motion.div>
          </div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <LiveReconciliationPreview />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

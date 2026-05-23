"use client";
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

function AnimatedDiagram() {
  const prefersReducedMotion = useReducedMotion()
  const [flippedCount, setFlippedCount] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      setFlippedCount(prev => (prev >= 5 ? 0 : prev + 1))
    }, 2000)
    return () => clearInterval(id)
  }, [isPaused])

  const CARDS = [
    { id: 'bank', front: 'Bank Statement', back: 'Settled cash movements', x: 0, y: 0 },
    { id: 'psp', front: 'PSP Export', back: 'Fees & Refunds', x: 260, y: 0 },
    { id: 'ledger', front: 'Internal Ledger', back: 'Expected payouts', x: 0, y: 220 },
    { id: 'erp', front: 'ERP Report', back: 'Booked entries', x: 260, y: 220 }
  ]

  const showCenter = flippedCount >= 4

  return (
    <div 
      style={{ position: 'relative', width: 480, height: 380, margin: '0 auto' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      tabIndex={0}
      className="outline-none"
    >
      {/* SVG Connectors */}
      <svg style={{ position: 'absolute', inset: -50, width: 580, height: 480, pointerEvents: 'none', zIndex: 0 }}>
        {[
          [110, 80], [370, 80], [110, 300], [370, 300]
        ].map(([cx, cy], i) => (
          <motion.path 
            key={i}
            d={`M ${cx},${cy} L 240,190`} 
            stroke="var(--primary-blue)" 
            strokeWidth="1.5" 
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: showCenter ? 1 : 0, opacity: showCenter ? 0.4 : 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.2 + i * 0.1 }}
          />
        ))}
      </svg>

      {/* Cards */}
      {CARDS.map((card, i) => {
        const isFlipped = flippedCount > i
        return (
          <div key={card.id} style={{ position: 'absolute', left: card.x, top: card.y, width: 220, height: 160, perspective: 1000, zIndex: 1 }}>
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeInOut" }}
              style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
              className="card"
            >
              {/* Front */}
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-card)', borderRadius: 12 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', textAlign: 'center' }}>{card.front}</span>
              </div>
              {/* Back */}
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-surface)', borderRadius: 12, transform: 'rotateY(180deg)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{card.back}</span>
              </div>
            </motion.div>
          </div>
        )
      })}

      {/* Center Output Node */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: showCenter ? 1 : 0, scale: showCenter ? 1 : 0.9 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'absolute', left: 140, top: 100, width: 200, height: 180, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 32px rgba(11,18,32,0.06)' }}
      >
        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Safe to Disburse</span>
        <span className="mono" style={{ fontSize: '2.2rem', fontWeight: 600, color: 'var(--primary-blue)', letterSpacing: '-0.02em' }}>$38.1M</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>Atlas Reconciliation</span>
      </motion.div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 580px', gap: 64, alignItems: 'center' }}>

          {/* LEFT */}
          <div>
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
                fontSize: 'clamp(3rem, 5vw, 4.5rem)',
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
              style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 500, marginBottom: 48 }}
            >
              Atlas reconciles banks, PSPs, internal ledgers, and ERP exports to determine what funds are actually settled, payable, and operationally safe to disburse.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              style={{ display: 'flex', gap: 16 }}
            >
              <Link href="/demo" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
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
            <AnimatedDiagram />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

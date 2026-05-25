"use client";
import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

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
    { id: 'psp', front: 'PSP Export', back: 'Fees, refunds, chargebacks', x: 260, y: 0 },
    { id: 'ledger', front: 'Internal Ledger', back: 'Expected payouts', x: 0, y: 220 },
    { id: 'erp', front: 'ERP Report', back: 'Booked accounting entries', x: 260, y: 220 }
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
        {/* Draw lines from card centers (110,80), (370,80), (110,300), (370,300) to diagram center (240, 190) */}
        {[
          [110, 80], [370, 80], [110, 300], [370, 300]
        ].map(([cx, cy], i) => (
          <motion.path 
            key={i}
            d={`M ${cx},${cy} L 240,190`} 
            stroke="var(--line-2)" 
            strokeWidth="1.5" 
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: showCenter ? 1 : 0, opacity: showCenter ? 0.6 : 0 }}
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
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--glass-bg)', borderRadius: 14, border: '1px solid var(--glass-border)' }}>
                <span className="mono" style={{ fontSize: '0.9rem', color: 'var(--chalk)', textAlign: 'center' }}>{card.front}</span>
              </div>
              {/* Back */}
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line-2)', transform: 'rotateY(180deg)' }}>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--sage)', textAlign: 'center' }}>{card.back}</span>
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
        style={{ position: 'absolute', left: 140, top: 100, width: 200, height: 180, background: 'var(--raised)', border: '1px solid var(--gold)', borderRadius: 16, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(198,166,107,0.15)' }}
      >
        <span className="label-gold" style={{ marginBottom: 8 }}>Safe to Disburse</span>
        <span className="mono" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--chalk)' }}>$38.1M</span>
        <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--stone)', marginTop: 8 }}>Atlas Reconciliation</span>
      </motion.div>
    </div>
  )
}

export default function Hero() {
  const ref = useRef(null)
  const iv  = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: "easeOut" }} ref={ref} style={{
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
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}
            >
              <div className="dot-live" />
              <span className="label">Payout Infrastructure · v0.1.0</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
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
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ fontSize: '0.9rem', color: 'var(--stone)', lineHeight: 1.7, maxWidth: 420, marginBottom: 36 }}
            >
              Atlas takes messy payout data from multiple systems and turns it into a safe disbursable number. Know exactly what you can pay — before you pay it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.44 }}
              style={{ display: 'flex', gap: 12, marginBottom: 64 }}
            >
              <motion.a href="#" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                className="btn-gold">View Demo →</motion.a>
              <motion.a href="#"
                whileHover={{ y: -1 }} className="btn-ghost">Request Access</motion.a>
            </motion.div>
          </div>

          {/* ═══════ RIGHT — window ════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.1, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <AnimatedDiagram />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
        }}
      >
        <span className="mono" style={{ fontSize: '0.5rem', color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--line-3), transparent)' }}
        />
      </motion.div>
    </motion.section>
  )
}

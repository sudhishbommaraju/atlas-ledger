"use client";
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section style={{
      position: 'relative', minHeight: '100vh', paddingTop: 120,
      display: 'flex', alignItems: 'center',
      overflow: 'hidden',
    }}>
      <div className="container relative z-10" style={{ width: '100%', paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 64, alignItems: 'center', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
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
              A continuous payout integrity layer that monitors Stripe, bank, and internal ledger state for drift before unsafe payouts happen. Live drift detection, canonical financial state, and duplicate payout prevention.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              style={{ display: 'flex', gap: 16, justifyContent: 'center' }}
            >
              <Link href="/dashboard" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                View Demo
              </Link>
              <Link href="/request-access" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Request Access
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

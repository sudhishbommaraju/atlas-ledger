"use client";
import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const STATS = [
  { val: '$2.4B+', label: 'Pipeline tracked' },
  { val: '99.8%',  label: 'Match accuracy'   },
  { val: '< 1s',   label: 'Verdict latency'  },
  { val: '∞',      label: 'Audit retention'  },
]

export default function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setSubmitted(true)
  }

  return (
    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: "easeOut" }} ref={ref} className="section" style={{
      background: 'var(--base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid */}
      <div className="grid-dark" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Centered gold glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(198,166,107,0.08) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
        >
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)' }} />
          <span className="mono badge badge-gold" style={{ fontSize: '0.58rem' }}>
            INVITATION ONLY · v0 PROGRAM
          </span>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)' }} />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
            fontWeight: 700,
            color: 'var(--chalk)',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: 24,
            maxWidth: 700,
            margin: '0 auto 24px',
          }}
        >
          Atlas is invitation-only.<br />
          <span style={{ color: 'var(--gold)' }}>Request early access.</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: '0.9rem',
            color: 'var(--stone)',
            lineHeight: 1.7,
            maxWidth: 440,
            margin: '0 auto 48px',
          }}
        >
          We partner with finance teams operating at scale — platforms processing $50M+ monthly.
          Onboarding is guided. Integration is same-week.
        </motion.p>

        {/* Email form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ maxWidth: 440, margin: '0 auto 64px' }}
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  gap: 0,
                  background: 'var(--raised)',
                  border: `1px solid ${focused ? 'rgba(198,166,107,0.4)' : 'var(--line-2)'}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                  boxShadow: focused ? '0 0 0 3px rgba(198,166,107,0.1)' : 'none',
                }}
              >
                <input
                  type="email"
                  placeholder="finance@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--chalk)',
                    fontSize: '0.82rem',
                    fontFamily: 'Inter Tight, Inter, system-ui, sans-serif',
                  }}
                />
                <motion.button
                  type="submit"
                  whileHover={{ background: 'var(--gold-hi)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '12px 22px',
                    background: 'var(--gold)',
                    border: 'none',
                    color: 'var(--base)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.01em',
                    transition: 'background 0.18s ease',
                    flexShrink: 0,
                  }}
                >Request Access →</motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '18px 24px',
                  background: 'rgba(107,158,134,0.08)',
                  border: '1px solid rgba(107,158,134,0.2)',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sage)' }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--sage)' }}>
                  Application received. We'll be in touch within 48 hours.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <p style={{ marginTop: 12, fontSize: '0.65rem', color: 'var(--dust)', fontFamily: 'JetBrains Mono, Menlo, monospace' }}>
            No spam · Invite-only · Your data never leaves your infra
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            maxWidth: 640,
            margin: '0 auto',
            background: 'var(--line)',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid var(--line)',
          }}
        >
          {STATS.map(({ val, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.08 }}
              whileHover={{ background: 'var(--high)' }}
              style={{
                padding: '22px 16px',
                background: 'var(--raised)',
                textAlign: 'center',
                cursor: 'default',
                transition: 'background 0.2s ease',
              }}
            >
              <div className="mono" style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--gold)',
                letterSpacing: '-0.03em',
                marginBottom: 6,
              }}>{val}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--stone)' }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

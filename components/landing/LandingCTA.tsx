'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const METRICS = [
  { val: '$2.4B+', label: 'Transaction volume tracked' },
  { val: '< 1s', label: 'Drift detection latency' },
  { val: '100%', label: 'Canonical integrity' },
  { val: '99.99%', label: 'Platform uptime SLA' },
]

export default function LandingCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animated background orb
      gsap.to('.cta-orb-1', {
        x: 60, y: -40, scale: 1.15,
        repeat: -1, yoyo: true, duration: 12, ease: 'sine.inOut',
      })
      gsap.to('.cta-orb-2', {
        x: -50, y: 50, scale: 1.1,
        repeat: -1, yoyo: true, duration: 9, ease: 'sine.inOut', delay: 3,
      })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
      tl.from('.cta-eyebrow', { y: 24, opacity: 0, duration: 0.7, ease: 'expo.out' })
        .from('.cta-title', { y: 32, opacity: 0, duration: 0.9, ease: 'expo.out' }, '-=0.4')
        .from('.cta-subtitle', { y: 20, opacity: 0, duration: 0.8 }, '-=0.5')
        .from('.cta-form', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.cta-metric', { y: 16, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.4')

      // Metrics bar glow
      gsap.to('.metrics-bar', {
        boxShadow: '0 0 60px rgba(59,130,246,0.08)',
        repeat: -1, yoyo: true, duration: 4, ease: 'sine.inOut', delay: 2,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section ref={sectionRef} id="cta" style={{
      position: 'relative',
      padding: '160px 0 120px',
      background: 'var(--lp-bg)',
      borderTop: '1px solid var(--lp-border)',
      overflow: 'hidden',
    }}>
      {/* Orbs */}
      <div className="cta-orb-1" style={{
        position: 'absolute', top: '10%', right: '-10%',
        width: 700, height: 600,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div className="cta-orb-2" style={{
        position: 'absolute', bottom: '0%', left: '-8%',
        width: 500, height: 440,
        background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: 680, margin: '0 auto', padding: '0 48px',
        textAlign: 'center',
      }}>
        <div className="cta-eyebrow" style={{
          display: 'inline-block', padding: '4px 12px', marginBottom: 28,
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
          color: 'var(--lp-blue)', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Invitation Only
        </div>

        <h2 className="cta-title" style={{
          fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
          fontWeight: 700, color: 'var(--lp-text-1)',
          letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20,
        }}>
          Stop blindly triggering<br />
          <span style={{ color: 'var(--lp-text-2)' }}>unsafe payouts.</span>
        </h2>

        <p className="cta-subtitle" style={{
          fontSize: '1.05rem', color: 'var(--lp-text-2)', lineHeight: 1.65, marginBottom: 40,
        }}>
          Invitation-only access for payout operations teams processing high-volume settlement flows. Join the waitlist to be first in line.
        </p>

        {!submitted ? (
          <form className="cta-form" onSubmit={handleSubmit} style={{
            display: 'flex', gap: 10, maxWidth: 460, margin: '0 auto 48px',
          }}>
            <input
              type="email"
              required
              placeholder="your@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1, padding: '13px 18px',
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border)',
                borderRadius: 10,
                fontSize: '0.95rem', color: 'var(--lp-text-1)',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--lp-border)'; e.target.style.boxShadow = 'none' }}
            />
            <button type="submit" style={{
              padding: '13px 24px',
              background: 'var(--lp-blue)',
              color: '#fff', border: 'none',
              borderRadius: 10,
              fontSize: '0.95rem', fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s, transform 0.2s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = '' }}
            >
              Request Access
            </button>
          </form>
        ) : (
          <div className="cta-form" style={{
            maxWidth: 460, margin: '0 auto 48px',
            padding: '16px 24px',
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 10,
            fontSize: '0.95rem', color: 'var(--lp-green)',
            display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9l5 5 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            You&apos;re on the list. We&apos;ll be in touch shortly.
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          {['No commitment required', 'SOC 2 compliant', 'Enterprise SLA available'].map(tag => (
            <span key={tag} style={{
              fontSize: '0.78rem', color: 'var(--lp-text-3)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ color: 'var(--lp-green)', fontSize: '0.7rem' }}>✓</span>
              {tag}
            </span>
          ))}
        </div>

        {/* Also see demo */}
        <div style={{ marginBottom: 80 }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 22px',
            background: 'transparent', color: 'var(--lp-text-2)',
            border: '1px solid var(--lp-border)',
            borderRadius: 9,
            fontSize: '0.875rem', fontWeight: 500,
            textDecoration: 'none',
            transition: 'color 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--lp-text-1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--lp-text-2)'; e.currentTarget.style.borderColor = 'var(--lp-border)' }}
          >
            Or explore the live demo →
          </Link>
        </div>

        {/* Metrics bar */}
        <div className="metrics-bar" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid var(--lp-border)',
          paddingTop: 40,
          gap: 0,
        }}>
          {METRICS.map((m, i) => (
            <div key={m.label} className="cta-metric" style={{
              textAlign: 'center',
              paddingRight: i < 3 ? 24 : 0,
              borderRight: i < 3 ? '1px solid var(--lp-border)' : 'none',
            }}>
              <div style={{
                fontSize: '1.5rem', fontWeight: 700,
                color: 'var(--lp-text-1)', fontFamily: 'ui-monospace,monospace',
                letterSpacing: '-0.02em', marginBottom: 6,
              }}>
                {m.val}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--lp-text-3)', lineHeight: 1.4 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

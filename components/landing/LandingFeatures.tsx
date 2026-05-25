'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 11h16M11 3l8 8-8 8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Live Drift Detection',
    desc: 'Continuous reconciliation across all data sources. Alerts the moment balances drift from canonical state.',
    color: '#3B82F6',
    metric: '<1s latency',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#8B5CF6" strokeWidth="2" />
        <path d="M11 7v4l3 2" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    label: 'Multi-PSP Ingestion',
    desc: 'Stripe, Adyen, Braintree, and bank exports all normalized to a single canonical schema on ingest.',
    color: '#8B5CF6',
    metric: '15+ connectors',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 17l4-4 4 4 6-8" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Canonical Balance Engine',
    desc: 'Computes the true disbursable balance in real time by netting all active blockers against gross position.',
    color: '#D4A853',
    metric: 'Decimal exact',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#10B981" strokeWidth="2" />
        <rect x="12" y="3" width="7" height="7" rx="1.5" stroke="#10B981" strokeWidth="2" />
        <rect x="3" y="12" width="7" height="7" rx="1.5" stroke="#10B981" strokeWidth="2" />
        <path d="M15.5 12v7M12 15.5h7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    label: 'Payout Verdict API',
    desc: 'Query SAFE/PARTIAL/BLOCKED verdict on demand. Full explanation payload with each response.',
    color: '#10B981',
    metric: 'REST + Webhooks',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L2 7v8l9 5 9-5V7l-9-5z" stroke="#EC4899" strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 7l9 5m0 0l9-5m-9 5v8" stroke="#EC4899" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Immutable Audit Ledger',
    desc: 'Every operation, state change, and verdict permanently logged with full lineage. Regulatory-grade trail.',
    color: '#EC4899',
    metric: 'SOC 2 ready',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M8 6h10M8 11h10M8 16h10M4 6v.01M4 11v.01M4 16v.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    label: 'Exception Management',
    desc: 'Automatic exception routing with configurable escalation rules, assignees, and SLA tracking.',
    color: '#F59E0B',
    metric: 'Auto-routing',
  },
]

export default function LandingFeatures() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.features-header', {
        scrollTrigger: { trigger: '.features-header', start: 'top 85%' },
        y: 36, opacity: 0, duration: 0.9, ease: 'expo.out',
      })

      gsap.from('.feature-card', {
        scrollTrigger: { trigger: '.features-grid', start: 'top 80%' },
        y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'expo.out',
      })

      // Subtle continuous float on feature icons
      gsap.to('.feat-icon', {
        y: -4, repeat: -1, yoyo: true, duration: 3, ease: 'sine.inOut',
        stagger: { each: 0.5, from: 'random' },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="platform" style={{
      padding: '140px 0',
      background: 'var(--lp-surface)',
      borderTop: '1px solid var(--lp-border)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>

        <div className="features-header" style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px', marginBottom: 24,
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--lp-blue)', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Platform
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 700, color: 'var(--lp-text-1)',
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16,
          }}>
            Everything payout operations<br />
            <span style={{ color: 'var(--lp-text-2)' }}>needs to run clean.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--lp-text-2)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
            A complete operational stack for financial teams — from raw event ingestion to confirmed payout with full traceability.
          </p>
        </div>

        <div className="features-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          background: 'var(--lp-border)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="feature-card"
              style={{
                padding: '36px 32px',
                background: 'var(--lp-surface)',
                transition: 'background 0.3s',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--lp-surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--lp-surface)')}
            >
              {/* Glow on hover */}
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 120, height: 120,
                background: `radial-gradient(circle, ${f.color}15 0%, transparent 70%)`,
                borderRadius: '50%', pointerEvents: 'none',
                transition: 'opacity 0.3s',
              }} />

              <div className="feat-icon" style={{ marginBottom: 20, display: 'inline-block' }}>
                {f.icon}
              </div>
              <div style={{ fontSize: '0.78rem', color: f.color, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                {f.metric}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--lp-text-1)', marginBottom: 10, letterSpacing: '-0.01em' }}>
                {f.label}
              </h3>
              <p style={{ fontSize: '0.87rem', color: 'var(--lp-text-2)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

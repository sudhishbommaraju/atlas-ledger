'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LEDGER_ROWS = [
  { label: 'Gross Settled', amount: 3741000, type: 'positive' },
  { label: 'Platform Fees', amount: -87000, type: 'negative' },
  { label: 'Refunds in Flight', amount: -120000, type: 'negative' },
  { label: 'Chargebacks', amount: -85000, type: 'negative' },
  { label: 'Rolling Reserve', amount: -480000, type: 'negative' },
  { label: 'Open Exceptions', amount: -183826, type: 'negative' },
]

const TOTAL = LEDGER_ROWS.reduce((s, r) => s + r.amount, 0)

function useCounter(target: number, active: boolean, duration = 1.6) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / (duration * 1000), 1)
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
      setVal(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return val
}

function CountingAmount({ amount, active, delay = 0 }: { amount: number; active: boolean; delay?: number }) {
  const [started, setStarted] = useState(false)
  useEffect(() => {
    if (active && !started) {
      const t = setTimeout(() => setStarted(true), delay * 1000)
      return () => clearTimeout(t)
    }
  }, [active, started, delay])
  const val = useCounter(Math.abs(amount), started, 1.4)
  const fmt = (n: number) => '$' + n.toLocaleString('en-US')
  return (
    <span>
      {amount < 0 ? '−' : ''}{fmt(val)}
    </span>
  )
}

export default function LandingLedger() {
  const sectionRef = useRef<HTMLElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ledger-header', {
        scrollTrigger: { trigger: '.ledger-header', start: 'top 85%' },
        y: 36, opacity: 0, duration: 0.9, ease: 'expo.out',
      })

      ScrollTrigger.create({
        trigger: '.ledger-card',
        start: 'top 80%',
        onEnter: () => setTriggered(true),
      })

      gsap.from('.ledger-card', {
        scrollTrigger: { trigger: '.ledger-card', start: 'top 80%' },
        y: 40, opacity: 0, duration: 1, ease: 'expo.out',
      })

      gsap.from('.ledger-row', {
        scrollTrigger: { trigger: '.ledger-card', start: 'top 75%' },
        x: -16, opacity: 0, stagger: 0.09, duration: 0.6, ease: 'power2.out', delay: 0.3,
      })

      gsap.from('.ledger-total', {
        scrollTrigger: { trigger: '.ledger-card', start: 'top 70%' },
        y: 16, opacity: 0, duration: 0.8, ease: 'expo.out', delay: 1.0,
      })

      // Pulse the SAFE badge
      gsap.to('.safe-badge', {
        boxShadow: '0 0 24px rgba(16,185,129,0.4)', scale: 1.03,
        repeat: -1, yoyo: true, duration: 2, ease: 'sine.inOut', delay: 2.5,
      })

      // Side visualization reveal
      gsap.from('.ledger-side', {
        scrollTrigger: { trigger: '.ledger-card', start: 'top 80%' },
        x: 40, opacity: 0, duration: 1.1, ease: 'expo.out', delay: 0.2,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const fmtAmount = (n: number) => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US')

  return (
    <section ref={sectionRef} style={{
      padding: '140px 0',
      background: 'var(--lp-bg)',
      borderTop: '1px solid var(--lp-border)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>

        <div className="ledger-header" style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px', marginBottom: 24,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--lp-green)', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Canonical Balance Engine
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 700, color: 'var(--lp-text-1)',
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16,
          }}>
            Know exactly what&apos;s<br />
            <span style={{ color: 'var(--lp-green)' }}>safe to move.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--lp-text-2)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
            Atlas computes a real-time disbursable balance by subtracting every active blocker from your gross settled position — updating sub-second on every new event.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'start' }}>

          {/* Ledger card */}
          <div className="ledger-card" style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: 20,
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{
              padding: '18px 28px',
              borderBottom: '1px solid var(--lp-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.01)',
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--lp-text-1)', letterSpacing: '-0.01em' }}>
                  Payout Calculation Ledger
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--lp-text-3)', marginTop: 2, fontFamily: 'ui-monospace,monospace' }}>
                  account_id: acc_7x82kp · live
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 100,
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--lp-green)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--lp-green)', fontWeight: 600 }}>Live</span>
              </div>
            </div>

            {/* Rows */}
            <div style={{ padding: '8px 0' }}>
              {LEDGER_ROWS.map((row, i) => (
                <div key={row.label} className="ledger-row" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 28px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <span style={{ fontSize: '0.9rem', color: row.type === 'positive' ? 'var(--lp-text-1)' : 'var(--lp-text-2)' }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontSize: '0.9rem', fontFamily: 'ui-monospace,monospace', fontWeight: 500,
                    color: row.type === 'negative' ? '#EF4444' : 'var(--lp-text-1)',
                  }}>
                    <CountingAmount amount={row.amount} active={triggered} delay={i * 0.09 + 0.3} />
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="ledger-total" style={{
              padding: '20px 28px',
              borderTop: '1px solid var(--lp-border-bright)',
              background: 'rgba(16,185,129,0.03)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--lp-text-2)', marginBottom: 2, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Safe to Disburse
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--lp-text-3)', fontFamily: 'ui-monospace,monospace' }}>
                  verdict: SAFE · no active blockers
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '2.4rem', fontWeight: 700, fontFamily: 'ui-monospace,monospace',
                  color: 'var(--lp-green)', letterSpacing: '-0.03em', lineHeight: 1,
                }}>
                  <CountingAmount amount={TOTAL} active={triggered} delay={1.0} />
                </div>
              </div>
            </div>
          </div>

          {/* Side info */}
          <div className="ledger-side" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* SAFE badge */}
            <div className="safe-badge" style={{
              padding: '20px 24px',
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 14,
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--lp-green)', letterSpacing: '-0.02em', fontFamily: 'ui-monospace,monospace', marginBottom: 6 }}>
                SAFE
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--lp-text-2)', lineHeight: 1.5 }}>
                All blockers resolved. Disbursement approved at canonical balance.
              </div>
            </div>

            {/* Explanation points */}
            {[
              { icon: '⟳', label: 'Updates in real time', desc: 'Every new settlement, refund, or reserve change re-runs the computation.' },
              { icon: '⊘', label: 'Zero guesswork', desc: 'Each deduction has a source record. The verdict is always traceable.' },
              { icon: '⬡', label: 'Full audit trail', desc: 'Immutable ledger of every state change with timestamp and actor.' },
            ].map(p => (
              <div key={p.label} style={{
                padding: '18px 22px',
                background: 'var(--lp-surface)',
                border: '1px solid var(--lp-border)',
                borderRadius: 12,
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '1.1rem', color: 'var(--lp-blue)', flexShrink: 0, marginTop: 2 }}>{p.icon}</span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--lp-text-1)', marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--lp-text-3)', lineHeight: 1.55 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

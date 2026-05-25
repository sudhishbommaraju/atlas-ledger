'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    n: '01', label: 'Ingest',
    title: 'Every source, unified.',
    desc: 'Stripe, Adyen, ERP exports, bank files, and processor reports are ingested through a single API. Schema validated. Duplicates rejected. Every row accounted for.',
    tags: ['stripe', 'adyen', 'erp', 'bank', 'manual_upload'],
    color: '#3B82F6',
    visual: 'ingest',
  },
  {
    n: '02', label: 'Reconcile',
    title: 'Cross-source matching.',
    desc: 'Atlas matches settlements to charges across all sources, identifies gaps, and routes anomalies to the exception queue — automatically, without spreadsheets.',
    tags: ['settlement_match', 'gap_detection', 'exception_routing'],
    color: '#8B5CF6',
    visual: 'reconcile',
  },
  {
    n: '03', label: 'Compute',
    title: 'True disbursable balance.',
    desc: 'Paper balance minus every active blocker — unsettled funds, reserves, refunds in flight, open exceptions, pending fees — gives you the payoutable amount.',
    formula: 'payoutable = paper − (reserves + refunds + exceptions + fees)',
    color: '#D4A853',
    visual: 'compute',
  },
  {
    n: '04', label: 'Decide',
    title: 'Payout verdict with proof.',
    desc: 'SAFE. PARTIAL. BLOCKED. Every verdict is computed from live ledger state with a full explanation. No guessing. No overrides. Institutional-grade certainty.',
    verdicts: [
      { v: 'SAFE', color: '#10B981', bg: 'rgba(16,185,129,0.08)', desc: 'Payoutable > 0 · no active blockers' },
      { v: 'PARTIAL', color: '#D4A853', bg: 'rgba(212,168,83,0.08)', desc: 'Payoutable > 0 · blockers active' },
      { v: 'BLOCKED', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', desc: 'Payoutable = 0' },
    ],
    color: '#10B981',
    visual: 'decide',
  },
  {
    n: '05', label: 'Execute',
    title: 'Payout orchestration.',
    desc: 'Route disbursements across ACH, Wire, and SWIFT rails. Atlas handles batching, retry logic, and writes confirmations back to the immutable audit ledger.',
    rails: ['ACH', 'Wire', 'SWIFT'],
    color: '#EC4899',
    visual: 'execute',
  },
]

function StepVisual({ type, color }: { type: string; color: string }) {
  if (type === 'ingest') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {['Stripe', 'Adyen', 'Bank', 'ERP'].map((s, i) => (
        <div key={s} style={{
          padding: '6px 12px', borderRadius: 6,
          background: `${color}08`, border: `1px solid ${color}20`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.75rem', fontFamily: 'ui-monospace,monospace',
        }}>
          <span style={{ color: 'var(--lp-text-2)' }}>{s}</span>
          <span style={{ color, fontSize: '0.68rem' }}>✓ ingested</span>
        </div>
      ))}
    </div>
  )
  if (type === 'reconcile') return (
    <div style={{ padding: '10px 14px', borderRadius: 8, background: `${color}06`, border: `1px solid ${color}15`, fontFamily: 'ui-monospace,monospace', fontSize: '0.72rem', lineHeight: 1.8, color: 'var(--lp-text-2)' }}>
      <div><span style={{ color: '#10B981' }}>✓</span> settlement_1 → charge_1847 <span style={{ color: color }}>MATCHED</span></div>
      <div><span style={{ color: '#10B981' }}>✓</span> settlement_2 → charge_1851 <span style={{ color: color }}>MATCHED</span></div>
      <div><span style={{ color: '#EF4444' }}>✗</span> settlement_3 → <span style={{ color: '#EF4444' }}>GAP DETECTED</span></div>
      <div style={{ marginTop: 4, color: 'var(--lp-text-3)', fontSize: '0.65rem' }}>→ routed to exception queue</div>
    </div>
  )
  if (type === 'compute') return (
    <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: '0.75rem', lineHeight: 2 }}>
      {[
        { label: 'Gross settled', val: '+$3,741,000', c: 'var(--lp-text-1)' },
        { label: 'Reserves', val: '−$480,000', c: '#EF4444' },
        { label: 'Refunds', val: '−$120,000', c: '#EF4444' },
        { label: 'Fees', val: '−$87,000', c: '#EF4444' },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--lp-border)', paddingBottom: 2 }}>
          <span style={{ color: 'var(--lp-text-3)' }}>{r.label}</span>
          <span style={{ color: r.c }}>{r.val}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ color: 'var(--lp-text-2)', fontWeight: 600 }}>Payoutable</span>
        <span style={{ color, fontWeight: 700 }}>$3,054,000</span>
      </div>
    </div>
  )
  if (type === 'decide') return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {[
        { v: 'SAFE', c: '#10B981', bg: 'rgba(16,185,129,0.08)' },
        { v: 'PARTIAL', c: '#D4A853', bg: 'rgba(212,168,83,0.08)' },
        { v: 'BLOCKED', c: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
      ].map(({ v, c, bg }) => (
        <div key={v} style={{
          padding: '8px 14px', borderRadius: 8, background: bg,
          border: `1px solid ${c}30`, fontFamily: 'ui-monospace,monospace',
          fontSize: '0.8rem', fontWeight: 700, color: c,
        }}>
          {v}
        </div>
      ))}
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {['ACH', 'Wire', 'SWIFT'].map((r, i) => (
        <div key={r} style={{
          padding: '6px 14px', borderRadius: 6,
          background: `${color}08`, border: `1px solid ${color}20`,
          fontSize: '0.78rem', fontFamily: 'ui-monospace,monospace',
          color, fontWeight: 600,
        }}>
          {r}
        </div>
      ))}
    </div>
  )
}

export default function LandingHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hiw-header', {
        scrollTrigger: { trigger: '.hiw-header', start: 'top 85%' },
        y: 36, opacity: 0, duration: 0.9, ease: 'expo.out',
      })

      // The vertical progress line
      gsap.from('.hiw-line', {
        scrollTrigger: {
          trigger: '.hiw-steps',
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: 1,
        },
        scaleY: 0,
        transformOrigin: 'top',
      })

      // Steps reveal
      STEPS.forEach((_, i) => {
        gsap.from(`.hiw-step-${i}`, {
          scrollTrigger: { trigger: `.hiw-step-${i}`, start: 'top 82%' },
          x: -30, opacity: 0, duration: 0.8, ease: 'expo.out', delay: i * 0.05,
        })
        gsap.from(`.hiw-visual-${i}`, {
          scrollTrigger: { trigger: `.hiw-step-${i}`, start: 'top 82%' },
          x: 30, opacity: 0, duration: 0.8, ease: 'expo.out', delay: i * 0.05 + 0.1,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" style={{
      padding: '140px 0',
      background: 'var(--lp-surface)',
      borderTop: '1px solid var(--lp-border)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>

        <div className="hiw-header" style={{ marginBottom: 80, maxWidth: 560 }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px', marginBottom: 24,
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--lp-blue)', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            How It Works
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 700, color: 'var(--lp-text-1)',
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16,
          }}>
            Five layers.<br />
            <span style={{ color: 'var(--lp-text-2)' }}>One source of truth.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--lp-text-2)', lineHeight: 1.65 }}>
            Atlas isn&apos;t a reconciliation bolt-on. It&apos;s the complete operational system from raw financial event to confirmed payout.
          </p>
        </div>

        {/* Steps */}
        <div className="hiw-steps" style={{ position: 'relative' }}>
          {/* Left vertical progress bar */}
          <div style={{
            position: 'absolute', left: 23, top: 0, bottom: 0,
            width: 1, background: 'var(--lp-border)',
          }}>
            <div className="hiw-line" style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(to bottom, var(--lp-blue), var(--lp-purple))`,
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className={`hiw-step-${i}`}
                onClick={() => setActive(i)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 320px',
                  gap: 32,
                  padding: '40px 0',
                  borderBottom: i < STEPS.length - 1 ? '1px solid var(--lp-border)' : 'none',
                  cursor: 'pointer',
                  alignItems: 'start',
                }}
              >
                {/* Step dot */}
                <div style={{
                  width: 48, height: 48,
                  borderRadius: '50%',
                  background: active === i ? step.color : 'var(--lp-surface-2)',
                  border: active === i ? `1px solid ${step.color}` : '1px solid var(--lp-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.4s ease',
                  position: 'relative', zIndex: 1,
                }}>
                  <span style={{
                    fontSize: '0.7rem', fontFamily: 'ui-monospace,monospace',
                    fontWeight: 700, color: active === i ? '#fff' : 'var(--lp-text-3)',
                    transition: 'color 0.3s',
                  }}>
                    {step.n}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: step.color, marginBottom: 8,
                  }}>
                    {step.label}
                  </div>
                  <h3 style={{
                    fontSize: '1.35rem', fontWeight: 700, color: 'var(--lp-text-1)',
                    letterSpacing: '-0.02em', marginBottom: 12,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--lp-text-2)', lineHeight: 1.65, maxWidth: 460 }}>
                    {step.desc}
                  </p>
                  {step.tags && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                      {step.tags.map(t => (
                        <span key={t} style={{
                          padding: '3px 9px', borderRadius: 4,
                          background: `${step.color}08`, border: `1px solid ${step.color}18`,
                          fontSize: '0.68rem', fontFamily: 'ui-monospace,monospace',
                          color: step.color, fontWeight: 500, letterSpacing: '0.04em',
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {step.formula && (
                    <div style={{
                      marginTop: 14, padding: '10px 14px', borderRadius: 8,
                      background: `${step.color}06`, border: `1px solid ${step.color}18`,
                      fontSize: '0.72rem', fontFamily: 'ui-monospace,monospace',
                      color: step.color, lineHeight: 1.6,
                    }}>
                      {step.formula}
                    </div>
                  )}
                </div>

                {/* Visual */}
                <div className={`hiw-visual-${i}`} style={{
                  padding: '20px',
                  background: 'var(--lp-surface-2)',
                  border: '1px solid var(--lp-border)',
                  borderRadius: 12,
                  opacity: active === i ? 1 : 0.5,
                  transition: 'opacity 0.3s',
                }}>
                  <StepVisual type={step.visual} color={step.color} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust grid */}
        <div style={{
          marginTop: 80,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          border: '1px solid var(--lp-border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {[
            { label: 'Immutable audit ledger', detail: 'Every operation logged with full lineage' },
            { label: 'Sub-second reconciliation', detail: 'Real-time balance on every committed event' },
            { label: 'Multi-source dedup', detail: 'External ID uniqueness enforced by schema' },
            { label: 'Decimal-exact arithmetic', detail: 'Numeric(18,2) — no floating-point error' },
          ].map(({ label, detail }, i) => (
            <div key={label} style={{
              padding: '28px 28px',
              borderRight: i < 3 ? '1px solid var(--lp-border)' : 'none',
              cursor: 'default',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <div style={{ width: 20, height: 1.5, background: 'var(--lp-blue)', marginBottom: 14, opacity: 0.7 }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--lp-text-1)', marginBottom: 6, lineHeight: 1.35 }}>
                {label}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--lp-text-3)', lineHeight: 1.5 }}>
                {detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

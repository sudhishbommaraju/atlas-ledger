'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CHAOS_ROWS = [
  { source: 'Stripe Export', amount: '+$1,842,000', status: 'delayed', statusLabel: '4h delayed', color: '#EF4444' },
  { source: 'Adyen Batch', amount: '+$1,240,000', status: 'error', statusLabel: 'fee mismatch', color: '#EF4444' },
  { source: 'Reserve Hold', amount: '−$480,000', status: 'locked', statusLabel: 'locked', color: '#F59E0B' },
  { source: 'Bank Statement', amount: '+$620,000', status: 'missing', statusLabel: 'not received', color: '#F59E0B' },
  { source: 'FX Ledger', amount: '+$214,000', status: 'partial', statusLabel: 'partial match', color: '#F59E0B' },
]

const PROBLEMS = [
  {
    n: '01',
    title: 'Spreadsheet reconciliation',
    body: 'Finance teams manually reconcile PSP reports against bank statements. Errors compound. Settlements disappear into email threads.',
  },
  {
    n: '02',
    title: 'Frozen payout cycles',
    body: 'A single mismatch freezes the entire payout queue. Operations teams spend days tracking down a $200 discrepancy.',
  },
  {
    n: '03',
    title: 'No immutable audit trail',
    body: 'Decisions made in Slack DMs. Zero record of who approved what, when, or why a payout was held.',
  },
  {
    n: '04',
    title: 'Multi-PSP schema chaos',
    body: 'Stripe, Adyen, Braintree, and internal ledgers each use different schemas, timestamps, and rounding conventions.',
  },
]

export default function LandingProblem() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.from('.problem-heading', {
        scrollTrigger: { trigger: '.problem-heading', start: 'top 85%' },
        y: 40, opacity: 0, duration: 0.9, ease: 'expo.out',
      })

      // Chaos card reveal
      gsap.from('.chaos-card', {
        scrollTrigger: { trigger: '.chaos-card', start: 'top 85%' },
        y: 30, opacity: 0, duration: 0.8, ease: 'expo.out',
      })

      // Chaos rows stagger
      gsap.from('.chaos-row', {
        scrollTrigger: { trigger: '.chaos-card', start: 'top 80%' },
        x: -20, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.3,
      })

      // Status dots flicker
      gsap.to('.status-dot-error', {
        opacity: 0.3, repeat: -1, yoyo: true, duration: 0.9, ease: 'power2.inOut',
        stagger: { each: 0.4, from: 'random' },
      })

      // Problem list items
      gsap.from('.problem-item', {
        scrollTrigger: { trigger: '.problem-list', start: 'top 80%' },
        y: 24, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'expo.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="problem" style={{
      padding: '140px 0',
      background: 'var(--lp-bg)',
      borderTop: '1px solid var(--lp-border)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>

        {/* Header */}
        <div className="problem-heading" style={{ maxWidth: 640, marginBottom: 80 }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 100,
            fontSize: '0.75rem', fontWeight: 600, color: '#EF4444',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            The Problem
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 700, color: 'var(--lp-text-1)',
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20,
          }}>
            Finance operations built<br />
            <span style={{ color: 'var(--lp-text-2)' }}>on fragile glue.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--lp-text-2)', lineHeight: 1.65 }}>
            Modern payout operations generate fragmented data across banks, PSPs, ERPs, and internal ledgers — none of which reconcile cleanly out of the box.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>

          {/* Left: Chaos visualization */}
          <div className="chaos-card" style={{
            background: 'var(--lp-surface)',
            border: '1px solid var(--lp-border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Header bar */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--lp-border)',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', opacity: 0.3 }} />
              <span style={{ marginLeft: 8, fontSize: '0.78rem', color: 'var(--lp-text-3)', fontFamily: 'ui-monospace,monospace' }}>
                data_sources · unreconciled
              </span>
            </div>

            {/* Rows */}
            <div style={{ padding: '8px 0' }}>
              {CHAOS_ROWS.map((row, i) => (
                <div key={i} className="chaos-row" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom: i < CHAOS_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="status-dot-error" style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: row.color,
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${row.color}`,
                    }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--lp-text-2)', fontFamily: 'ui-monospace,monospace' }}>
                      {row.source}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--lp-text-1)', fontFamily: 'ui-monospace,monospace', fontWeight: 500 }}>
                      {row.amount}
                    </span>
                    <span style={{
                      fontSize: '0.72rem', padding: '2px 9px', borderRadius: 100,
                      background: `${row.color}15`,
                      border: `1px solid ${row.color}30`,
                      color: row.color, fontWeight: 600, whiteSpace: 'nowrap',
                    }}>
                      {row.statusLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--lp-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(239,68,68,0.04)',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--lp-text-3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
                Reconcilable Balance
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.9rem', color: '#EF4444', fontFamily: 'ui-monospace,monospace', fontWeight: 700 }}>
                  UNKNOWN
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 100,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  fontSize: '0.72rem', color: '#EF4444', fontWeight: 700, letterSpacing: '0.06em',
                }}>
                  BLOCKED
                </span>
              </div>
            </div>
          </div>

          {/* Right: Problem list */}
          <div className="problem-list" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PROBLEMS.map((p, i) => (
              <div key={i} className="problem-item" style={{
                display: 'flex', gap: 24,
                padding: '28px 0',
                borderBottom: i < PROBLEMS.length - 1 ? '1px solid var(--lp-border)' : 'none',
              }}>
                <span style={{
                  fontSize: '0.7rem', fontFamily: 'ui-monospace,monospace',
                  color: 'var(--lp-text-3)', marginTop: 3,
                  minWidth: 24, flexShrink: 0,
                }}>
                  {p.n}
                </span>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--lp-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                    {p.title}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--lp-text-2)', lineHeight: 1.6 }}>
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

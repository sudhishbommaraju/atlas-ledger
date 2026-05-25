'use client'
import { useState } from 'react'
import AtlasNav from '@/components/atlas/AtlasNav'
import AtlasFooter from '@/components/atlas/AtlasFooter'
import PageCurtain from '@/components/atlas/PageCurtain'
import Link from 'next/link'

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Counter({ v, l }: { v: number; l: string }) {
  return (
    <div className="atlas-card" style={{ padding: 24 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: '-1px', color: 'var(--ink)' }}>
        {v.toLocaleString()}
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>{l}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, status }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  status?: 'ok' | 'err' | null
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="atlas-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {status === 'ok' && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--status-ok)' }}>
            <CheckIcon size={16} />
          </span>
        )}
        {status === 'err' && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--status-drift)', fontSize: 16 }}>✕</span>
        )}
      </div>
    </div>
  )
}

type Sources = { stripe: boolean; plaid: boolean; netsuite: boolean; custom: boolean }
interface FormState {
  email: string
  company: string
  role: string
  volume: number
  urgency: string
  sources: Sources
}

function CohortPanel({ form }: { form: FormState }) {
  const cellCount = 80
  const selected = Object.values(form.sources).filter(Boolean).length
  const urgencyScore = ({ asap: 1.4, weeks: 1.2, quarter: 1.0, later: 0.7 } as Record<string, number>)[form.urgency] ?? 1
  const score = Math.min(1, (form.volume / 50) * 0.5 + (selected / 4) * 0.3 + urgencyScore * 0.2)
  const position = Math.round(1247 - score * 1100)
  const cohortIdx = Math.max(14, Math.ceil(14 + (position / 30)))

  return (
    <div className="atlas-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>YOUR ESTIMATED PLACEMENT</span>

      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)', marginBottom: 6 }}>
          ESTIMATED POSITION
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, letterSpacing: '-1.4px', lineHeight: 1 }}>
          #{position.toLocaleString()}
        </div>
        <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
          NEXT COHORT · {cohortIdx > 14 ? `COHORT ${cohortIdx}` : 'COHORT 14'}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)', marginBottom: 10 }}>
          COHORT 14 · 12 SEATS · 80 CANDIDATES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
          {Array.from({ length: cellCount }).map((_, i) => {
            const filled = i < 12
            const isYou = i === Math.min(cellCount - 1, Math.floor(score * cellCount))
            return (
              <div key={i} style={{
                aspectRatio: '1 / 1',
                background: isYou ? 'var(--accent-sunset)' : filled ? 'var(--canvas-mid)' : 'var(--canvas-soft)',
                border: '1px solid ' + (isYou ? 'var(--accent-sunset)' : 'var(--hairline)'),
                borderRadius: 2,
                transition: 'all 0.4s ease',
              }} title={isYou ? 'You' : filled ? 'Accepted' : 'Waitlist'} />
            )
          })}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)', flexWrap: 'wrap' }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--canvas-mid)', border: '1px solid var(--hairline)', verticalAlign: 'middle', marginRight: 4 }} />ACCEPTED</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', verticalAlign: 'middle', marginRight: 4 }} />WAITLIST</span>
          <span style={{ color: 'var(--accent-sunset)' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--accent-sunset)', verticalAlign: 'middle', marginRight: 4 }} />YOU
          </span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--hairline)', paddingTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span className="atlas-dot blink" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
            LIVE · 14 OTHERS APPLYING NOW
          </span>
        </div>
        <p style={{ color: 'var(--body-mid)', fontSize: 12, lineHeight: '18px', margin: 0 }}>
          Placement is recomputed daily. Higher volume, more connected sources, and urgent timelines move up.
        </p>
      </div>
    </div>
  )
}

function WaitlistConfirm({ form }: { form: FormState }) {
  const confetti = Array.from({ length: 28 }).map((_, i) => ({
    x: Math.random() * 100,
    d: Math.random() * 0.6,
    c: i % 3,
  }))

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
      {confetti.map((c, i) => (
        <span key={i} style={{
          position: 'absolute', top: 0, left: c.x + '%',
          width: 4, height: 12,
          background: (['var(--accent-sunset)', 'var(--accent-breeze)', 'var(--accent-twilight)'] as string[])[c.c],
          opacity: 0.5,
          animation: `confetti 3s ${c.d}s ease-in forwards`,
        }} />
      ))}

      <div className="container" style={{ maxWidth: 640, textAlign: 'center' }}>
        <span className="atlas-eyebrow" style={{ color: 'var(--status-ok)' }}>
          SUBMITTED · {new Date().toISOString().slice(0, 10)}
        </span>
        <h1 style={{ marginTop: 24, fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 400, lineHeight: 1, letterSpacing: '-1.8px' }}>
          You&apos;re on the list.
        </h1>
        <p style={{ marginTop: 20, color: 'var(--body)', fontSize: 18, lineHeight: '28px' }}>
          We&apos;ve sent a confirmation to{' '}
          <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>
            {form.email || 'you'}
          </span>{' '}
          with your queue position and onboarding checklist.
        </p>

        <div className="atlas-card" style={{ marginTop: 32, padding: 28, textAlign: 'left' }}>
          <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>WHAT HAPPENS NEXT</span>
          <ol style={{ marginTop: 16, padding: 0, listStyle: 'none', display: 'grid', gap: 14 }}>
            {[
              ['01', 'Cohort review',  'We screen the queue every Monday and surface fits to the founders.'],
              ['02', 'Intro call',     '30-minute walkthrough with your data in shadow mode (~14 days from now).'],
              ['03', 'Shadow trial',   '30-day read-only-no-action observation period. You decide whether to enable remediation.'],
              ['04', 'Production',     'Go-live with autonomous remediation, on your schedule.'],
            ].map(([n, t, d]) => (
              <li key={n} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>{n}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '-0.2px' }}>{t}</div>
                  <div style={{ marginTop: 4, color: 'var(--body-mid)', fontSize: 13, lineHeight: '20px' }}>{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/" className="atlas-btn">Back to home</Link>
          <Link href="/security" className="atlas-btn atlas-btn--primary" style={{ gap: 8 }}>
            Read security posture <ArrowIcon size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}

const SOURCES_META = [
  { id: 'stripe',   l: 'Stripe',         s: 'Processor balance + payouts' },
  { id: 'plaid',    l: 'Plaid · Bank',   s: 'Confirmed bank movements' },
  { id: 'netsuite', l: 'NetSuite · ERP', s: 'Posted journal entries' },
  { id: 'custom',   l: 'Custom',         s: 'Connector API + webhooks' },
]

const TIMING = [
  { id: 'asap',    l: 'As soon as possible',   s: 'Live drift in production within 2 weeks' },
  { id: 'weeks',   l: 'Within the next month', s: 'Shadow-mode trial first, then production' },
  { id: 'quarter', l: 'Within this quarter',   s: 'Planning ahead for the next cohort window' },
  { id: 'later',   l: 'Just evaluating',        s: 'Stay on the list, no rush' },
]

export default function WaitlistPage() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FormState>({
    email: '', company: '', role: '', volume: 5, urgency: 'weeks',
    sources: { stripe: true, plaid: false, netsuite: false, custom: false },
  })

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const toggleSrc = (s: keyof Sources) =>
    setForm(f => ({ ...f, sources: { ...f.sources, [s]: !f.sources[s] } }))

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const step1Ok = emailOk && form.company.trim() !== '' && form.role.trim() !== ''
  const step2Ok = Object.values(form.sources).some(Boolean)

  if (submitted) {
    return (
      <>
        <div className="bg-grid" />
        <PageCurtain />
        <div style={{ position: 'relative', zIndex: 1, background: 'var(--canvas)', minHeight: '100vh' }}>
          <AtlasNav />
          <WaitlistConfirm form={form} />
          <AtlasFooter />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="bg-grid" />
      <PageCurtain />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--canvas)', minHeight: '100vh' }}>
        <AtlasNav />

        {/* Hero */}
        <section style={{ padding: '96px 0 56px', position: 'relative' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="rise" style={{ marginBottom: 24 }}>
              <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>INVITATION-ONLY · COHORT 14 · 12 SEATS</span>
            </div>
            <h1 className="rise" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 7vw, 84px)',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-2px',
              maxWidth: 900,
              margin: 0,
              animationDelay: '0.05s',
            }}>
              Join the<br />
              <span style={{ color: 'var(--body-mid)' }}>Atlas waitlist.</span>
            </h1>
            <p className="rise" style={{
              marginTop: 28, maxWidth: 640, color: 'var(--body)',
              fontSize: 18, lineHeight: '28px', animationDelay: '0.1s',
            }}>
              Each cohort is curated for fit. Tell us about your payout footprint and we&apos;ll match you against the next opening — typically within two weeks.
            </p>
          </div>
        </section>

        {/* Counters */}
        <section style={{ padding: '0 0 40px' }}>
          <div className="container">
            <div className="grid-4">
              <Counter v={1247} l="ON WAITLIST" />
              <Counter v={94}   l="COHORTS RELEASED" />
              <Counter v={12}   l="SEATS IN COHORT 14" />
              <Counter v={14}   l="DAYS TO NEXT COHORT" />
            </div>
          </div>
        </section>

        {/* Form + cohort panel */}
        <section style={{ padding: '20px 0 80px' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'stretch' }}>

            {/* Form card */}
            <div className="atlas-card" style={{ padding: 36, position: 'relative' }}>
              {/* Stepper */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                {([{ id: 0, l: '01 / TEAM' }, { id: 1, l: '02 / FOOTPRINT' }, { id: 2, l: '03 / SCHEDULE' }]).map(s => (
                  <div key={s.id} style={{
                    flex: 1, padding: '8px 12px',
                    borderTop: `2px solid ${s.id <= step ? 'var(--accent-sunset)' : 'var(--hairline)'}`,
                    color: s.id <= step ? 'var(--ink)' : 'var(--body-mid)',
                    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px',
                    transition: 'all 0.3s ease',
                  }}>{s.l}</div>
                ))}
              </div>

              {step === 0 && (
                <div className="page-enter">
                  <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>WHO ARE YOU?</span>
                  <h2 style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.6px', fontWeight: 400 }}>
                    Tell us about your team.
                  </h2>
                  <div style={{ marginTop: 28, display: 'grid', gap: 18 }}>
                    <Field
                      label="WORK EMAIL"
                      value={form.email}
                      onChange={v => setField('email', v)}
                      placeholder="you@company.com"
                      status={form.email.length === 0 ? null : emailOk ? 'ok' : 'err'}
                    />
                    <Field label="COMPANY" value={form.company} onChange={v => setField('company', v)} placeholder="Northwind Pay" />
                    <Field label="YOUR ROLE" value={form.role} onChange={v => setField('role', v)} placeholder="VP Payments Ops" />
                  </div>
                  <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="atlas-btn atlas-btn--primary"
                      disabled={!step1Ok}
                      style={{ gap: 8, ...(step1Ok ? {} : { opacity: 0.4, cursor: 'not-allowed' }) }}
                      onClick={() => step1Ok && setStep(1)}
                    >
                      Continue <ArrowIcon size={13} />
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="page-enter">
                  <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>PAYOUT FOOTPRINT</span>
                  <h2 style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.6px', fontWeight: 400 }}>
                    What does Atlas need to read?
                  </h2>
                  <div style={{ marginTop: 28 }}>
                    <label className="field-label">CONNECTED SOURCES (select all that apply)</label>
                    <div className="grid-2" style={{ gap: 12 }}>
                      {SOURCES_META.map(s => {
                        const on = form.sources[s.id as keyof Sources]
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggleSrc(s.id as keyof Sources)}
                            style={{
                              textAlign: 'left', padding: 16,
                              background: on ? 'var(--canvas-soft)' : 'transparent',
                              border: '1px solid ' + (on ? 'rgba(255,255,255,0.25)' : 'var(--hairline)'),
                              borderRadius: 8, cursor: 'pointer', color: 'var(--ink)',
                              display: 'flex', alignItems: 'center', gap: 12,
                              transition: 'all 0.15s ease', fontFamily: 'var(--font-display)',
                            }}
                          >
                            <span style={{
                              width: 16, height: 16, borderRadius: 4,
                              border: '1px solid ' + (on ? 'var(--ink)' : 'var(--hairline)'),
                              background: on ? 'var(--ink)' : 'transparent',
                              display: 'grid', placeItems: 'center',
                              color: 'var(--canvas)', flexShrink: 0,
                            }}>
                              {on && <CheckIcon size={11} />}
                            </span>
                            <div>
                              <div style={{ fontSize: 14 }}>{s.l}</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1px', color: 'var(--body-mid)', textTransform: 'uppercase', marginTop: 4 }}>{s.s}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ marginTop: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <label className="field-label" style={{ margin: 0 }}>DAILY PAYOUT VOLUME</label>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>
                        {form.volume < 1 ? (form.volume * 1000).toFixed(0) + 'K' : form.volume.toFixed(1) + 'M'} / day
                      </span>
                    </div>
                    <input className="atlas-range" type="range" min="0.1" max="50" step="0.1"
                      value={form.volume} onChange={e => setField('volume', parseFloat(e.target.value))} />
                    <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>$100K</span><span>$10M</span><span>$50M+</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
                    <button className="atlas-btn" onClick={() => setStep(0)}>← Back</button>
                    <button
                      className="atlas-btn atlas-btn--primary"
                      disabled={!step2Ok}
                      style={{ gap: 8, ...(step2Ok ? {} : { opacity: 0.4, cursor: 'not-allowed' }) }}
                      onClick={() => step2Ok && setStep(2)}
                    >
                      Continue <ArrowIcon size={13} />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="page-enter">
                  <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>TIMING</span>
                  <h2 style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.6px', fontWeight: 400 }}>
                    When are you looking to onboard?
                  </h2>
                  <div style={{ marginTop: 28, display: 'grid', gap: 10 }}>
                    {TIMING.map(o => {
                      const on = form.urgency === o.id
                      return (
                        <button key={o.id} onClick={() => setField('urgency', o.id)}
                          style={{
                            textAlign: 'left', padding: '16px 18px',
                            background: on ? 'var(--canvas-soft)' : 'transparent',
                            border: '1px solid ' + (on ? 'rgba(255,255,255,0.25)' : 'var(--hairline)'),
                            borderRadius: 8, cursor: 'pointer', color: 'var(--ink)',
                            display: 'flex', alignItems: 'center', gap: 14,
                            transition: 'all 0.15s ease', fontFamily: 'var(--font-display)',
                          }}>
                          <span style={{
                            width: 16, height: 16, borderRadius: '50%',
                            border: '1px solid ' + (on ? 'var(--ink)' : 'var(--hairline)'),
                            display: 'grid', placeItems: 'center', flexShrink: 0,
                          }}>
                            {on && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ink)' }} />}
                          </span>
                          <div>
                            <div style={{ fontSize: 14 }}>{o.l}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1px', color: 'var(--body-mid)', textTransform: 'uppercase', marginTop: 4 }}>{o.s}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
                    <button className="atlas-btn" onClick={() => setStep(1)}>← Back</button>
                    <button className="atlas-btn atlas-btn--primary" onClick={() => setSubmitted(true)} style={{ gap: 8 }}>
                      Submit application <ArrowIcon size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <CohortPanel form={form} />
          </div>
        </section>

        <AtlasFooter />
      </div>
    </>
  )
}

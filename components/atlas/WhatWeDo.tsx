'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import AtlasNav from './AtlasNav'
import AtlasFooter from './AtlasFooter'
import PageCurtain from './PageCurtain'
import DashMockup from './DashMockup'

const MotionGraph = dynamic(() => import('./MotionGraph'), { ssr: false })

// ── Tiny arrow icon ──────────────────────────────────────────────────
function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Ticker bar ───────────────────────────────────────────────────────
function TickerBar() {
  const items = [
    'STRIPE · CONNECTED · 142ms',
    'PLAID · CONNECTED · 89ms',
    'NETSUITE · CONNECTED · 218ms',
    'CONFIDENCE 99.4%',
    'OPEN EVENTS 12',
    'PAYOUT VOLUME OBSERVED $2.4B',
    'LIVE DRIFT DETECTION <1s',
    '12 SOURCE INTEGRATIONS',
  ]
  const doubled = [...items, ...items]
  return (
    <div style={{ borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', overflow: 'hidden', padding: '14px 0' }}>
      <div className="marquee-track">
        {doubled.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '1.2px', color: 'var(--body-mid)', flexShrink: 0 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--status-ok)' }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ position: 'relative', padding: '64px 0 32px', overflow: 'hidden' }}>
      <div className="bg-glow" style={{ top: '-200px', right: '-200px' }} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-grid">
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="rise" style={{ marginBottom: 24 }}>
              <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>CONTINUOUS OPERATIONAL CONTROL LAYER</span>
            </div>
            <h1 className="rise" style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,5.4vw,78px)',
              fontWeight: 400, lineHeight: 0.98, letterSpacing: '-2.4px', margin: 0,
              animationDelay: '0.05s',
            }}>
              Financial certainty<br />
              <span style={{ color: 'var(--body-mid)' }}>before capital moves.</span>
            </h1>
            <p className="rise" style={{
              maxWidth: 520, marginTop: 28,
              fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: '26px',
              color: 'var(--body)', animationDelay: '0.1s',
            }}>
              Atlas monitors Stripe, bank, and ERP in real time — detecting and remediating payout drift autonomously, before unsafe disbursements ship.
            </p>
            <div className="rise" style={{ marginTop: 32, display: 'flex', gap: 12, animationDelay: '0.15s' }}>
              <Link href="/waitlist" className="atlas-btn atlas-btn--primary">
                Request access <ArrowIcon size={14} />
              </Link>
              <Link href="/demo-access" className="atlas-btn">
                View live demo
              </Link>
            </div>
            <div className="rise" style={{ marginTop: 32, display: 'flex', gap: 10, flexWrap: 'wrap', animationDelay: '0.2s' }}>
              {[
                { icon: <span className="atlas-dot pulse-ring" style={{ position: 'relative' }} />, t: 'LIVE · 142ms' },
                { icon: <svg viewBox="0 0 16 16" width={12} height={12} fill="none"><path d="M8 1.5 2.5 4v4.5c0 3 2.4 5.4 5.5 6 3.1-.6 5.5-3 5.5-6V4L8 1.5z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" /></svg>, t: 'SOC 2 TYPE II' },
                { icon: <svg viewBox="0 0 16 16" width={12} height={12} fill="none"><g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="10" height="7" rx="1.2" /><path d="M5 7V5a3 3 0 016 0v2" /></g></svg>, t: 'READ-ONLY' },
              ].map((p, i) => (
                <span key={i} className="atlas-pill" style={{ color: 'var(--body-mid)', padding: '5px 12px' }}>
                  {p.icon}{p.t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: motion graph */}
          <div className="rise" style={{ animationDelay: '0.25s' }}>
            <MotionGraph />
          </div>
        </div>
      </div>

      {/* Dashboard mockup below hero */}
      <div style={{ marginTop: 72, padding: '0 24px' }}>
        <DashMockup />
      </div>
    </section>
  )
}

// ── Flow / pipeline ──────────────────────────────────────────────────
function WhatFlow() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 4), 2200)
    return () => clearInterval(id)
  }, [])

  const steps = [
    { id: 0, eye: '01 / OBSERVE',   t: 'Drift Detection',    d: 'Continuous matching across Stripe, bank, and ERP. Sub-second detection of mismatches, missing payouts, and timing drift.' },
    { id: 1, eye: '02 / RECONCILE', t: 'Canonical State',    d: 'A single internal model of every dollar in flight — Stripe events, bank movements, ERP postings normalized.' },
    { id: 2, eye: '03 / REMEDIATE', t: 'Autonomous Control', d: 'Freeze unsafe payouts, block duplicates, quarantine drifted balances — with confidence scores and full audit trail.' },
    { id: 3, eye: '04 / REPORT',    t: 'Auditable Trail',    d: 'Every decision is logged with provenance. Export to your auditor or compliance tooling in one call.' },
  ]

  return (
    <section style={{ padding: '120px 0 60px' }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="atlas-eyebrow">THE PLATFORM</span>
            <h2 style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 400, lineHeight: 1, letterSpacing: '-1.4px', maxWidth: 760, margin: '18px 0 0' }}>
              Four layers between every dollar<br /><span style={{ color: 'var(--body-mid)' }}>and an unsafe payout.</span>
            </h2>
          </div>
        </div>

        {/* Pipeline SVG */}
        <div style={{ position: 'relative', marginBottom: 56 }}>
          <svg viewBox="0 0 1200 80" width="100%" style={{ display: 'block', maxHeight: 80 }}>
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="var(--accent-sunset)" stopOpacity="0.5" />
                <stop offset="1" stopColor="var(--accent-sunset)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="60" x2="1140" y1="40" y2="40" stroke="var(--hairline)" strokeWidth="1" />
            <line className="dash-anim" x1="60" x2="1140" y1="40" y2="40" stroke="var(--accent-sunset)" strokeWidth="1.5" opacity="0.6" />
            {steps.map((s, i) => {
              const x = 60 + i * (1080 / 3)
              const on = i === step
              return (
                <g key={s.id}>
                  <circle cx={x} cy="40" r={on ? 10 : 6}
                    fill={on ? 'var(--accent-sunset)' : 'var(--canvas-card)'}
                    stroke={on ? 'var(--accent-sunset)' : 'var(--hairline)'}
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.4s ease' }} />
                  {on && <circle cx={x} cy="40" r="16" fill="none" stroke="var(--accent-sunset)" strokeWidth="1" opacity="0.4" />}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="grid-4">
          {steps.map(s => {
            const on = s.id === step
            return (
              <div key={s.id} className="atlas-card hover-lift"
                style={{
                  padding: 24, minHeight: 220, display: 'flex', flexDirection: 'column',
                  borderColor: on ? 'rgba(255,122,23,0.4)' : 'var(--hairline)',
                  background: on ? 'rgba(255,122,23,0.04)' : 'var(--canvas-card)',
                  transition: 'all 0.4s ease', cursor: 'default',
                }}
                onMouseEnter={() => setStep(s.id)}>
                <span className="atlas-eyebrow" style={{ color: on ? 'var(--accent-sunset)' : undefined }}>{s.eye}</span>
                <h3 style={{ marginTop: 24, fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: '26px', letterSpacing: '-0.4px', fontWeight: 400 }}>{s.t}</h3>
                <p style={{ marginTop: 14, color: 'var(--body)', fontSize: 14, lineHeight: '22px', flex: 1 }}>{s.d}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Interactive drift demo ────────────────────────────────────────────
function WhatInteractiveDemo() {
  const [driftPct, setDriftPct] = useState(2.4)
  const [latency, setLatency] = useState(0.8)
  const [volume, setVolume] = useState(2.4)

  const severity = driftPct < 1 ? 'low' : driftPct < 3 ? 'medium' : driftPct < 6 ? 'high' : 'critical'
  const sevColor = { low: 'var(--severity-low)', medium: 'var(--severity-medium)', high: 'var(--severity-high)', critical: 'var(--severity-critical)' }[severity]
  const exposure = volume * 1000000 * (driftPct / 100)
  const action = severity === 'critical' ? 'FREEZE PAYOUT' : severity === 'high' ? 'REQUIRE APPROVAL' : severity === 'medium' ? 'FLAG FOR REVIEW' : 'ALLOW · LOGGED'

  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--hairline)' }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="atlas-eyebrow">INTERACTIVE DEMO</span>
            <h2 style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400, lineHeight: 1, letterSpacing: '-1.2px', maxWidth: 700, margin: '18px 0 0' }}>
              Simulate a drift event.
            </h2>
            <p style={{ marginTop: 16, color: 'var(--body)', fontSize: 16, lineHeight: '24px', maxWidth: 560 }}>
              Drag the controls to see how Atlas grades severity, computes exposure, and decides whether to freeze, hold, or pass a payout — in under a second.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
          {/* Controls */}
          <div className="atlas-card" style={{ padding: 28 }}>
            <span className="atlas-eyebrow" style={{ display: 'block', marginBottom: 28 }}>INPUTS</span>
            {[
              { label: 'Drift %', suffix: '%', value: driftPct, min: 0, max: 12, step: 0.1, onChange: setDriftPct, hint: 'Ratio between Stripe-reported and bank-confirmed balance.' },
              { label: 'Detection latency', suffix: 's', value: latency, min: 0.1, max: 5, step: 0.1, onChange: setLatency, hint: 'Time between event occurrence and Atlas detection.' },
              { label: 'Payout volume', suffix: 'M / day', value: volume, min: 0.1, max: 20, step: 0.1, onChange: setVolume, hint: 'Daily disbursement throughput on the affected channel.' },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink)' }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>{r.value.toFixed(1)}{r.suffix}</span>
                </div>
                <input className="atlas-range" type="range" min={r.min} max={r.max} step={r.step} value={r.value}
                  onChange={e => r.onChange(parseFloat(e.target.value))} />
                <div style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--body-mid)', lineHeight: '18px' }}>{r.hint}</div>
              </div>
            ))}
          </div>

          {/* Output */}
          <div className="atlas-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="atlas-eyebrow">ATLAS DECISION</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
                EVT_<span style={{ color: 'var(--ink)' }}>{('000' + Math.floor(driftPct * 100 + latency * 10)).slice(-4)}</span>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { l: 'SEVERITY', v: severity.toUpperCase(), accent: sevColor },
                { l: 'EXPOSURE', v: '$' + Math.round(exposure).toLocaleString() },
                { l: 'DETECT IN', v: latency.toFixed(1) + 's', accent: latency < 1 ? 'var(--status-ok)' : latency < 3 ? 'var(--status-warn)' : 'var(--status-drift)' },
              ].map(s => (
                <div key={s.l} style={{ border: '1px solid var(--hairline)', borderRadius: 8, padding: 16, background: 'var(--canvas)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>{s.l}</div>
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: '-0.4px', color: s.accent ?? 'var(--ink)' }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Severity bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>DRIFT GRADIENT</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: sevColor }}>{driftPct.toFixed(1)}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--canvas-soft)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--severity-low) 0%, var(--severity-medium) 33%, var(--severity-high) 66%, var(--severity-critical) 100%)', opacity: 0.25 }} />
                <div className="bar-fill" style={{ height: '100%', width: Math.min(100, (driftPct / 12) * 100) + '%', background: sevColor }} />
              </div>
            </div>

            {/* Decision box */}
            <div style={{
              border: `1px solid ${sevColor}44`, background: 'rgba(255,255,255,0.02)',
              borderRadius: 8, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>RECOMMENDED ACTION</div>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-0.4px', color: sevColor }}>{action}</div>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--body-mid)', lineHeight: '20px', maxWidth: 460 }}>
                  {severity === 'critical' && 'Disbursement halted. Capital quarantined pending operator approval. Stripe + bank balances reconciled.'}
                  {severity === 'high'     && 'Held in pre-payout queue. Operator review required within 15 minutes.'}
                  {severity === 'medium'   && 'Logged with elevated confidence threshold. Reviewed at end-of-day batch.'}
                  {severity === 'low'      && 'Within tolerance band. Logged. No action taken.'}
                </div>
              </div>
              <button className="atlas-btn atlas-btn--primary" style={{ flexShrink: 0 }}>
                Approve <ArrowIcon size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Code block (tabbed + typewriter) ─────────────────────────────────
type Seg = { cls: string | null; text: string }

function flattenCode(lines: Array<Array<string | { c: string; t: string }>>): Seg[] {
  const out: Seg[] = []
  lines.forEach((line, lineIdx) => {
    line.forEach(tok => {
      if (typeof tok === 'string') {
        if (tok === '') return
        out.push({ cls: tok.startsWith('//') ? 'cmt' : null, text: tok })
      } else {
        out.push({ cls: tok.c, text: tok.t })
      }
    })
    if (lineIdx < lines.length - 1) out.push({ cls: null, text: '\n' })
  })
  return out
}

const SAMPLES = {
  webhook: {
    lang: 'node.js',
    code: [
      ['// Subscribe to drift events as they happen'],
      [''],
      ['import ', { c: 'kw', t: 'Atlas' }, ' from ', { c: 'str', t: "'@atlas/sdk'" }],
      [''],
      ['const ', { c: 'key', t: 'atlas' }, ' = new Atlas({ apiKey: process.env.ATLAS_KEY });'],
      [''],
      [{ c: 'key', t: 'atlas' }, '.on(', { c: 'str', t: "'drift'" }, ', ', { c: 'kw', t: 'async' }, ' (event) => {'],
      ['  ', { c: 'kw', t: 'if' }, ' (event.severity === ', { c: 'str', t: "'critical'" }, ') {'],
      ['    ', { c: 'kw', t: 'await' }, ' stripe.payouts.freeze(event.payoutId);'],
      ['    ', { c: 'kw', t: 'await' }, ' slack.notify(', { c: 'str', t: "'#payout-ops'" }, ', event);'],
      ['  }'],
      ['});'],
    ],
  },
  rest: {
    lang: 'curl',
    code: [
      ['// Pull canonical state on demand'],
      [''],
      [{ c: 'kw', t: 'curl' }, ' -X GET ', { c: 'str', t: "'https://api.atlas.co/v1/state'" }, ' \\'],
      ['  -H ', { c: 'str', t: "'Authorization: Bearer $ATLAS_KEY'" }],
      [''],
      ['{'],
      ['  ', { c: 'key', t: '"stripe_balance"' }, ': ', { c: 'num', t: '2418032.10' }, ','],
      ['  ', { c: 'key', t: '"bank_balance"' }, ':   ', { c: 'num', t: '2275210.00' }, ','],
      ['  ', { c: 'key', t: '"safe_to_disburse"' }, ': ', { c: 'num', t: '2201800.00' }, ','],
      ['  ', { c: 'key', t: '"confidence"' }, ':     ', { c: 'num', t: '0.994' }],
      ['}'],
    ],
  },
  rule: {
    lang: 'atlas/rules',
    code: [
      ['// Define a custom remediation policy'],
      [''],
      [{ c: 'kw', t: 'rule' }, ' ', { c: 'key', t: '"high-exposure-freeze"' }, ' {'],
      ['  ', { c: 'kw', t: 'when' }, ' drift.exposure_usd ', { c: 'ok', t: '>' }, ' ', { c: 'num', t: '100000' }],
      ['    ', { c: 'kw', t: 'and' }, ' drift.severity ', { c: 'ok', t: 'in' }, ' (', { c: 'str', t: '"high"' }, ', ', { c: 'str', t: '"critical"' }, ')'],
      ['  ', { c: 'kw', t: 'then' }, ' {'],
      ['    payouts.freeze();'],
      ['    ops.page(', { c: 'str', t: '"oncall"' }, ', severity = ', { c: 'drift', t: '"P1"' }, ');'],
      ['    audit.record({ ', { c: 'key', t: 'reason' }, ': ', { c: 'str', t: '"automatic-freeze"' }, ' });'],
      ['  }'],
      ['}'],
    ],
  },
} as const

type TabKey = keyof typeof SAMPLES

function WhatCodeBlock() {
  const [tab, setTab] = useState<TabKey>('webhook')
  const sample = SAMPLES[tab]
  const segments = useMemo(() => flattenCode(sample.code as unknown as Array<Array<string | { c: string; t: string }>>), [tab])
  const totalChars = useMemo(() => segments.reduce((n, s) => n + s.text.length, 0), [segments])

  const [revealed, setRevealed] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    setRevealed(0)
    setIsTyping(true)
    startedRef.current = false
  }, [tab])

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !startedRef.current) {
        startedRef.current = true
        const start = performance.now()
        const dur = Math.min(4500, Math.max(1800, totalChars * 14))
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur)
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
          setRevealed(Math.floor(eased * totalChars))
          if (t < 1) requestAnimationFrame(tick)
          else { setRevealed(totalChars); setIsTyping(false) }
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.2 })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [tab, totalChars])

  const lines = useMemo(() => {
    const result: Seg[][] = [[]]
    let used = 0
    for (const seg of segments) {
      if (used >= revealed) break
      const remaining = revealed - used
      if (seg.text === '\n') { result.push([]); used += 1; continue }
      const take = Math.min(seg.text.length, remaining)
      if (take > 0) {
        result[result.length - 1].push({ cls: seg.cls, text: seg.text.slice(0, take) })
        used += take
      }
      if (take < seg.text.length) break
    }
    return result
  }, [segments, revealed])

  const maxLineCount = sample.code.length
  const displayLines = lines.length < maxLineCount
    ? [...lines, ...Array.from({ length: maxLineCount - lines.length }, () => [] as Seg[])]
    : lines

  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--hairline)' }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="atlas-eyebrow">BUILT FOR ENGINEERS</span>
            <h2 style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400, lineHeight: 1, letterSpacing: '-1.2px', maxWidth: 700, margin: '18px 0 0' }}>
              SDKs, webhooks, and a rules engine.
            </h2>
          </div>
          <div className="seg">
            {([['webhook', 'WEBHOOK'], ['rest', 'REST'], ['rule', 'RULES']] as [TabKey, string][]).map(([id, l]) => (
              <button key={id} data-on={tab === id ? 'true' : undefined} onClick={() => setTab(id)}>{l}</button>
            ))}
          </div>
        </div>

        <div ref={containerRef} className="atlas-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--hairline)', background: 'var(--canvas-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="atlas-dot" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--body-mid)', textTransform: 'uppercase' }}>
                {sample.lang} · {tab}.atlas.example
              </span>
              {isTyping && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--accent-sunset)', textTransform: 'uppercase', marginLeft: 6 }}>
                  · TYPING
                </span>
              )}
            </div>
            <button className="atlas-btn atlas-btn--sm" style={{ fontSize: 11 }} disabled={isTyping}
              onClick={() => { const txt = segments.map(s => s.text).join(''); navigator.clipboard?.writeText(txt) }}>
              {isTyping ? '…' : 'Copy'}
            </button>
          </div>
          <div className="code-feed" style={{ padding: 24, minHeight: 320 }}>
            {displayLines.map((line, i) => {
              const isCursorLine = isTyping && i === lines.length - 1
              return (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <span style={{ color: 'var(--canvas-mid)', width: 24, textAlign: 'right' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ minHeight: 20 }}>
                    {line.map((tok, j) => {
                      if (!tok.cls) return <span key={j}>{tok.text}</span>
                      return <span key={j} className={tok.cls}>{tok.text}</span>
                    })}
                    {isCursorLine && <span className="caret-inline" />}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Metrics ───────────────────────────────────────────────────────────
function CountUp({ v, s, l, pre = '' }: { v: number; s: string; l: string; pre?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400)
      setVal(v * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { raf = requestAnimationFrame(tick); obs.disconnect() }
    })
    if (ref.current) obs.observe(ref.current)
    return () => { obs.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [v])
  const display = v >= 10 ? Math.round(val) : val.toFixed(1)
  return (
    <div ref={ref}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 400, lineHeight: 1, letterSpacing: '-1.6px', color: 'var(--ink)' }}>
        {pre}{display}{s}
      </div>
      <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--body-mid)' }}>{l}</div>
    </div>
  )
}

function WhatMetrics() {
  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
        <CountUp v={2.4}  s="B+"  l="PAYOUT VOLUME OBSERVED" pre="$" />
        <CountUp v={1.0}  s="s"   l="MAX DETECTION TIME" pre="<" />
        <CountUp v={99.8} s="%"   l="STATE CONFIDENCE" />
        <CountUp v={12}   s=""    l="SOURCE INTEGRATIONS" />
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────
function WhatCTA() {
  return (
    <section style={{ padding: '120px 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-1.8px', maxWidth: 800, margin: '0 auto' }}>
          Stop blindly triggering<br /><span style={{ color: 'var(--body-mid)' }}>unsafe payouts.</span>
        </h2>
        <p style={{ marginTop: 24, color: 'var(--body)', fontSize: 18, lineHeight: '28px', maxWidth: 520, marginInline: 'auto' }}>
          Invitation-only access for payout operations teams processing high-volume settlement flows.
        </p>
        <div style={{ marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/waitlist" className="atlas-btn atlas-btn--primary">
            Join the waitlist <ArrowIcon size={14} />
          </Link>
          <Link href="/security" className="atlas-btn">
            How we secure data
          </Link>
        </div>
      </div>
    </section>
  )
}

export { TickerBar, WhatInteractiveDemo, WhatCodeBlock }

// ── Page ──────────────────────────────────────────────────────────────
export default function WhatWeDo() {
  return (
    <>
      <div className="bg-grid" />
      <PageCurtain />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--canvas)', minHeight: '100vh' }}>
        <AtlasNav />
        <Hero />
        <TickerBar />
        <WhatFlow />
        <WhatInteractiveDemo />
        <WhatCodeBlock />
        <WhatMetrics />
        <WhatCTA />
        <AtlasFooter />
      </div>
    </>
  )
}

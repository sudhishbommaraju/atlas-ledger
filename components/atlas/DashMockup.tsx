'use client'
import { useEffect, useState, useMemo } from 'react'

function fmt(n: number) { return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }) }

function MiniDriftChart({ tick }: { tick: number }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i < 60; i++) {
      const base = 50
      const sA = base + Math.sin(i / 5) * 16 + Math.cos(i / 8) * 6
      const sB = base + Math.sin(i / 5 + 0.4) * 14 + Math.cos(i / 8 + 0.2) * 5
        + (i > 42 && i < 50 ? (i - 42) * 1.6 : 0)
      pts.push({ sA, sB })
    }
    return pts
  }, [])

  const w = 800, h = 140, pad = 4
  const xScale = (x: number) => pad + (x / 59) * (w - pad * 2)
  const yScale = (y: number) => h - pad - ((y - 20) / 60) * (h - pad * 2)

  const pathA = points.map((p, i) => `${i ? 'L' : 'M'}${xScale(i)},${yScale(p.sA)}`).join(' ')
  const pathB = points.map((p, i) => `${i ? 'L' : 'M'}${xScale(i)},${yScale(p.sB)}`).join(' ')
  const cursor = (tick * 2) % 60
  const cursorX = xScale(cursor)

  return (
    <div style={{ border: '1px solid var(--hairline)', borderRadius: 8, padding: 16, background: 'var(--canvas)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
          STRIPE vs BANK · LAST 60 MIN
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {[['var(--ink)', 'STRIPE'], ['var(--severity-high)', 'BANK']].map(([c, l]) => (
            <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
              <span style={{ width: 10, height: 2, background: c }} />{l}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={0} x2={w} y1={pad + (i * (h - pad * 2)) / 3} y2={pad + (i * (h - pad * 2)) / 3}
            stroke="var(--hairline)" strokeWidth="1" />
        ))}
        <rect x={xScale(42)} y={pad} width={xScale(50) - xScale(42)} height={h - pad * 2} fill="rgba(255,90,77,0.08)" />
        <path d={pathA} stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <path d={pathB} stroke="var(--severity-high)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <line x1={cursorX} x2={cursorX} y1={pad} y2={h - pad} stroke="var(--body-mid)" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx={cursorX} cy={yScale(points[Math.floor(cursor)]?.sB ?? 50)} r="3" fill="var(--severity-high)" />
        <circle cx={cursorX} cy={yScale(points[Math.floor(cursor)]?.sA ?? 50)} r="3" fill="var(--ink)" />
      </svg>
    </div>
  )
}

export default function DashMockup() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1800)
    return () => clearInterval(id)
  }, [])

  const stripeBal = 2418032 + Math.sin(tick / 3) * 480
  const bankBal   = 2275210 + Math.cos(tick / 4) * 320
  const erpBal    = 2418032
  const safeBal   = 2201800 + Math.sin(tick / 5) * 180
  const conf      = 99.4 + Math.sin(tick / 6) * 0.2

  return (
    <div className="tilt-device" style={{ width: '100%', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: '-40px',
        background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255,122,23,0.15), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        background: 'var(--canvas-card)', border: '1px solid var(--hairline)', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 0 0 1px var(--hairline), 0 60px 120px rgba(0,0,0,0.5)',
      }}>
        {/* Title bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--hairline)', background: 'var(--canvas-soft)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--canvas-mid)' }} />)}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--body-mid)', textTransform: 'uppercase' }}>
              atlas.northwind.so · drift detection
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="atlas-dot blink" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--status-ok)', textTransform: 'uppercase' }}>LIVE</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 480 }}>
          {/* Sidebar */}
          <aside style={{ borderRight: '1px solid var(--hairline)', padding: '20px 12px', background: 'var(--canvas)' }}>
            <div style={{ padding: '0 8px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>OBSERVE</div>
            {[{ label: 'Drift Detection', on: true }, { label: 'Canonical State' }, { label: 'Lineage' }].map(s => (
              <div key={s.label} style={{
                padding: '7px 10px', borderRadius: 6, marginBottom: 2,
                fontFamily: 'var(--font-display)', fontSize: 12.5,
                color: s.on ? 'var(--ink)' : 'var(--body-mid)',
                background: s.on ? 'var(--canvas-soft)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.on ? 'var(--ink)' : 'var(--hairline)' }} />
                {s.label}
              </div>
            ))}
            <div style={{ padding: '20px 8px 10px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>AUDIT</div>
            {['Audit Log', 'Integrations'].map(l => (
              <div key={l} style={{ padding: '7px 10px', fontFamily: 'var(--font-display)', fontSize: 12.5, color: 'var(--body-mid)' }}>{l}</div>
            ))}
          </aside>

          {/* Main */}
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)', textTransform: 'uppercase' }}>
                  OBSERVING · STRIPE ↔ BANK ↔ ERP
                </div>
                <div style={{ marginTop: 4, fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.6px' }}>Drift Detection</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['CONFIDENCE', conf.toFixed(1) + '%'], ['EVENTS', '12']].map(([l, v]) => (
                  <div key={l} style={{
                    border: '1px solid var(--hairline)', borderRadius: 8, padding: '6px 12px',
                    fontFamily: 'var(--font-mono)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ color: 'var(--body-mid)', letterSpacing: '1.2px' }}>{l}</span>
                    <span style={{ color: 'var(--ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid var(--hairline)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
              {[
                { l: 'STRIPE',          v: fmt(stripeBal) },
                { l: 'BANK',            v: fmt(bankBal) },
                { l: 'ERP',             v: fmt(erpBal) },
                { l: 'SAFE TO DISBURSE', v: fmt(safeBal), accent: true },
              ].map((m, i) => (
                <div key={m.l} style={{
                  padding: 16,
                  borderRight: i < 3 ? '1px solid var(--hairline)' : undefined,
                  background: m.accent ? 'var(--canvas-mid)' : 'transparent',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>{m.l}</div>
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: '-0.4px', color: 'var(--ink)' }}>{m.v}</div>
                </div>
              ))}
            </div>

            <MiniDriftChart tick={tick} />

            {/* Event rows */}
            <div style={{ marginTop: 16, border: '1px solid var(--hairline)', borderRadius: 8, overflow: 'hidden' }}>
              {[
                { id: 'EVT_0181', d: 'Settlement mismatch · Stripe ↔ Bank', sev: 'critical', exp: '$142,800.00' },
                { id: 'EVT_0179', d: 'Timing drift · ERP posting late',     sev: 'high',     exp: '$18,420.50' },
                { id: 'EVT_0177', d: 'Duplicate payout candidate',           sev: 'medium',   exp: '$2,310.00' },
              ].map((r, i) => (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: '100px 1fr auto auto',
                  gap: 12, alignItems: 'center', padding: '12px 16px',
                  borderBottom: i < 2 ? '1px solid var(--hairline)' : undefined,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink)' }}>{r.id}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--body)' }}>{r.d}</span>
                  <span className={`atlas-pill atlas-pill--${r.sev}`} style={{ fontSize: 10 }}>{r.sev}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>{r.exp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

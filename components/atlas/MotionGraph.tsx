'use client'
import { useEffect, useState } from 'react'

const SOURCES = [
  { id: 'stripe',   label: 'Stripe',       sub: 'balance.read',  col: '#635BFF', base: 2418032, events: 12431 },
  { id: 'bank',     label: 'Plaid · Bank', sub: 'accounts.read', col: '#00B388', base: 2275210, events:  8247 },
  { id: 'netsuite', label: 'NetSuite ERP', sub: 'journal.read',  col: '#FF7A17', base: 2418032, events:  5108 },
]

function pad(n: number, w = 2) { return n.toString().padStart(w, '0') }
function nowTs() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

interface FeedEntry { id: number; ts: string; src: string; msg: string; tone: 'ok' | 'warn' | 'drift' }

function seedEvents(): FeedEntry[] {
  let id = 1180
  const ts = nowTs()
  return [
    { id: ++id, ts, src: 'ATLAS',    msg: 'Reconciliation pass complete · 99.7%', tone: 'ok' },
    { id: ++id, ts, src: 'STRIPE',   msg: 'payout.created · $24,820',             tone: 'ok' },
    { id: ++id, ts, src: 'ATLAS',    msg: 'Confidence raised to 99.7%',           tone: 'ok' },
    { id: ++id, ts, src: 'ATLAS',    msg: 'ACT_0421 · payout frozen · $142,800',  tone: 'warn' },
    { id: ++id, ts, src: 'ATLAS',    msg: 'EVT_0181 · settlement mismatch',       tone: 'drift' },
    { id: ++id, ts, src: 'BANK',     msg: 'deposit.confirmed · $1.2M',            tone: 'ok' },
    { id: ++id, ts, src: 'NETSUITE', msg: 'journal.posted · 18 entries',          tone: 'ok' },
  ].reverse() as FeedEntry[]
}

function makeRandomEvent(prevId: number): FeedEntry {
  const ts = nowTs()
  const id = prevId + 1
  const choices: Array<Omit<FeedEntry, 'id' | 'ts'>> = [
    { src: 'STRIPE',   msg: `payout.created · $${Math.floor(Math.random()*60)+5},${Math.floor(Math.random()*999).toString().padStart(3,'0')}`,   tone: 'ok' },
    { src: 'BANK',     msg: `deposit.confirmed · $${(Math.random()*2).toFixed(1)}M`,                                                              tone: 'ok' },
    { src: 'NETSUITE', msg: `journal.posted · ${Math.floor(Math.random()*30+5)} entries`,                                                         tone: 'ok' },
    { src: 'ATLAS',    msg: `Reconciliation pass complete · 99.${Math.floor(Math.random()*9)}%`,                                                  tone: 'ok' },
    { src: 'ATLAS',    msg: `EVT_${Math.floor(Math.random()*9000+100)} · timing drift · ERP late`,                                                tone: 'warn' },
    { src: 'ATLAS',    msg: `ACT_${Math.floor(Math.random()*900+100)} · payout held for review`,                                                  tone: 'warn' },
  ]
  return { id, ts, ...choices[Math.floor(Math.random() * choices.length)] }
}

export default function MotionGraph() {
  const [t, setT] = useState(0)
  const [events, setEvents] = useState<FeedEntry[]>(() => seedEvents())

  useEffect(() => {
    let raf: number
    const loop = () => { setT(x => x + 1); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (t % 48 === 0 && t > 0) {
      setEvents(prev => [makeRandomEvent(prev[0]?.id ?? 1200), ...prev.slice(0, 11)])
    }
  }, [t])

  const driftVal = (s: typeof SOURCES[0], i: number) =>
    s.base + Math.sin(t / (30 + i * 5)) * 240 + Math.cos(t / 40 + i) * 80

  const confidence = 99.7 + Math.sin(t / 60) * 0.2
  const flow = 2.45 + Math.sin(t / 50) * 0.04

  return (
    <div style={{
      position: 'relative', width: '100%', height: 520, borderRadius: 12,
      border: '1px solid var(--hairline)',
      background: 'linear-gradient(180deg, var(--canvas-card), var(--canvas) 80%)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--hairline)', background: 'rgba(10,10,10,0.55)', zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="atlas-dot blink" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--ink)' }}>
            ATLAS · OBSERVING
          </span>
        </div>
        <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
          <span>SOURCES <span style={{ color: 'var(--status-ok)' }}>3/3</span></span>
          <span>CONFIDENCE <span style={{ color: 'var(--status-ok)' }}>{confidence.toFixed(1)}%</span></span>
          <span>FLOW <span style={{ color: 'var(--ink)' }}>${flow.toFixed(2)}B</span></span>
        </div>
      </div>

      {/* Connectors + hub */}
      <div style={{ padding: '18px 18px 12px', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SOURCES.map((s, i) => (
              <SteadyConnector key={s.id} src={s} index={i} value={driftVal(s, i)} />
            ))}
          </div>
          <SteadyHub t={t} />
        </div>
      </div>

      {/* Event feed */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--hairline)', background: 'var(--canvas)' }}>
        <div style={{ padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--hairline)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>LIVE EVENT FEED</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
            <span className="atlas-dot blink" />STREAMING · 142ms
          </span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '8px 18px 12px' }}>
          {events.slice(0, 7).map((e, i) => {
            const tone = e.tone === 'drift' ? 'var(--status-drift)' : e.tone === 'warn' ? 'var(--status-warn)' : 'var(--status-ok)'
            return (
              <div key={e.id} style={{
                display: 'grid', gridTemplateColumns: '54px 70px 1fr 16px', gap: 10,
                alignItems: 'baseline', fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: '18px',
                opacity: 1 - i * 0.1,
                animation: i === 0 ? 'feed-enter 0.4s ease-out' : undefined,
                marginBottom: 4,
              }}>
                <span style={{ color: 'var(--canvas-mid)' }}>{e.ts}</span>
                <span style={{ color: e.src === 'ATLAS' ? 'var(--ink)' : 'var(--accent-sunset-soft)' }}>{e.src}</span>
                <span style={{ color: 'var(--body)' }}>{e.msg}</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone, justifySelf: 'end', alignSelf: 'center' }} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{
        padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid var(--hairline)', background: 'rgba(10,10,10,0.55)',
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--body-mid)',
      }}>
        <span><span style={{ color: 'var(--status-ok)' }}>● </span>ALL SYSTEMS CONNECTED · OBSERVING</span>
        <span>UPTIME 247D · {Math.floor(t / 60) % 60}m</span>
      </div>
    </div>
  )
}

function SteadyConnector({ src, index, value }: { src: typeof SOURCES[0]; index: number; value: number }) {
  return (
    <div style={{
      padding: '12px 14px', border: '1px solid rgba(95,200,143,0.3)',
      borderRadius: 8, background: 'rgba(95,200,143,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: src.col,
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-display)', fontSize: 14, color: '#fff', flexShrink: 0,
        }}>
          {src.label[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--ink)' }}>{src.label}</div>
          <div style={{ marginTop: 2, fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '1.1px', color: 'var(--body-mid)' }}>
            {src.sub} · {src.events.toLocaleString()} events
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-ok)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '1.1px', color: 'var(--status-ok)' }}>STREAMING</span>
        </div>
      </div>

      <div style={{ marginTop: 10, height: 3, background: 'var(--canvas-soft)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, var(--status-ok) 50%, transparent 100%)',
          backgroundSize: '40% 100%', backgroundRepeat: 'no-repeat',
          animation: 'data-flow 1.6s linear infinite',
          animationDelay: `${index * 0.4}s`, opacity: 0.7,
        }} />
      </div>

      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '1.1px', color: 'var(--body-mid)' }}>BALANCE</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)' }}>
          ${Math.round(value).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

function SteadyHub({ t }: { t: number }) {
  return (
    <div style={{ position: 'relative', display: 'grid', placeItems: 'center', height: '100%' }}>
      {[0, 1, 2].map(i => {
        const phase = ((t + i * 40) % 120) / 120
        return (
          <span key={i} style={{
            position: 'absolute',
            width: 44 + phase * 70, height: 44 + phase * 70,
            borderRadius: '50%', border: '1px solid rgba(95,200,143,0.4)',
            opacity: 1 - phase, pointerEvents: 'none',
          }} />
        )
      })}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'var(--canvas)', border: '1.5px solid var(--status-ok)',
        display: 'grid', placeItems: 'center', zIndex: 1,
      }}>
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <path d="M12 2.6L22.4 20.6a1.2 1.2 0 01-1.04 1.8H2.64a1.2 1.2 0 01-1.04-1.8Z" fill="white" />
          <rect x="7.2" y="14.6" width="9.6" height="2.2" rx="1.1" fill="var(--canvas)" />
        </svg>
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '1.1px', color: 'var(--status-ok)',
        textAlign: 'center', position: 'absolute', bottom: -2,
      }}>LIVE</span>
    </div>
  )
}

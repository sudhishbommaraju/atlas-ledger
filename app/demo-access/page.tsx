'use client'
import { useState, useEffect, useRef } from 'react'
import AtlasNav from '@/components/atlas/AtlasNav'
import AtlasFooter from '@/components/atlas/AtlasFooter'
import PageCurtain from '@/components/atlas/PageCurtain'
import DashMockup from '@/components/atlas/DashMockup'
import { TickerBar, WhatInteractiveDemo, WhatCodeBlock } from '@/components/atlas/WhatWeDo'
import Link from 'next/link'

const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Atlas2016!'

function LockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <rect x="3" y="7" width="10" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function KeyIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <circle cx="5" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9l6-6m-2 2 2 2m-4 0 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DemoGateBg() {
  const [t, setT] = useState(0)
  useEffect(() => {
    let raf: number
    const loop = () => { setT(x => x + 1); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 600">
      <defs>
        <pattern id="gate-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" stroke="var(--hairline)" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gate-grid)" />
      <line
        x1={(t * 1.5) % 1000 - 100} x2={(t * 1.5) % 1000 - 100}
        y1="0" y2="600"
        stroke="var(--accent-sunset)" strokeWidth="1" opacity="0.4"
      />
    </svg>
  )
}

type GateState = 'idle' | 'checking' | 'error' | 'success'

function DemoGate({ onUnlock }: { onUnlock: () => void }) {
  const [val, setVal] = useState('')
  const [state, setState] = useState<GateState>('idle')
  const [attempts, setAttempts] = useState(0)
  const [hintOpen, setHintOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const submit = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.()
    if (state === 'checking' || state === 'success') return
    setState('checking')
    setTimeout(() => {
      if (val.trim().toLowerCase() === DEMO_PASSWORD.toLowerCase()) {
        setState('success')
        setTimeout(() => onUnlock(), 700)
      } else {
        setState('error')
        setAttempts(a => a + 1)
        setTimeout(() => setState('idle'), 1200)
      }
    }, 600)
  }

  const borderColor =
    state === 'error' ? 'rgba(255,90,77,0.5)'
    : state === 'success' ? 'rgba(95,200,143,0.5)'
    : 'var(--hairline)'

  const iconColor =
    state === 'success' ? 'var(--status-ok)'
    : state === 'error' ? 'var(--status-drift)'
    : 'var(--ink)'

  const eyebrowText =
    state === 'checking' ? 'VERIFYING…'
    : state === 'success' ? 'GRANTED'
    : state === 'error' ? 'DENIED'
    : 'ACCESS REQUIRED'

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }}>
        <DemoGateBg />
      </div>

      <div className="atlas-card" style={{
        width: '100%', maxWidth: 480, padding: 40,
        position: 'relative', zIndex: 1,
        border: '1px solid ' + borderColor,
        transition: 'border-color .3s ease',
        animation: state === 'error' ? 'shake 0.4s ease-in-out' : undefined,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8,
            border: '1px solid var(--hairline)',
            background: 'var(--canvas)',
            display: 'grid', placeItems: 'center',
            color: iconColor, transition: 'color .3s ease',
          }}>
            {state === 'success' ? <CheckIcon size={20} /> : <LockIcon size={20} />}
          </div>
          <div>
            <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>{eyebrowText}</span>
            <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--body-mid)' }}>
              ATLAS LIVE DEMO · /demo
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.6px' }}>
          Enter the demo password.
        </h2>
        <p style={{ marginTop: 14, color: 'var(--body)', fontSize: 14, lineHeight: '22px' }}>
          The live sandbox runs against a redacted production replica. Credentials were shared with you in your invite — or use the public demo password below.
        </p>

        <form onSubmit={submit} style={{ marginTop: 28 }}>
          <label className="field-label">PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              className="atlas-input"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder="••••••••••"
              disabled={state === 'checking' || state === 'success'}
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}
            />
            {state === 'checking' && (
              <span style={{
                position: 'absolute', right: 14, top: '50%',
                width: 14, height: 14, borderRadius: '50%',
                border: '1.5px solid var(--hairline)',
                borderTopColor: 'var(--ink)',
                animation: 'spin 0.7s linear infinite',
              }} />
            )}
          </div>

          <div style={{ marginTop: 12, minHeight: 18 }}>
            {state === 'error' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--status-drift)' }}>
                ✕ INCORRECT · {attempts === 1 ? '1 ATTEMPT' : `${attempts} ATTEMPTS`}
              </span>
            )}
            {state === 'success' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--status-ok)' }}>
                ✓ ACCESS GRANTED · LOADING DEMO…
              </span>
            )}
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="submit"
              className="atlas-btn atlas-btn--primary"
              disabled={state === 'checking' || state === 'success' || !val}
              style={(state === 'checking' || state === 'success' || !val) ? { opacity: 0.4, cursor: 'not-allowed', gap: 8 } : { gap: 8 }}
            >
              Unlock demo <ArrowIcon size={13} />
            </button>
            <Link href="/" className="atlas-btn">
              ← Back
            </Link>
          </div>
        </form>

        {/* Hint */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--hairline)' }}>
          <button
            onClick={() => setHintOpen(o => !o)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--body-mid)', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px',
              display: 'flex', alignItems: 'center', gap: 6, padding: 0,
            }}
          >
            <KeyIcon size={12} />
            {hintOpen ? 'HIDE PUBLIC DEMO PASSWORD' : 'SHOW PUBLIC DEMO PASSWORD'}
          </button>
          {hintOpen && (
            <div className="page-enter" style={{
              marginTop: 12, padding: 12,
              background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', borderRadius: 6,
              fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{DEMO_PASSWORD}</span>
              <button
                onClick={() => { setVal(DEMO_PASSWORD); inputRef.current?.focus() }}
                className="atlas-btn atlas-btn--sm"
                style={{ fontSize: 10 }}
              >
                Use
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DemoSurface({ onLock }: { onLock: () => void }) {
  return (
    <div className="page-enter">
      {/* Hero */}
      <section style={{ padding: '96px 0 56px', position: 'relative' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="rise" style={{ marginBottom: 24 }}>
            <span className="atlas-eyebrow" style={{ color: 'var(--body-mid)' }}>LIVE DEMO · SANDBOX TENANT NORTHWIND-DEMO</span>
          </div>
          <h1 className="rise" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 7vw, 84px)',
            fontWeight: 400, lineHeight: 1, letterSpacing: '-2px', maxWidth: 900, margin: 0,
            animationDelay: '0.05s',
          }}>
            Atlas, live.
          </h1>
          <p className="rise" style={{
            marginTop: 28, maxWidth: 640, color: 'var(--body)', fontSize: 18, lineHeight: '28px', animationDelay: '0.1s',
          }}>
            You&apos;re now inside a redacted production replica. All data is synthetic; all controls are interactive. Adjust the simulator on the left and watch Atlas react in real time.
          </p>
          <div className="rise" style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', animationDelay: '0.15s' }}>
            <Link href="/waitlist" className="atlas-btn atlas-btn--primary" style={{ gap: 8 }}>
              Request production access <ArrowIcon size={13} />
            </Link>
            <button className="atlas-btn" onClick={onLock} style={{ gap: 8 }}>
              <LockIcon size={12} /> Lock demo
            </button>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', color: 'var(--status-ok)' }}>
              <span className="atlas-dot pulse-ring" />
              SESSION ACTIVE
            </span>
          </div>
        </div>
      </section>

      {/* Dashboard mockup */}
      <section style={{ padding: '0 0 32px' }}>
        <div className="container">
          <DashMockup />
        </div>
      </section>

      <TickerBar />
      <WhatInteractiveDemo />
      <WhatCodeBlock />

      {/* CTA */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--hairline)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400, lineHeight: 1.04, letterSpacing: '-1.2px', maxWidth: 640, margin: '0 auto' }}>
            Ready to connect your own data?
          </h2>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/waitlist" className="atlas-btn atlas-btn--primary" style={{ gap: 8 }}>
              Join the waitlist <ArrowIcon size={13} />
            </Link>
            <Link href="/security" className="atlas-btn">
              Read security posture
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function DemoAccessPage() {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false
    try { return sessionStorage.getItem('atlas-demo-unlocked') === '1' } catch { return false }
  })

  const handleUnlock = () => {
    try { sessionStorage.setItem('atlas-demo-unlocked', '1') } catch { /* noop */ }
    setUnlocked(true)
  }

  const handleLock = () => {
    try { sessionStorage.removeItem('atlas-demo-unlocked') } catch { /* noop */ }
    setUnlocked(false)
  }

  return (
    <>
      <div className="bg-grid" />
      <PageCurtain />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--canvas)', minHeight: '100vh' }}>
        <AtlasNav />
        {unlocked
          ? <DemoSurface onLock={handleLock} />
          : <DemoGate onUnlock={handleUnlock} />
        }
        <AtlasFooter />
      </div>
    </>
  )
}

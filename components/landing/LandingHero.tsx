'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'

const SOURCES = [
  { id: 'stripe', label: 'Stripe', val: '+$1,842,000', color: '#6366F1', icon: '⬡' },
  { id: 'bank', label: 'Bank Stmt', val: '+$620,000', color: '#10B981', icon: '⬡' },
  { id: 'erp', label: 'ERP Report', val: '+$284,000', color: '#F59E0B', icon: '⬡' },
  { id: 'adyen', label: 'Adyen', val: '+$995,000', color: '#EC4899', icon: '⬡' },
]

function DiagramNode({ source, index, total }: { source: typeof SOURCES[0], index: number, total: number }) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const r = 155
  const x = 200 + r * Math.cos(angle)
  const y = 200 + r * Math.sin(angle)

  return (
    <g>
      <line
        x1={x} y1={y} x2={200} y2={200}
        stroke={source.color} strokeWidth="1" strokeOpacity="0.25"
        strokeDasharray="4 4"
        className={`diagram-line diagram-line-${index}`}
      />
      <circle cx={x} cy={y} r="34" fill={source.color} fillOpacity="0.08" stroke={source.color} strokeWidth="1" strokeOpacity="0.4" className={`diagram-node diagram-node-${index}`} />
      <text x={x} y={y - 6} textAnchor="middle" fill={source.color} fontSize="10" fontWeight="600" fontFamily="inherit" className={`diagram-node diagram-node-${index}`}>{source.label}</text>
      <text x={x} y={y + 8} textAnchor="middle" fill={source.color} fontSize="9" fontFamily="ui-monospace,monospace" fillOpacity="0.8" className={`diagram-node diagram-node-${index}`}>{source.val}</text>
    </g>
  )
}

function AnimatedDiagram() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.diagram-node', {
        opacity: 0, scale: 0.6, transformOrigin: 'center',
        stagger: 0.15, duration: 0.8, ease: 'back.out(1.6)',
        delay: 1.2,
      })
      gsap.from('.diagram-line', {
        strokeDashoffset: 100, opacity: 0,
        stagger: 0.15, duration: 1, ease: 'power2.out',
        delay: 1.5,
      })
      gsap.from('.diagram-center', {
        opacity: 0, scale: 0.7, transformOrigin: 'center',
        duration: 1, ease: 'expo.out', delay: 2,
      })
      gsap.to('.diagram-center-glow', {
        r: 52, opacity: 0.15,
        repeat: -1, yoyo: true, duration: 2.5, ease: 'sine.inOut',
      })
    }, svgRef)

    const id = setInterval(() => setTick(t => t + 1), 3200)
    return () => { ctx.revert(); clearInterval(id) }
  }, [])

  return (
    <div style={{ position: 'relative', width: 400, height: 400, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: -80,
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <svg ref={svgRef} width="400" height="400" viewBox="0 0 400 400" style={{ overflow: 'visible' }}>
        {SOURCES.map((s, i) => (
          <DiagramNode key={s.id} source={s} index={i} total={SOURCES.length} />
        ))}
        <circle cx="200" cy="200" r="44" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" className="diagram-center-glow" />
        <circle cx="200" cy="200" r="44" fill="rgba(7,9,14,0.9)" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5" className="diagram-center" />
        <text x="200" y="193" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="600" letterSpacing="0.08em" fontFamily="inherit" className="diagram-center">SAFE TO</text>
        <text x="200" y="205" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="600" letterSpacing="0.08em" fontFamily="inherit" className="diagram-center">DISBURSE</text>
        <text x="200" y="222" textAnchor="middle" fill="#3B82F6" fontSize="13" fontWeight="700" fontFamily="ui-monospace,monospace" className="diagram-center">$3.74M</text>
      </svg>
    </div>
  )
}

const HEADLINE_WORDS = ['Financial', 'certainty', 'before', 'capital', 'moves.']

export default function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const btnsRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<HTMLDivElement>(null)
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = titleRef.current?.querySelectorAll('.hero-word')

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from(badgeRef.current, { y: 16, opacity: 0, duration: 0.7 }, 0.3)
        .from(words ?? [], { y: 80, opacity: 0, rotateX: -20, stagger: 0.08, duration: 0.9, transformOrigin: 'top', }, 0.55)
        .from(descRef.current, { y: 24, opacity: 0, duration: 0.8 }, 1.0)
        .from(btnsRef.current?.children ?? [], { y: 16, opacity: 0, stagger: 0.1, duration: 0.7 }, 1.2)
        .from(diagramRef.current, { x: 60, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.8)

      gsap.to(blob1Ref.current, {
        x: 40, y: -30, scale: 1.1,
        repeat: -1, yoyo: true, duration: 8, ease: 'sine.inOut',
      })
      gsap.to(blob2Ref.current, {
        x: -30, y: 40, scale: 1.08,
        repeat: -1, yoyo: true, duration: 11, ease: 'sine.inOut', delay: 2,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden',
      background: 'var(--lp-bg)',
      paddingTop: 64,
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
      }} />

      {/* Ambient blobs */}
      <div ref={blob1Ref} style={{
        position: 'absolute', top: '8%', right: '12%',
        width: 600, height: 500,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', filter: 'blur(1px)',
      }} />
      <div ref={blob2Ref} style={{
        position: 'absolute', bottom: '5%', left: '5%',
        width: 480, height: 400,
        background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '80px 48px',
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gap: 64,
        alignItems: 'center',
      }}>
        {/* Left */}
        <div>
          {/* Badge */}
          <div ref={badgeRef} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', marginBottom: 36,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 100,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--lp-blue)',
              boxShadow: '0 0 6px var(--lp-blue)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--lp-blue)', fontWeight: 600, letterSpacing: '0.04em' }}>
              Payout Operations Platform
            </span>
          </div>

          {/* Headline */}
          <h1 ref={titleRef} style={{
            fontSize: 'clamp(3rem, 5.5vw, 5.5rem)',
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            color: 'var(--lp-text-1)',
            marginBottom: 28,
            overflow: 'hidden',
          }}>
            {HEADLINE_WORDS.map((word, i) => (
              <span key={i} className="hero-word" style={{
                display: 'inline-block',
                marginRight: i === 1 || i === 3 ? '0.22em' : '0.22em',
                color: i === 1 || i === 2 ? 'var(--lp-text-2)' : 'var(--lp-text-1)',
              }}>
                {word}
              </span>
            ))}
          </h1>

          {/* Description */}
          <p ref={descRef} style={{
            fontSize: '1.1rem', color: 'var(--lp-text-2)', lineHeight: 1.65,
            maxWidth: 500, marginBottom: 44,
          }}>
            Atlas ingests fragmented payout data from Stripe, banks, and ERPs — then computes a single canonical balance so you know <em style={{ color: 'var(--lp-text-1)', fontStyle: 'normal', fontWeight: 500 }}>exactly</em> what&apos;s safe to move before you move it.
          </p>

          {/* Buttons */}
          <div ref={btnsRef} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{
              padding: '13px 28px',
              background: 'var(--lp-blue)',
              color: '#fff',
              borderRadius: 10,
              fontSize: '0.95rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 24px rgba(59,130,246,0.3)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,130,246,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(59,130,246,0.3)' }}
            >
              View Live Demo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <a href="#how-it-works" style={{
              padding: '13px 28px',
              background: 'transparent',
              color: 'var(--lp-text-1)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              fontSize: '0.95rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'background 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              How it works
            </a>
          </div>

          {/* Trust line */}
          <div style={{ marginTop: 52, display: 'flex', alignItems: 'center', gap: 24 }}>
            {[
              { val: '$2.4B+', label: 'Volume tracked' },
              { val: '<1s', label: 'Drift detection' },
              { val: '99.99%', label: 'Uptime' },
            ].map(m => (
              <div key={m.label} style={{ paddingRight: 24, borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--lp-text-1)', fontFamily: 'ui-monospace,monospace', letterSpacing: '-0.02em' }}>{m.val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--lp-text-3)', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
            <div style={{ fontSize: '0.75rem', color: 'var(--lp-text-3)' }}>Used by fintech ops teams</div>
          </div>
        </div>

        {/* Right — diagram */}
        <div ref={diagramRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <AnimatedDiagram />
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        opacity: 0.4,
      }}>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" style={{ animation: 'scroll-bounce 2s ease-in-out infinite' }}>
          <rect x="5" y="1" width="6" height="14" rx="3" stroke="var(--lp-text-2)" strokeWidth="1.5" />
          <circle cx="8" cy="5" r="1.5" fill="var(--lp-text-2)" style={{ animation: 'scroll-dot 2s ease-in-out infinite' }} />
        </svg>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        @keyframes scroll-dot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
      `}</style>
    </section>
  )
}

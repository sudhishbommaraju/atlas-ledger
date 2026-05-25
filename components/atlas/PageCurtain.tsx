'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'

const ROUTE_LABELS: Record<string, string> = {
  '/': '/home',
  '/security': '/security',
  '/faq': '/faq',
  '/waitlist': '/waitlist',
  '/demo-access': '/demo',
}

export default function PageCurtain() {
  const curtainRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const pathname = usePathname()
  const prevPath = useRef<string | null>(null)

  useEffect(() => {
    if (prevPath.current === null) {
      prevPath.current = pathname
      return
    }
    if (prevPath.current === pathname) return
    prevPath.current = pathname

    const label = ROUTE_LABELS[pathname] ?? pathname
    if (labelRef.current) labelRef.current.textContent = '→ ' + label

    const curtain = curtainRef.current
    if (!curtain) return

    const tl = gsap.timeline()
    tl.set(curtain, { display: 'flex', x: '-100%' })
      .to(curtain, { x: '0%', duration: 0.42, ease: 'power3.inOut' })
      .to(curtain, { x: '105%', duration: 0.44, ease: 'power3.inOut', delay: 0.12 })
      .set(curtain, { display: 'none' })
  }, [pathname])

  return (
    <div
      ref={curtainRef}
      style={{
        display: 'none',
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'linear-gradient(90deg, transparent 0%, var(--canvas) 8%, var(--canvas) 92%, transparent 100%)',
        borderLeft: '1px solid rgba(255,122,23,0.4)',
        borderRight: '1px solid rgba(255,122,23,0.4)',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 48, width: '100%', padding: '0 64px' }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.7 }} />
        <span
          ref={labelRef}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 22,
            letterSpacing: '1.4px', textTransform: 'uppercase',
            color: 'var(--ink)', whiteSpace: 'nowrap',
          }}
        >
          → /home
        </span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.7 }} />
      </div>
    </div>
  )
}

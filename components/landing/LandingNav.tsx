'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Developers', href: '#developers' },
  { label: 'Pricing', href: '#pricing' },
]

export default function LandingNav() {
  const navRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.1 })
    tl.from(logoRef.current, { y: -24, opacity: 0, duration: 0.7, ease: 'expo.out' })
      .from(linksRef.current?.children ?? [], { y: -16, opacity: 0, stagger: 0.06, duration: 0.6, ease: 'expo.out' }, '-=0.5')
      .from(ctaRef.current, { y: -16, opacity: 0, duration: 0.6, ease: 'expo.out' }, '-=0.4')

    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 64,
        display: 'flex', alignItems: 'center',
        padding: '0 max(32px, calc((100vw - 1280px)/2 + 32px))',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(7,9,14,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
      }}
    >
      <div ref={logoRef}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#3B82F6" fillOpacity="0.15" />
            <path d="M7 21L14 7L21 21" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 16.5H18.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--lp-text-1)', letterSpacing: '-0.02em' }}>
            Atlas
          </span>
        </Link>
      </div>

      <div ref={linksRef} style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden md:flex">
        {NAV_LINKS.map(({ label, href }) => (
          <a key={label} href={href} style={{
            fontSize: '0.875rem', color: 'var(--lp-text-2)', fontWeight: 500,
            textDecoration: 'none', transition: 'color 0.2s',
            letterSpacing: '-0.01em',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-text-2)')}
          >
            {label}
          </a>
        ))}
      </div>

      <div ref={ctaRef} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/dashboard" style={{
          fontSize: '0.875rem', color: 'var(--lp-text-2)', fontWeight: 500,
          textDecoration: 'none', padding: '6px 14px',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-text-1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-text-2)')}
        >
          Sign in
        </Link>
        <Link href="/dashboard" style={{
          padding: '8px 20px',
          background: 'var(--lp-blue)',
          color: '#fff',
          borderRadius: 8,
          fontSize: '0.875rem',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'opacity 0.2s, transform 0.2s',
          display: 'inline-block',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          View Demo
        </Link>
      </div>
    </nav>
  )
}

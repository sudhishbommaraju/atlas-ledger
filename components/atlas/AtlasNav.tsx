'use client'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/app/providers'
import { tokens, type Theme } from '@/lib/design-tokens'

const AtlasMark = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Atlas">
    <path d="M12 2L1 22h22L12 2z" fill="white" />
    <rect x="7.5" y="14.5" width="9" height="2.5" fill="#0a0a0a" />
  </svg>
)

const NAV_LINKS = [
  { label: 'What We Do', href: '/' },
  { label: 'Security', href: '/security' },
  { label: 'FAQ', href: '/faq' },
]

export default function AtlasNav() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const c = tokens.colors[theme as Theme]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -48, opacity: 0, duration: 0.9, ease: 'expo.out', delay: 0.1,
      })
    })
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { ctx.revert(); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <nav ref={navRef} style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: `1px solid ${scrolled ? 'var(--hairline)' : 'transparent'}`,
      background: scrolled ? 'rgba(10,10,10,0.78)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
      transition: 'background .25s, border-color .25s, backdrop-filter .25s',
      fontFamily: 'var(--font-display)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)' }}>
          <AtlasMark />
          <span style={{ fontSize: 15, letterSpacing: '-0.3px', color: 'var(--ink)' }}>Atlas</span>
          <span style={{
            padding: '1px 7px', borderRadius: 9999,
            border: '1px solid rgba(255,122,23,0.4)',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '1.2px', textTransform: 'uppercase',
            color: 'var(--accent)',
          }}>V3</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '1.2px', color: 'var(--body-mid)',
            borderLeft: '1px solid var(--hairline)', paddingLeft: 10,
          }}>LEDGER</span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link key={label} href={href} style={{
                fontFamily: 'var(--font-display)', fontSize: 14,
                color: active ? 'var(--ink)' : 'var(--body-mid)',
                textDecoration: 'none',
                borderBottom: active ? '1px solid var(--ink)' : '1px solid transparent',
                paddingBottom: 2,
                transition: 'color .15s, border-color .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--body-mid)' }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right group: theme toggle + CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid var(--hairline-t)',
              borderRadius: '9999px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '15px',
              lineHeight: 1,
              color: 'var(--ink)',
            }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Waitlist — outlined */}
          <Link
            href="/waitlist"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '7px 18px',
              background: 'transparent',
              border: `1px solid ${c.primary}`,
              color: c.primary,
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              whiteSpace: 'nowrap',
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = c.primary
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = c.primary
            }}
          >
            Waitlist
          </Link>

          {/* View Live Demo — solid */}
          <Link
            href="/auth/password"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '7px 18px',
              background: c.primary,
              color: '#fff',
              border: `1px solid ${c.primary}`,
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              whiteSpace: 'nowrap',
              transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = c.primaryHover }}
            onMouseLeave={e => { e.currentTarget.style.background = c.primary }}
          >
            View Live Demo
          </Link>
        </div>
      </div>
    </nav>
  )
}

"use client";
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="0"    y="0"    width="8.5" height="8.5" fill="#C6A66B" />
    <rect x="11.5" y="0"    width="8.5" height="8.5" fill="#EDE8DF" opacity="0.12" />
    <rect x="0"    y="11.5" width="8.5" height="8.5" fill="#EDE8DF" opacity="0.06" />
    <rect x="11.5" y="11.5" width="8.5" height="8.5" fill="#C6A66B" opacity="0.35" />
  </svg>
)

const NAV_ITEMS = [
  { label: 'Platform',     href: '#' },
  { label: 'Architecture', href: '#' },
  { label: 'Security',     href: '#' },
  { label: 'Developers',   href: 'http://localhost:8000/docs' },
  { label: 'Company',      href: '#' },
]

function NavLink({ href, children }) {
  const ext = href?.startsWith('http')
  return (
    <a
      href={href || '#'}
      target={ext ? '_blank' : undefined}
      rel={ext ? 'noreferrer' : undefined}
      className="relative mono text-stone hover:text-silver transition-colors duration-200 group"
      style={{ fontSize: '0.72rem', letterSpacing: '0.03em' }}
    >
      {children}
      <span className="absolute -bottom-px left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300 ease-out" />
    </a>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        display: 'flex', alignItems: 'center',
        transition: 'all 0.4s ease',
        background: scrolled ? 'rgba(11,13,18,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(30,35,48,0.8)' : '1px solid transparent',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="cursor-default">
          <Logo />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--chalk)', letterSpacing: '-0.01em' }}>
            Atlas Ledger
          </span>
          <span className="badge badge-gold" style={{ fontSize: '0.52rem', padding: '1px 6px', marginLeft: 4 }}>v0</span>
        </div>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map(({ label, href }) => (
            <NavLink key={label} href={href}>{label}</NavLink>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer"
            className="hidden md:block mono text-stone hover:text-silver transition-colors duration-200"
            style={{ fontSize: '0.72rem' }}>
            API Docs
          </a>
          <motion.a href="#" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            className="btn-gold" style={{ fontSize: '0.75rem', padding: '8px 18px' }}>
            Request Access
          </motion.a>
        </div>
      </div>
    </motion.nav>
  )
}

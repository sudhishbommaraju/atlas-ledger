'use client'
import Link from 'next/link'

const LINKS = {
  Product: ['Platform', 'How It Works', 'Pricing', 'Changelog'],
  Developers: ['API Reference', 'Webhooks', 'SDK', 'Status Page'],
  Company: ['About', 'Blog', 'Security', 'Careers'],
  Legal: ['Privacy Policy', 'Terms of Service', 'DPA', 'Cookies'],
}

export default function LandingFooter() {
  return (
    <footer style={{
      background: 'var(--lp-surface)',
      borderTop: '1px solid var(--lp-border)',
      padding: '64px 0 40px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px repeat(4, 1fr)', gap: 48, marginBottom: 64 }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="7" fill="#3B82F6" fillOpacity="0.15" />
                <path d="M7 21L14 7L21 21" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.5 16.5H18.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--lp-text-1)', letterSpacing: '-0.02em' }}>
                Atlas
              </span>
            </Link>
            <p style={{ fontSize: '0.85rem', color: 'var(--lp-text-3)', lineHeight: 1.65, maxWidth: 220 }}>
              Payout operations platform for teams that can&apos;t afford financial ambiguity.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {['tw', 'li', 'gh'].map(s => (
                <a key={s} href="#" style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: '1px solid var(--lp-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--lp-text-3)',
                  fontSize: '0.72rem', fontFamily: 'ui-monospace,monospace',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--lp-text-1)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--lp-border)'; e.currentTarget.style.color = 'var(--lp-text-3)' }}
                >
                  {s.toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--lp-text-1)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
                {heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <a key={item} href="#" style={{
                    fontSize: '0.875rem', color: 'var(--lp-text-3)', textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-text-1)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-text-3)')}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--lp-border)',
          paddingTop: 28,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--lp-text-3)' }}>
            © 2025 Atlas Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lp-green)', boxShadow: '0 0 6px var(--lp-green)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--lp-text-3)' }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'
import Link from 'next/link'

const AtlasMark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L1 22h22L12 2z" fill="white" />
    <rect x="7.5" y="14.5" width="9" height="2.5" fill="#0a0a0a" />
  </svg>
)

const COLS = [
  {
    heading: 'PLATFORM',
    links: [
      { l: 'What We Do', h: '/' },
      { l: 'Security', h: '/security' },
      { l: 'FAQ', h: '/faq' },
      { l: 'Live Demo', h: '/auth/password' },
    ],
  },
  {
    heading: 'COMPANY',
    links: [
      { l: 'About', h: '/' },
      { l: 'Careers', h: '/' },
      { l: 'Press', h: '/' },
      { l: 'Join Waitlist', h: '/waitlist' },
      { l: 'Contact', h: 'mailto:hello@atlas.ai' },
      { l: 'Twitter', h: 'https://twitter.com/getAtlas' },
      { l: 'LinkedIn', h: 'https://linkedin.com/company/atlas-ai' },
    ],
  },
  {
    heading: 'LEGAL',
    links: [
      { l: 'Terms of Service', h: '/legal/terms-of-service' },
      { l: 'Privacy Policy', h: '/legal/privacy-policy' },
      { l: 'DPA', h: '#' },
      { l: 'Sub-processors', h: '#' },
      { l: 'Legal Inquiry', h: 'mailto:legal@atlas.ai' },
      { l: 'Privacy Questions', h: 'mailto:privacy@atlas.ai' },
    ],
  },
]

export default function AtlasFooter() {
  return (
    <footer style={{
      background: 'var(--canvas)',
      borderTop: '1px solid var(--hairline)',
      padding: '64px 0 48px',
      fontFamily: 'var(--font-display)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 32, marginBottom: 56 }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--ink)', marginBottom: 18 }}>
              <AtlasMark />
              <span style={{ fontSize: 18, letterSpacing: '-0.3px' }}>Atlas Ledger</span>
              <span style={{
                padding: '1px 7px', borderRadius: 9999,
                border: '1px solid rgba(255,122,23,0.4)',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '1.2px', textTransform: 'uppercase',
                color: 'var(--accent)',
              }}>V3</span>
            </Link>
            <p style={{ fontSize: 14, color: 'var(--body-mid)', lineHeight: '22px', maxWidth: 320 }}>
              Continuous operational control layer for payout-heavy companies. Detects and remediates payout drift autonomously, before capital moves.
            </p>
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="atlas-dot pulse-ring" />
              <span style={{ fontSize: 12, color: 'var(--body-mid)', fontFamily: 'var(--font-mono)', letterSpacing: '1.1px', textTransform: 'uppercase' }}>
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          {COLS.map(({ heading, links }) => (
            <div key={heading}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--body-mid)', marginBottom: 18 }}>
                {heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(({ l, h }) => (
                  <Link key={l} href={h} style={{ fontSize: 14, color: 'var(--body)', textDecoration: 'none', transition: 'color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--body)')}
                  >{l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--hairline)', margin: '0 0 24px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--body-mid)' }}>
            © {new Date().getFullYear()} ATLAS INC. · MADE WITH ENGINEERED RESTRAINT
          </span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="mailto:security@atlas.ai" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--body-mid)', textDecoration: 'none' }}>Report Security Issue</Link>
            <Link href="mailto:legal@atlas.ai" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--body-mid)', textDecoration: 'none' }}>Legal Contact</Link>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--body-mid)' }}>
              v2.4.1 · BUILD a7f3c
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

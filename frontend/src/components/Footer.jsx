import { motion } from 'framer-motion'

const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="0"    y="0"    width="8.5" height="8.5" fill="#C6A66B" />
    <rect x="11.5" y="0"    width="8.5" height="8.5" fill="#EDE8DF" opacity="0.12" />
    <rect x="0"    y="11.5" width="8.5" height="8.5" fill="#EDE8DF" opacity="0.06" />
    <rect x="11.5" y="11.5" width="8.5" height="8.5" fill="#C6A66B" opacity="0.35" />
  </svg>
)

function FooterLink({ href, children }) {
  return (
    <motion.a
      href={href || '#'}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      whileHover={{ x: 2, color: 'var(--silver)' }}
      style={{
        display: 'block',
        fontSize: '0.73rem',
        color: 'var(--stone)',
        textDecoration: 'none',
        marginBottom: 10,
        transition: 'color 0.15s ease',
        cursor: 'pointer',
      }}
    >{children}</motion.a>
  )
}

const LINKS = [
  { heading: 'Product', links: [
    { l: 'Reconciliation', href: '#' },
    { l: 'Payout Engine',  href: '#' },
    { l: 'Auto Fixes',     href: '#' },
    { l: 'Command Center', href: '#' },
    { l: 'Simulation API', href: '#' },
  ]},
  { heading: 'Developers', links: [
    { l: 'API Reference',  href: 'http://localhost:8000/docs' },
    { l: 'Swagger UI',     href: 'http://localhost:8000/docs' },
    { l: 'OpenAPI JSON',   href: 'http://localhost:8000/openapi.json' },
    { l: 'Webhooks',       href: '#' },
    { l: 'Changelog',      href: '#' },
  ]},
  { heading: 'Company', links: [
    { l: 'Architecture',   href: '#' },
    { l: 'Security',       href: '#' },
    { l: 'Compliance',     href: '#' },
    { l: 'Status',         href: '#' },
    { l: 'Contact',        href: '#' },
  ]},
]

const SERVICES = ['Ingestion API', 'Balance Engine', 'Simulation API', 'Payout Execution', 'Reconciliation']

export default function Footer() {
  return (
    <footer style={{ background: 'var(--raised)', borderTop: '1px solid var(--line)' }}>
      <div className="container" style={{ paddingTop: 72, paddingBottom: 40 }}>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 64, alignItems: 'start', marginBottom: 56 }}>

          {/* Brand */}
          <div style={{ maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Logo />
              <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--chalk)', letterSpacing: '-0.01em' }}>
                Atlas Ledger
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.5rem', padding: '1px 6px' }}>v0</span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--stone)', lineHeight: 1.7, marginBottom: 24 }}>
              The operating system trusted to run billions in payouts.
              Institutional-grade payout decisioning infrastructure for
              finance teams that operate at scale.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.a href="#" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                className="btn-gold" style={{ fontSize: '0.72rem', padding: '9px 18px' }}
              >Request Access</motion.a>
              <motion.a href="http://localhost:8000/docs" target="_blank" rel="noreferrer"
                whileHover={{ y: -1 }}
                className="btn-ghost" style={{ fontSize: '0.72rem', padding: '9px 18px' }}
              >API Reference →</motion.a>
            </div>
          </div>

          {/* Link columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
            {LINKS.map(({ heading, links }) => (
              <div key={heading}>
                <div className="label" style={{ marginBottom: 16 }}>{heading}</div>
                {links.map(({ l, href }) => <FooterLink key={l} href={href}>{l}</FooterLink>)}
              </div>
            ))}
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          gap: '8px 24px',
          padding: '16px 0',
          borderTop: '1px solid var(--line)',
          borderBottom: '1px solid var(--line)',
          marginBottom: 20,
        }}>
          {SERVICES.map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="dot-live" />
              <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--stone)' }}>{s}</span>
              <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--dust)' }}>online</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <a href="http://localhost:8000/health" target="_blank" rel="noreferrer"
              style={{
                fontSize: '0.58rem', color: 'var(--stone)',
                fontFamily: 'JetBrains Mono, Menlo, monospace',
                textDecoration: 'none', transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--silver)'}
              onMouseLeave={e => e.target.style.color = 'var(--stone)'}
            >GET /health →</a>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--dust)' }}>
            © 2024 Atlas Ledger · v0.1.0 · All balances computed in real-time
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Security'].map(l => (
              <a key={l} href="#"
                style={{
                  fontSize: '0.6rem', color: 'var(--dust)',
                  textDecoration: 'none', transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--stone)'}
                onMouseLeave={e => e.target.style.color = 'var(--dust)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useReconStore } from '@/store/recon-store'

const NAV_ITEMS = [
  { href: '/reconciliation', label: 'Reconciliation' },
  { href: '/disbursable-funds', label: 'Disbursable Funds' },
  { href: '/exceptions', label: 'Exceptions' },
  { href: '/reports', label: 'Reports' },
]

export default function Nav() {
  const pathname = usePathname()
  const exceptionCount = useReconStore((s) =>
    s.matchResults.filter((r) => r.status !== 'matched').length
  )

  return (
    <nav
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        width: 200,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Atlas
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
          Ledger
        </div>
      </div>

      <div style={{ marginTop: 16, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 20px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.1s',
              }}
            >
              <span>{item.label}</span>
              {item.href === '/exceptions' && exceptionCount > 0 && (
                <span
                  style={{
                    background: '#7f1d1d',
                    color: '#fca5a5',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 10,
                  }}
                >
                  {exceptionCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>v1.0.0</div>
      </div>
    </nav>
  )
}

"use client";
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ padding: '40px 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, background: 'var(--primary-blue)', borderRadius: 3 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Atlas Ledger
          </span>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Security'].map(item => (
            <Link key={item} href="#" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {item}
            </Link>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} Atlas Inc. All rights reserved.
        </div>
        
      </div>
    </footer>
  )
}

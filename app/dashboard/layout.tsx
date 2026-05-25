'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/app/components/Header';
import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

const NAV = [
  { href: '/dashboard',        label: '📊 Drift Detection', group: 'Observe' },
  { href: '/dashboard/state',  label: '⚖️ Canonical State',  group: 'Observe' },
  { href: '/dashboard/audit',  label: '📋 Audit Log',         group: 'Audit & Setup' },
  { href: '/dashboard/setup',  label: '⚙️ Setup Systems',     group: 'Audit & Setup' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--canvas)',
      color: 'var(--ink)',
      fontFamily: 'var(--font-display)',
    }}>
      <Header />

      {/* Sidebar */}
      <nav style={{
        width: tokens.sizes.sidebarWidth,
        background: 'var(--canvas-soft)',
        borderRight: '1px solid var(--hairline)',
        paddingTop: tokens.sizes.navHeight,
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        overflowY: 'auto',
        zIndex: 50,
      }}>
        <div style={{ padding: '24px 12px 24px' }}>
          {(['Observe', 'Audit & Setup'] as const).map((group) => (
            <div key={group} style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--mute)',
                padding: '0 12px',
                marginBottom: '8px',
              }}>
                {group === 'Observe' ? 'Tier 1 — Observe' : group}
              </div>
              {NAV.filter((l) => l.group === group).map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <a
                    key={href}
                    href={href}
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      padding: '8px 12px',
                      borderRadius: tokens.radii.md,
                      color: active ? 'var(--ink)' : 'var(--body-mid)',
                      fontWeight: active ? 600 : 500,
                      background: active ? 'var(--canvas)' : 'transparent',
                      border: active ? '1px solid var(--hairline)' : '1px solid transparent',
                      textDecoration: 'none',
                      transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--canvas)';
                        e.currentTarget.style.borderColor = 'var(--hairline)';
                        e.currentTarget.style.color = 'var(--ink)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.color = 'var(--body-mid)';
                      }
                    }}
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{
        marginLeft: tokens.sizes.sidebarWidth,
        marginTop: tokens.sizes.navHeight,
        flex: 1,
        background: 'var(--canvas)',
        minHeight: `calc(100vh - ${tokens.sizes.navHeight})`,
      }}>
        {children}
      </main>
    </div>
  );
}

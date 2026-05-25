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
  const c = tokens.colors[theme as Theme];
  const pathname = usePathname();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: c.bg,
      color: c.text,
      fontFamily: tokens.fonts.body,
    }}>
      <Header />

      {/* Sidebar */}
      <nav style={{
        width: tokens.sizes.sidebarWidth,
        background: c.bgAlt,
        borderRight: `1px solid ${c.border}`,
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
                color: c.textTertiary,
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
                      color: active ? c.primary : c.textSecondary,
                      fontWeight: active ? 600 : 500,
                      background: active ? `${c.primary}12` : 'transparent',
                      textDecoration: 'none',
                      transition: 'background 0.15s, color 0.15s',
                      marginBottom: '2px',
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
        background: c.bg,
        minHeight: `calc(100vh - ${tokens.sizes.navHeight})`,
      }}>
        {children}
      </main>
    </div>
  );
}

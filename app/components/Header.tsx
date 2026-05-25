'use client';

import Link from 'next/link';
import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const c = tokens.colors[theme as Theme];

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `0 ${tokens.spacing.xl}`,
      height: tokens.sizes.navHeight,
      background: c.bg,
      borderBottom: `1px solid ${c.border}`,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      fontFamily: tokens.fonts.body,
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
      }}>
        <span style={{ fontSize: '22px' }}>🔷</span>
        <span style={{ fontSize: '17px', fontWeight: 700, color: c.text }}>Atlas</span>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          background: c.bgAlt,
          border: `1px solid ${c.border}`,
          color: c.textSecondary,
          padding: '2px 7px',
          borderRadius: tokens.radii.sm,
          letterSpacing: '0.04em',
        }}>
          DEMO
        </span>
      </Link>

      {/* Right controls */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link href="/dashboard/setup" style={{
          fontSize: '13px',
          color: c.textSecondary,
          textDecoration: 'none',
          fontWeight: 500,
        }}>
          Setup
        </Link>
        <Link href="/" style={{
          fontSize: '13px',
          color: c.textSecondary,
          textDecoration: 'none',
          fontWeight: 500,
        }}>
          Home
        </Link>
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{
            background: c.bgAlt,
            border: `1px solid ${c.border}`,
            borderRadius: tokens.radii.sm,
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '15px',
            lineHeight: 1,
            color: c.text,
            transition: 'background 0.15s',
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}

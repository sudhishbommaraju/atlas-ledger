'use client';

import Link from 'next/link';
import { useTheme } from '@/app/providers';
import { tokens } from '@/lib/design-tokens';

const AtlasMark = ({ width = 24, height = 24 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-label="Atlas">
    <path d="M12 2L1 22h22L12 2z" fill="var(--ink)" />
    <rect x="7.5" y="14.5" width="9" height="2.5" fill="var(--canvas)" />
  </svg>
);

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `0 ${tokens.spacing.xl}`,
      height: tokens.sizes.navHeight,
      background: 'var(--canvas)',
      borderBottom: '1px solid var(--hairline)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      fontFamily: 'var(--font-display)',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
      }}>
        <AtlasMark width={24} height={24} />
        <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)' }}>Atlas</span>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          background: 'var(--canvas-soft)',
          border: '1px solid var(--hairline)',
          color: 'var(--mute)',
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
          color: 'var(--body-mid)',
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'color 0.15s',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--body-mid)')}
        >
          Setup
        </Link>
        <Link href="/" style={{
          fontSize: '13px',
          color: 'var(--body-mid)',
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'color 0.15s',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--body-mid)')}
        >
          Home
        </Link>
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{
            background: 'var(--canvas-soft)',
            border: '1px solid var(--hairline)',
            borderRadius: tokens.radii.sm,
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '15px',
            lineHeight: 1,
            color: 'var(--ink)',
            transition: 'background 0.15s',
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}


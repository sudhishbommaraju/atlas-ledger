'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { theme } = useTheme();
  const c = tokens.colors[theme as Theme];

  const expected = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Atlas2016!';

  useEffect(() => {
    const auth = localStorage.getItem('atlas_demo_auth');
    if (auth && auth.trim().toLowerCase() === expected.toLowerCase()) {
      router.replace('/dashboard/onboarding');
    }
  }, [expected, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim().toLowerCase() === expected.toLowerCase()) {
      localStorage.setItem('atlas_demo_auth', password);
      router.push('/dashboard/onboarding');
    } else {
      setError('Incorrect password — please try again.');
    }
  }

  return (
    <div style={{
      background: c.bg,
      color: c.text,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: tokens.fonts.body,
    }}>
      <div style={{
        background: c.cardBg,
        border: `1px solid ${c.cardBorder}`,
        borderRadius: tokens.radii.xl,
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔷</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: c.text, margin: '0 0 8px 0', letterSpacing: '-0.4px' }}>
            Atlas Demo
          </h1>
          <p style={{ fontSize: '14px', color: c.textSecondary, margin: 0, lineHeight: '1.5' }}>
            Enter the password to access the live payout integrity demo
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: c.textSecondary,
            marginBottom: '8px',
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••"
            autoFocus
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              background: c.bgAlt,
              border: `1px solid ${error ? c.danger : c.border}`,
              borderRadius: tokens.radii.md,
              color: c.text,
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none',
              marginBottom: error ? '8px' : '20px',
              transition: 'border-color 0.15s',
              fontFamily: tokens.fonts.body,
            }}
            onFocus={(e) => (e.target.style.borderColor = c.primary)}
            onBlur={(e) => (e.target.style.borderColor = error ? c.danger : c.border)}
          />
          {error && (
            <div style={{ color: c.danger, fontSize: '12px', marginBottom: '16px', fontWeight: 500 }}>
              ✕ {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              background: c.primary,
              color: '#fff',
              border: 'none',
              borderRadius: tokens.radii.md,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: tokens.fonts.body,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Access Demo
          </button>
        </form>

        <p style={{ fontSize: '12px', color: c.textTertiary, textAlign: 'center', marginTop: '24px', marginBottom: 0 }}>
          Meridian Marketplace · Demo Environment
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const c = tokens.colors[theme as Theme];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) { setError('Enter the demo password'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/dashboard/onboarding');
      } else {
        setError(data.error || 'Incorrect password');
      }
    } catch {
      setError('Connection error — please try again');
    }

    setLoading(false);
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
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔷</div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: c.text,
            margin: '0 0 10px 0',
            letterSpacing: '-0.4px',
          }}>
            Atlas Demo
          </h1>
          <p style={{ fontSize: '14px', color: c.textSecondary, margin: 0, lineHeight: '1.5' }}>
            This demo shows Atlas detecting and fixing payout drift in real time.
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
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
            placeholder="••••••••"
            autoFocus
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
            <div style={{ color: c.danger, fontSize: '12px', fontWeight: 500, marginBottom: '16px' }}>
              ✕ {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: c.primary,
              color: '#fff',
              border: 'none',
              borderRadius: tokens.radii.md,
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.75 : 1,
              transition: 'opacity 0.15s',
              fontFamily: tokens.fonts.body,
            }}
          >
            {loading ? 'Verifying…' : 'Access Demo'}
          </button>
        </form>

        {/* Hint */}
        <p style={{
          fontSize: '12px',
          color: c.textTertiary,
          textAlign: 'center',
          marginTop: '24px',
          marginBottom: 0,
        }}>
          Password:{' '}
          <code style={{
            background: c.bgAlt,
            border: `1px solid ${c.border}`,
            padding: '2px 7px',
            borderRadius: '4px',
            fontFamily: tokens.fonts.mono,
            fontSize: '12px',
            color: c.text,
          }}>
            Atlas2016!
          </code>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      background: 'var(--canvas)',
      color: 'var(--ink)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-display)',
    }}>
      <div style={{
        background: 'var(--canvas-card)',
        border: '1px solid var(--hairline)',
        borderRadius: '8px',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-label="Atlas">
               <path d="M12 2L1 22h22L12 2z" fill="white" />
               <rect x="7.5" y="14.5" width="9" height="2.5" fill="#0a0a0a" />
             </svg>
          </div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--ink)',
            margin: '0 0 10px 0',
            letterSpacing: '-0.4px',
          }}>
            Atlas Demo
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--body-mid)', margin: 0, lineHeight: '1.5' }}>
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
            color: 'var(--mute)',
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
              background: 'var(--canvas-soft)',
              border: `1px solid ${error ? 'var(--drift)' : 'var(--hairline)'}`,
              borderRadius: '6px',
              color: 'var(--ink)',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none',
              marginBottom: error ? '8px' : '24px',
              transition: 'border-color 0.15s',
              fontFamily: 'var(--font-display)',
            }}
            onFocus={(e) => (e.target.style.borderColor = error ? 'var(--drift)' : 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = error ? 'var(--drift)' : 'var(--hairline)')}
          />
          {error && (
            <div style={{ color: 'var(--drift)', fontSize: '12px', fontWeight: 500, marginBottom: '16px' }}>
              ✕ {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: 'var(--ink)',
              color: 'var(--canvas)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.75 : 1,
              transition: 'opacity 0.15s',
              fontFamily: 'var(--font-display)',
            }}
          >
            {loading ? 'Verifying…' : 'Access Demo'}
          </button>
        </form>
      </div>
    </div>
  );
}

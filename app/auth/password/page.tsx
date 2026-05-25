'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Add a slight delay for a smoother transition
    setTimeout(() => {
      router.push('/dashboard/onboarding');
    }, 400);
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔷</div>
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
            {loading ? 'Entering Demo…' : 'Access Demo'}
          </button>
        </form>
      </div>
    </div>
  );
}

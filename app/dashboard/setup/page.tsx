'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/providers';

const SYSTEMS = [
  { icon: '💳', name: 'Stripe',         detail: 'sk_test_****',              sub: 'Test mode · Settlement & payout data' },
  { icon: '🏦', name: 'Bank (Plaid)',   detail: 'Chase (ending in 4242)',    sub: 'Confirmed balances via Plaid' },
  { icon: '📊', name: 'ERP (NetSuite)', detail: 'NetSuite',                  sub: 'Reserve amounts & payout eligibility' },
];

export default function SetupPage() {
  const { theme } = useTheme();
  const router = useRouter();

  function handleDisconnect() {
    localStorage.removeItem('atlas_demo_auth');
    sessionStorage.removeItem('stripe_connected');
    router.push('/dashboard/onboarding');
  }

  return (
    <div style={{ padding: '24px', maxWidth: '740px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>

      {/* Page header */}
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)', letterSpacing: '-0.4px' }}>
        Setup Systems
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--body-mid)', margin: '0 0 32px 0' }}>
        Meridian Marketplace · System integration status
      </p>

      {/* Connected banner */}
      <div style={{
        background: 'rgba(95, 200, 143, 0.1)',
        border: '1px solid rgba(95, 200, 143, 0.35)',
        borderRadius: '8px',
        padding: '18px 22px',
        display: 'flex',
        gap: '14px',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <span style={{ fontSize: '26px' }}>✅</span>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ok)' }}>
            Your Systems Are Connected
          </div>
          <div style={{ fontSize: '13px', color: 'var(--body-mid)', marginTop: '3px' }}>
            Atlas is monitoring your operations in real time
          </div>
        </div>
      </div>

      {/* System cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {SYSTEMS.map((s) => (
          <div key={s.name} style={{
            background: 'var(--canvas-card)',
            border: '1px solid var(--hairline)',
            borderLeft: '4px solid var(--ok)',
            borderRadius: '8px',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '3px' }}>{s.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--body-mid)' }}>{s.sub}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--ink)',
                fontWeight: 600,
                marginBottom: '4px',
              }}>
                {s.detail}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', color: 'var(--ok)', fontWeight: 600 }}>Live</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live monitoring pulse */}
      <div style={{
        background: 'var(--canvas-soft)',
        border: '1px solid var(--hairline)',
        borderRadius: '8px',
        padding: '18px 22px',
        display: 'flex',
        gap: '14px',
        alignItems: 'center',
        marginBottom: '28px',
      }}>
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'var(--ok)',
          flexShrink: 0,
          boxShadow: '0 0 0 4px rgba(95, 200, 143, 0.25)',
          display: 'inline-block',
        }} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
            Atlas is monitoring your operations in real time
          </div>
          <div style={{ fontSize: '12px', color: 'var(--body-mid)', marginTop: '3px' }}>
            Drift detection active · Sub-second latency · 3 systems connected
          </div>
        </div>
      </div>

      {/* Disconnect */}
      <button
        onClick={handleDisconnect}
        style={{
          background: 'transparent',
          color: 'var(--drift)',
          border: '1px solid var(--drift)',
          padding: '10px 24px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 90, 77, 0.12)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        Disconnect All Systems
      </button>
    </div>
  );
}

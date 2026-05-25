'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

const SYSTEMS = [
  { icon: '💳', name: 'Stripe',         detail: 'sk_test_****',              sub: 'Test mode · Settlement & payout data' },
  { icon: '🏦', name: 'Bank (Plaid)',   detail: 'Chase (ending in 4242)',    sub: 'Confirmed balances via Plaid' },
  { icon: '📊', name: 'ERP (NetSuite)', detail: 'NetSuite',                  sub: 'Reserve amounts & payout eligibility' },
];

export default function SetupPage() {
  const { theme } = useTheme();
  const c = tokens.colors[theme as Theme];
  const router = useRouter();

  function handleDisconnect() {
    localStorage.removeItem('atlas_demo_auth');
    sessionStorage.removeItem('stripe_connected');
    router.push('/dashboard/onboarding');
  }

  return (
    <div style={{ padding: tokens.spacing.xl, maxWidth: '740px', fontFamily: tokens.fonts.body }}>

      {/* Page header */}
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', color: c.text, letterSpacing: '-0.4px' }}>
        Setup Systems
      </h1>
      <p style={{ fontSize: '13px', color: c.textSecondary, margin: '0 0 32px 0' }}>
        Meridian Marketplace · System integration status
      </p>

      {/* Connected banner */}
      <div style={{
        background: theme === 'light' ? '#F0FDF4' : '#071A0F',
        border: `2px solid ${c.success}`,
        borderRadius: tokens.radii.xl,
        padding: '18px 22px',
        display: 'flex',
        gap: '14px',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <span style={{ fontSize: '26px' }}>✅</span>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: c.success }}>
            Your Systems Are Connected
          </div>
          <div style={{ fontSize: '13px', color: c.textSecondary, marginTop: '3px' }}>
            Atlas is monitoring your operations in real time
          </div>
        </div>
      </div>

      {/* System cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {SYSTEMS.map((s) => (
          <div key={s.name} style={{
            background: c.cardBg,
            border: `1px solid ${c.cardBorder}`,
            borderLeft: `4px solid ${c.success}`,
            borderRadius: tokens.radii.lg,
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ fontSize: '28px', flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '3px' }}>{s.name}</div>
              <div style={{ fontSize: '12px', color: c.textSecondary }}>{s.sub}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '13px',
                fontFamily: tokens.fonts.mono,
                color: c.text,
                fontWeight: 600,
                marginBottom: '4px',
              }}>
                {s.detail}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.success, display: 'inline-block' }} />
                <span style={{ fontSize: '12px', color: c.success, fontWeight: 600 }}>Live</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live monitoring pulse */}
      <div style={{
        background: c.bgAlt,
        border: `1px solid ${c.border}`,
        borderRadius: tokens.radii.lg,
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
          background: c.success,
          flexShrink: 0,
          boxShadow: `0 0 0 4px ${c.success}28`,
          display: 'inline-block',
        }} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: c.text }}>
            Atlas is monitoring your operations in real time
          </div>
          <div style={{ fontSize: '12px', color: c.textSecondary, marginTop: '3px' }}>
            Drift detection active · Sub-second latency · 3 systems connected
          </div>
        </div>
      </div>

      {/* Disconnect */}
      <button
        onClick={handleDisconnect}
        style={{
          background: 'transparent',
          color: c.danger,
          border: `1px solid ${c.danger}`,
          padding: '10px 24px',
          borderRadius: tokens.radii.md,
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: tokens.fonts.body,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = `${c.danger}12`)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        Disconnect All Systems
      </button>
    </div>
  );
}

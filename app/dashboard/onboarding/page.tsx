'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

type SystemState = 'idle' | 'loading' | 'connected' | 'error';

export default function OnboardingPage() {
  const { theme } = useTheme();
  const c = tokens.colors[theme as Theme];
  const router = useRouter();

  const [stripeKey, setStripeKey] = useState('');
  const [stripeState, setStripeState] = useState<SystemState>('idle');
  const [stripeError, setStripeError] = useState('');

  const [bankState, setBankState] = useState<SystemState>('idle');
  const [erpState, setErpState] = useState<SystemState>('idle');

  const connectedCount = [stripeState, bankState, erpState].filter(
    (s) => s === 'connected'
  ).length;

  const canProceed = connectedCount >= 1;

  async function testStripe() {
    if (!stripeKey.trim()) {
      setStripeError('Please enter a Stripe API key');
      return;
    }
    setStripeState('loading');
    setStripeError('');
    try {
      const res = await fetch('/api/auth/stripe-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: stripeKey }),
      });
      const data = await res.json();
      if (data.success) {
        setStripeState('connected');
        sessionStorage.setItem('stripe_connected', 'true');
      } else {
        setStripeState('error');
        setStripeError(data.error || 'Invalid Stripe key');
      }
    } catch {
      setStripeState('error');
      setStripeError('Connection failed — check your key and try again');
    }
  }

  function simulateConnect(setState: (s: SystemState) => void) {
    setState('loading');
    setTimeout(() => setState('connected'), 1100);
  }

  // ── Reusable connected badge ──────────────────────────────────────
  function Connected() {
    return (
      <div style={{
        padding: '12px 16px',
        background: `${c.success}18`,
        border: `1px solid ${c.success}50`,
        borderRadius: tokens.radii.md,
        color: c.success,
        fontSize: '14px',
        fontWeight: 600,
        textAlign: 'center',
      }}>
        ✓ Connected
      </div>
    );
  }

  // ── Reusable card ────────────────────────────────────────────────
  function Card({
    icon, title, desc, children, connected,
  }: {
    icon: string;
    title: string;
    desc: string;
    children: React.ReactNode;
    connected: boolean;
  }) {
    return (
      <div style={{
        background: c.cardBg,
        border: `2px solid ${connected ? c.success : c.cardBorder}`,
        borderRadius: tokens.radii.xl,
        padding: tokens.spacing.xl,
        transition: 'border-color 0.25s, box-shadow 0.25s',
        boxShadow: connected
          ? `0 0 0 4px ${c.success}12`
          : '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: c.text,
          margin: '0 0 8px 0',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '13px',
          color: c.textSecondary,
          lineHeight: '1.6',
          margin: `0 0 ${tokens.spacing.lg} 0`,
        }}>
          {desc}
        </p>
        {children}
      </div>
    );
  }

  const btnBase: React.CSSProperties = {
    width: '100%',
    padding: '11px 16px',
    border: 'none',
    borderRadius: tokens.radii.md,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    fontFamily: tokens.fonts.body,
  };

  return (
    <div style={{
      background: c.bg,
      color: c.text,
      minHeight: '100vh',
      padding: '56px 24px 80px',
      fontFamily: tokens.fonts.body,
    }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔷</div>
        <h1 style={{
          fontSize: '40px',
          fontWeight: 800,
          color: c.text,
          margin: '0 0 16px 0',
          letterSpacing: '-0.8px',
          lineHeight: 1.1,
        }}>
          Welcome to Atlas
        </h1>
        <p style={{
          fontSize: '16px',
          color: c.textSecondary,
          maxWidth: '520px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}>
          This is a live demo of{' '}
          <strong style={{ color: c.text }}>Meridian Marketplace</strong>.
          <br />
          Connect your systems and watch Atlas detect payout drift in real time.
        </p>
      </div>

      {/* ── Steps ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '52px',
      }}>
        {[
          { label: 'Connect Systems', active: true, done: canProceed },
          { label: 'Review Dashboard', active: false, done: false },
          { label: 'Audit Trail', active: false, done: false },
        ].map((step, i) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: step.done ? c.success : step.active ? c.primary : c.border,
              color: step.active || step.done ? '#fff' : c.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {step.done ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '13px',
              fontWeight: step.active ? 600 : 400,
              color: step.active ? c.text : c.textSecondary,
              whiteSpace: 'nowrap',
            }}>
              {step.label}
            </span>
            {i < 2 && (
              <div style={{ width: '40px', height: '1px', background: c.border, flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Cards ────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: tokens.spacing.lg,
        maxWidth: '940px',
        margin: '0 auto',
        marginBottom: tokens.spacing.xl,
      }}>

        {/* STRIPE */}
        <Card
          icon="💳"
          title="Stripe"
          desc="Read settlement data and payout status in real time. Paste a test or live Secret Key below."
          connected={stripeState === 'connected'}
        >
          {stripeState === 'connected' ? (
            <Connected />
          ) : (
            <>
              <input
                type="password"
                placeholder="sk_test_..."
                value={stripeKey}
                onChange={(e) => { setStripeKey(e.target.value); setStripeError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && testStripe()}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: c.bgAlt,
                  border: `1px solid ${stripeState === 'error' ? c.danger : c.border}`,
                  borderRadius: tokens.radii.md,
                  color: c.text,
                  fontSize: '13px',
                  fontFamily: tokens.fonts.mono,
                  boxSizing: 'border-box',
                  marginBottom: '10px',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = c.primary)}
                onBlur={(e) => (e.target.style.borderColor = stripeState === 'error' ? c.danger : c.border)}
              />
              {stripeError && (
                <div style={{
                  fontSize: '12px',
                  color: c.danger,
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  ✕ {stripeError}
                </div>
              )}
              <button
                onClick={testStripe}
                disabled={stripeState === 'loading'}
                style={{
                  ...btnBase,
                  background: stripeState === 'loading' ? c.border : c.primary,
                  color: stripeState === 'loading' ? c.textSecondary : '#fff',
                  cursor: stripeState === 'loading' ? 'default' : 'pointer',
                }}
              >
                {stripeState === 'loading' ? 'Testing connection…' : 'Connect Stripe'}
              </button>
              <div style={{
                fontSize: '11px',
                color: c.textTertiary,
                marginTop: '10px',
                textAlign: 'center',
              }}>
                Need a key?{' '}
                <a
                  href="https://dashboard.stripe.com/test/apikeys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: c.primary, textDecoration: 'none' }}
                >
                  Get one at stripe.com →
                </a>
              </div>
            </>
          )}
        </Card>

        {/* BANK */}
        <Card
          icon="🏦"
          title="Bank (Plaid)"
          desc="Connect via Plaid for confirmed balances from 12,000+ institutions. Demo uses simulated data."
          connected={bankState === 'connected'}
        >
          {bankState === 'connected' ? (
            <Connected />
          ) : (
            <button
              onClick={() => simulateConnect(setBankState)}
              disabled={bankState === 'loading'}
              style={{
                ...btnBase,
                background: bankState === 'loading' ? c.border : c.primary,
                color: bankState === 'loading' ? c.textSecondary : '#fff',
                cursor: bankState === 'loading' ? 'default' : 'pointer',
              }}
            >
              {bankState === 'loading' ? 'Connecting…' : 'Connect Bank'}
            </button>
          )}
        </Card>

        {/* ERP */}
        <Card
          icon="📊"
          title="ERP (NetSuite)"
          desc="Read reserve amounts and payout eligibility from your ERP. Demo uses simulated data."
          connected={erpState === 'connected'}
        >
          {erpState === 'connected' ? (
            <Connected />
          ) : (
            <button
              onClick={() => simulateConnect(setErpState)}
              disabled={erpState === 'loading'}
              style={{
                ...btnBase,
                background: erpState === 'loading' ? c.border : c.primary,
                color: erpState === 'loading' ? c.textSecondary : '#fff',
                cursor: erpState === 'loading' ? 'default' : 'pointer',
              }}
            >
              {erpState === 'loading' ? 'Connecting…' : 'Connect ERP'}
            </button>
          )}
        </Card>
      </div>

      {/* ── Progress bar ─────────────────────────────────────── */}
      <div style={{ maxWidth: '940px', margin: '0 auto', marginBottom: '36px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '13px', color: c.textSecondary }}>
            {connectedCount} of 3 systems connected
            {connectedCount === 0 && ' — connect at least 1 to proceed'}
          </span>
          {connectedCount === 3 && (
            <span style={{ fontSize: '13px', color: c.success, fontWeight: 600 }}>
              ✓ All systems ready
            </span>
          )}
        </div>
        <div style={{
          height: '4px',
          background: c.border,
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(connectedCount / 3) * 100}%`,
            background: c.success,
            borderRadius: '2px',
            transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
          }} />
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      {canProceed && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              const systems = [];
              if (stripeState === 'connected') systems.push('stripe');
              if (bankState === 'connected') systems.push('bank');
              if (erpState === 'connected') systems.push('erp');
              sessionStorage.setItem('connected_systems', JSON.stringify(systems));
              router.push('/dashboard');
            }}
            style={{
              ...btnBase,
              width: 'auto',
              padding: '14px 40px',
              background: c.success,
              color: '#fff',
              fontSize: '16px',
              borderRadius: tokens.radii.lg,
              boxShadow: `0 4px 20px ${c.success}40`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Continue to Dashboard →
          </button>
          <p style={{ fontSize: '12px', color: c.textTertiary, marginTop: '12px' }}>
            You can add more systems anytime from the Setup page
          </p>
        </div>
      )}
    </div>
  );
}

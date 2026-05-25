'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/providers';
import { tokens } from '@/lib/design-tokens';

type SystemState = 'idle' | 'loading' | 'connected' | 'error';

const AtlasMark = ({ width = 24, height = 24 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-label="Atlas">
    <path d="M12 2L1 22h22L12 2z" fill="var(--ink)" />
    <rect x="7.5" y="14.5" width="9" height="2.5" fill="var(--canvas)" />
  </svg>
);

export default function OnboardingPage() {
  const { theme } = useTheme();
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
        background: 'rgba(95, 200, 143, 0.1)',
        border: '1px solid rgba(95, 200, 143, 0.35)',
        borderRadius: '6px',
        color: 'var(--ok)',
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
        background: 'var(--canvas-card)',
        border: `2px solid ${connected ? 'var(--ok)' : 'var(--hairline)'}`,
        borderRadius: tokens.radii.xl,
        padding: tokens.spacing.xl,
        transition: 'border-color 0.25s, box-shadow 0.25s',
        boxShadow: connected
          ? '0 0 0 4px rgba(95, 200, 143, 0.15)'
          : '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: '0 0 8px 0',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '13px',
          color: 'var(--body-mid)',
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
    fontFamily: 'var(--font-display)',
  };

  return (
    <div style={{
      background: 'var(--canvas)',
      color: 'var(--ink)',
      minHeight: '100vh',
      padding: '56px 24px 80px',
      fontFamily: 'var(--font-display)',
    }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <AtlasMark width={32} height={32} />
        </div>
        <h1 style={{
          fontSize: '40px',
          fontWeight: 800,
          color: 'var(--ink)',
          margin: '0 0 16px 0',
          letterSpacing: '-0.8px',
          lineHeight: 1.1,
        }}>
          Welcome to Atlas
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--body-mid)',
          maxWidth: '520px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}>
          This is a live demo of{' '}
          <strong style={{ color: 'var(--ink)' }}>Meridian Marketplace</strong>.
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
              background: step.done ? 'var(--ok)' : step.active ? 'var(--ink)' : 'var(--canvas-soft)',
              color: step.done ? 'var(--canvas)' : step.active ? 'var(--canvas)' : 'var(--mute)',
              border: `1px solid ${step.done ? 'var(--ok)' : step.active ? 'var(--ink)' : 'var(--hairline)'}`,
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
              color: step.active ? 'var(--ink)' : 'var(--mute)',
              whiteSpace: 'nowrap',
            }}>
              {step.label}
            </span>
            {i < 2 && (
              <div style={{ width: '40px', height: '1px', background: 'var(--hairline)', flexShrink: 0 }} />
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
                  background: 'var(--canvas-soft)',
                  border: `1px solid ${stripeState === 'error' ? 'var(--drift)' : 'var(--hairline)'}`,
                  borderRadius: tokens.radii.md,
                  color: 'var(--ink)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  boxSizing: 'border-box',
                  marginBottom: '10px',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = stripeState === 'error' ? 'var(--drift)' : 'var(--ink)')}
                onBlur={(e) => (e.target.style.borderColor = stripeState === 'error' ? 'var(--drift)' : 'var(--hairline)')}
              />
              {stripeError && (
                <div style={{
                  fontSize: '12px',
                  color: 'var(--drift)',
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
                  background: stripeState === 'loading' ? 'var(--hairline)' : 'var(--ink)',
                  color: stripeState === 'loading' ? 'var(--mute)' : 'var(--canvas)',
                  cursor: stripeState === 'loading' ? 'default' : 'pointer',
                }}
              >
                {stripeState === 'loading' ? 'Testing connection…' : 'Connect Stripe'}
              </button>
              <div style={{
                fontSize: '11px',
                color: 'var(--mute)',
                marginTop: '10px',
                textAlign: 'center',
              }}>
                Need a key?{' '}
                <a
                  href="https://dashboard.stripe.com/test/apikeys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--ink)', textDecoration: 'underline' }}
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
                background: bankState === 'loading' ? 'var(--hairline)' : 'var(--ink)',
                color: bankState === 'loading' ? 'var(--mute)' : 'var(--canvas)',
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
                background: erpState === 'loading' ? 'var(--hairline)' : 'var(--ink)',
                color: erpState === 'loading' ? 'var(--mute)' : 'var(--canvas)',
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
          <span style={{ fontSize: '13px', color: 'var(--body-mid)' }}>
            {connectedCount} of 3 systems connected
            {connectedCount === 0 && ' — connect at least 1 to proceed'}
          </span>
          {connectedCount === 3 && (
            <span style={{ fontSize: '13px', color: 'var(--ok)', fontWeight: 600 }}>
              ✓ All systems ready
            </span>
          )}
        </div>
        <div style={{
          height: '4px',
          background: 'var(--hairline)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(connectedCount / 3) * 100}%`,
            background: 'var(--ok)',
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
              background: 'var(--ok)',
              color: 'var(--canvas)',
              fontSize: '16px',
              borderRadius: tokens.radii.lg,
              boxShadow: '0 4px 20px rgba(95, 200, 143, 0.25)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Continue to Dashboard →
          </button>
          <p style={{ fontSize: '12px', color: 'var(--mute)', marginTop: '12px' }}>
            You can add more systems anytime from the Setup page
          </p>
        </div>
      )}
    </div>
  );
}

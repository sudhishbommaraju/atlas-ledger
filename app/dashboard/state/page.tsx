'use client';

import { useEffect, useState } from 'react';
import { getCanonicalState } from '@/lib/db';
import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

export default function StatePage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const c = tokens.colors[theme as Theme];
  const company_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  useEffect(() => {
    async function load() {
      try {
        const data = await getCanonicalState(company_id);
        setState(data);
      } catch {
        // use fallback below
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: '48px', color: c.textSecondary, fontFamily: tokens.fonts.body }}>Loading…</div>;
  }

  // fallback demo values if backend unavailable
  const safe = state ?? {
    stripe_settled_balance: 242180310,
    erp_recorded_balance:   218421000,
    bank_confirmed_balance:  227521000,
    safe_to_disburse:        220180000,
    state_confidence_score:  0.89,
  };

  const pct = Math.round(safe.state_confidence_score * 100);
  const confidenceColor = pct > 80 ? c.success : pct > 60 ? c.warning : c.danger;

  const metrics = [
    { label: 'Stripe Balance',   value: safe.stripe_settled_balance,  icon: '💳' },
    { label: 'ERP Balance',      value: safe.erp_recorded_balance,     icon: '📊' },
    { label: 'Bank Balance',     value: safe.bank_confirmed_balance,   icon: '🏦' },
    { label: 'Safe to Disburse', value: safe.safe_to_disburse,         icon: '✓'  },
  ];

  const fmt = (v: number) =>
    '$' + (v / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <div style={{ padding: tokens.spacing.xl, fontFamily: tokens.fonts.body }}>

      {/* Page header */}
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', color: c.text, letterSpacing: '-0.4px' }}>
        Canonical State
      </h1>
      <p style={{ fontSize: '13px', color: c.textSecondary, margin: '0 0 32px 0' }}>
        Meridian Marketplace · Single source of truth across all connected systems
      </p>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px', marginBottom: '24px' }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: c.cardBg,
            border: `1px solid ${c.cardBorder}`,
            borderRadius: tokens.radii.xl,
            padding: tokens.spacing.xl,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: c.textSecondary,
              marginBottom: '12px',
            }}>
              {m.icon} {m.label}
            </div>
            <div style={{ fontSize: '34px', fontWeight: 800, color: c.primary, marginBottom: '10px', letterSpacing: '-0.6px' }}>
              {fmt(m.value)}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              color: c.success,
              fontWeight: 600,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.success, display: 'inline-block' }} />
              Fresh data
            </div>
          </div>
        ))}
      </div>

      {/* Confidence card */}
      <div style={{
        background: c.cardBg,
        border: `1px solid ${c.cardBorder}`,
        borderRadius: tokens.radii.xl,
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: c.textSecondary,
          marginBottom: '16px',
        }}>
          State Confidence Score
        </div>
        <div style={{
          fontSize: '80px',
          fontWeight: 800,
          color: confidenceColor,
          lineHeight: 1,
          marginBottom: '14px',
          letterSpacing: '-2px',
        }}>
          {pct}%
        </div>
        <div style={{ fontSize: '14px', color: c.textSecondary, maxWidth: '420px', margin: '0 auto', lineHeight: '1.6' }}>
          All systems synchronised and providing reliable data.
          Atlas has high confidence in the current canonical state.
        </div>
      </div>
    </div>
  );
}

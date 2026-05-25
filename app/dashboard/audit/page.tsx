'use client';

import { useTheme } from '@/app/providers';
import { tokens, type Theme } from '@/lib/design-tokens';

const ENTRIES = [
  { time: '2m ago',  type: 'FREEZE',    actor: 'Atlas Engine', detail: 'Froze payout #PO-9241 ($142,300) — Stripe/bank delta exceeded 5% threshold', confidence: 94 },
  { time: '8m ago',  type: 'BLOCK',     actor: 'Atlas Engine', detail: 'Blocked duplicate payout #PO-8821 — already processed at 14:02 UTC',           confidence: 99 },
  { time: '15m ago', type: 'RECOMPUTE', actor: 'Atlas Engine', detail: 'Recomputed ERP reserve balance from Stripe net settlement data',                confidence: 87 },
  { time: '22m ago', type: 'REPAIR',    actor: 'Atlas Engine', detail: 'Cleared $89,400 for disbursement after balance reconciliation passed',          confidence: 91 },
];

const TYPE_COLOR: Record<string, string> = {
  FREEZE:    '#F59E0B',
  BLOCK:     '#EF4444',
  RECOMPUTE: '#1F6FEB',
  REPAIR:    '#10B981',
};

export default function AuditPage() {
  const { theme } = useTheme();
  const c = tokens.colors[theme as Theme];

  return (
    <div style={{ padding: tokens.spacing.xl, fontFamily: tokens.fonts.body }}>

      {/* Page header */}
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', color: c.text, letterSpacing: '-0.4px' }}>
        Audit Log
      </h1>
      <p style={{ fontSize: '13px', color: c.textSecondary, margin: '0 0 32px 0' }}>
        All Atlas decisions logged with full provenance for compliance
      </p>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ENTRIES.map((e, i) => {
          const tc = TYPE_COLOR[e.type] ?? c.primary;
          return (
            <div key={i} style={{
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              borderLeft: `4px solid ${tc}`,
              borderRadius: tokens.radii.lg,
              padding: '18px 20px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}>
              {/* Type badge */}
              <div style={{ flexShrink: 0, width: '86px' }}>
                <span style={{
                  background: tc,
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'block',
                  textAlign: 'center',
                  letterSpacing: '0.04em',
                }}>
                  {e.type}
                </span>
              </div>

              {/* Detail */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: c.text, lineHeight: '1.5', marginBottom: '6px' }}>
                  {e.detail}
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: c.textSecondary }}>
                    Actor: <strong style={{ color: c.text }}>{e.actor}</strong>
                  </span>
                  <span style={{ fontSize: '11px', color: c.textSecondary }}>
                    Confidence: <strong style={{ color: tc }}>{e.confidence}%</strong>
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    background: `${c.warning}18`,
                    color: c.warning,
                    border: `1px solid ${c.warning}40`,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                  }}>
                    SIM
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <span style={{ flexShrink: 0, fontSize: '11px', color: c.textTertiary, whiteSpace: 'nowrap' }}>
                {e.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '28px',
        padding: '14px 18px',
        background: c.bgAlt,
        border: `1px solid ${c.border}`,
        borderRadius: tokens.radii.md,
        fontSize: '12px',
        color: c.textSecondary,
      }}>
        📋 4 actions logged · All marked{' '}
        <strong style={{ color: c.warning }}>SIM</strong> (simulated demo) ·
        Connect real API keys in Setup to capture live decisions
      </div>
    </div>
  );
}

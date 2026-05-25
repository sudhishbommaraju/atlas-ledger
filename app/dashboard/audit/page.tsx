'use client';

import { useTheme } from '@/app/providers';

const ENTRIES = [
  { time: '2m ago',  type: 'FREEZE',    actor: 'Atlas Engine', detail: 'Froze payout #PO-9241 ($142,300) — Stripe/bank delta exceeded 5% threshold', confidence: 94 },
  { time: '8m ago',  type: 'BLOCK',     actor: 'Atlas Engine', detail: 'Blocked duplicate payout #PO-8821 — already processed at 14:02 UTC',           confidence: 99 },
  { time: '15m ago', type: 'RECOMPUTE', actor: 'Atlas Engine', detail: 'Recomputed ERP reserve balance from Stripe net settlement data',                confidence: 87 },
  { time: '22m ago', type: 'REPAIR',    actor: 'Atlas Engine', detail: 'Cleared $89,400 for disbursement after balance reconciliation passed',          confidence: 91 },
];

const TYPE_COLOR: Record<string, string> = {
  FREEZE:    'var(--warn)',
  BLOCK:     'var(--drift)',
  RECOMPUTE: 'var(--ink)',
  REPAIR:    'var(--ok)',
};

export default function AuditPage() {
  const { theme } = useTheme();

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>

      {/* Page header */}
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)', letterSpacing: '-0.4px' }}>
        Audit Log
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--body-mid)', margin: '0 0 32px 0' }}>
        All Atlas decisions logged with full provenance for compliance
      </p>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ENTRIES.map((e, i) => {
          const tc = TYPE_COLOR[e.type] ?? 'var(--ink)';
          return (
            <div key={i} style={{
              background: 'var(--canvas-card)',
              border: '1px solid var(--hairline)',
              borderLeft: `4px solid ${tc}`,
              borderRadius: '8px',
              padding: '18px 20px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}>
              {/* Type badge */}
              <div style={{ flexShrink: 0, width: '86px' }}>
                <span style={{
                  background: tc,
                  color: 'var(--canvas)',
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
                <div style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: '1.5', marginBottom: '6px' }}>
                  {e.detail}
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--body-mid)' }}>
                    Actor: <strong style={{ color: 'var(--ink)' }}>{e.actor}</strong>
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--body-mid)' }}>
                    Confidence: <strong style={{ color: tc }}>{e.confidence}%</strong>
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    background: 'rgba(255, 194, 133, 0.1)',
                    color: 'var(--warn)',
                    border: '1px solid rgba(255, 194, 133, 0.35)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                  }}>
                    SIM
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <span style={{ flexShrink: 0, fontSize: '11px', color: 'var(--mute)', whiteSpace: 'nowrap' }}>
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
        background: 'var(--canvas-soft)',
        border: '1px solid var(--hairline)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'var(--body-mid)',
      }}>
        📋 4 actions logged · All marked{' '}
        <strong style={{ color: 'var(--warn)' }}>SIM</strong> (simulated demo) ·
        Connect real API keys in Setup to capture live decisions
      </div>
    </div>
  );
}

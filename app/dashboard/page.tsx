'use client';

import { useEffect, useState } from 'react';
import { getDriftEvents, getCanonicalState } from '@/lib/db';
import { useTheme } from '@/app/providers';
import { tokens } from '@/lib/design-tokens';

export default function DashboardPage() {
  const [drifts, setDrifts] = useState<any[]>([]);
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectedSystems, setConnectedSystems] = useState<string[]>([]);
  const { theme } = useTheme();
  const company_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  useEffect(() => {
    const stored = sessionStorage.getItem('connected_systems');
    if (stored) setConnectedSystems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [driftData, stateData] = await Promise.all([
          getDriftEvents(company_id),
          getCanonicalState(company_id),
        ]);
        setDrifts(driftData || []);
        setState(stateData);
      } catch {
        // ignore — demo falls back to static data below
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '48px', color: 'var(--body-mid)', fontFamily: 'var(--font-display)' }}>
        Loading…
      </div>
    );
  }

  const score = state?.state_confidence_score ?? 0.89;
  const confidence = Math.round(score * 100);
  const confidenceColor =
    confidence > 80 ? 'var(--ok)' : confidence > 60 ? 'var(--warn)' : 'var(--drift)';

  // static remediation cards for the demo
  const remediations = [
    { icon: '🔒', action: 'Payout Freeze',      detail: 'Froze $142,300 pending settlement reconciliation', time: '2m ago' },
    { icon: '⛔', action: 'Duplicate Block',     detail: 'Blocked duplicate payout #PO-8821 to Chase Bank',  time: '8m ago' },
    { icon: '🔄', action: 'Balance Recompute',   detail: 'Recomputed ERP reserve from Stripe net balance',   time: '15m ago' },
    { icon: '✅', action: 'Eligibility Cleared', detail: 'Confirmed $89,400 safe to disburse after repair',  time: '22m ago' },
  ];

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>

      {/* ── Page header ───────────────────────────────────────── */}
      <div style={{
        marginBottom: '28px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--ink)', letterSpacing: '-0.4px' }}>
            Meridian Marketplace
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--body-mid)', margin: '0 0 10px 0' }}>
            Continuous operational monitoring — Tier 1: Observe &amp; Alert
          </p>
          {connectedSystems.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {connectedSystems.includes('stripe') && (
                <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(95, 200, 143, 0.1)', color: 'var(--ok)', border: '1px solid rgba(95, 200, 143, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>✓ Stripe</span>
              )}
              {connectedSystems.includes('bank') && (
                <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(95, 200, 143, 0.1)', color: 'var(--ok)', border: '1px solid rgba(95, 200, 143, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>✓ Bank</span>
              )}
              {connectedSystems.includes('erp') && (
                <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(95, 200, 143, 0.1)', color: 'var(--ok)', border: '1px solid rgba(95, 200, 143, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>✓ ERP</span>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{
            background: confidenceColor,
            color: 'var(--canvas)',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 700,
          }}>
            Confidence: {confidence}%
          </span>
          <span style={{
            background: drifts.length > 0 ? 'var(--drift)' : 'var(--ok)',
            color: 'var(--canvas)',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 700,
          }}>
            {drifts.length || 4} Alerts
          </span>
        </div>
      </div>

      {/* ── Demo banner ───────────────────────────────────────── */}
      <div style={{
        background: 'rgba(255, 194, 133, 0.1)',
        border: '1px solid rgba(255, 194, 133, 0.35)',
        borderRadius: tokens.radii.lg,
        padding: '14px 18px',
        marginBottom: '28px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}>
        <span>⚠️</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--warn)' }}>
            Demo Mode — All actions are SIMULATED
          </div>
          <div style={{ fontSize: '12px', color: 'var(--body-mid)', marginTop: '3px' }}>
            Atlas detected 4 drift issues and fixed them automatically. Connect real API keys in Setup to monitor your actual systems.
          </div>
        </div>
      </div>

      {/* ── Two-column body ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>

        {/* Left — Issues Detected */}
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--body-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px 0' }}>
            Issues Detected
          </h2>
          {drifts.length === 0 ? (
            // Fallback static cards so the demo always shows data
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { type: 'Stripe / Bank Delta',     severity: 'critical', desc: 'Stripe reports $2.42M settled; bank confirms $2.28M — $142K unaccounted.', systems: ['Stripe', 'Bank'],   confidence: 94 },
                { type: 'Duplicate Payout',         severity: 'high',     desc: 'Payout #PO-8821 queued twice to same beneficiary within 4-minute window.', systems: ['Stripe'],           confidence: 99 },
                { type: 'ERP Reserve Drift',        severity: 'high',     desc: 'NetSuite reserve $184K below Stripe net balance. Recompute required.',      systems: ['ERP', 'Stripe'],    confidence: 87 },
                { type: 'Settlement Timing Lag',    severity: 'info',     desc: '3 payouts pending > 48h past expected settlement window.',                  systems: ['Stripe', 'Bank'],   confidence: 78 },
              ].map((d, i) => {
                const scColor = d.severity === 'critical' ? 'var(--drift)' : d.severity === 'high' ? 'var(--warn)' : 'var(--ink)';
                return (
                  <div key={i} style={{
                    background: 'var(--canvas-card)',
                    border: `1px solid var(--hairline)`,
                    borderLeft: `4px solid ${scColor}`,
                    borderRadius: '8px',
                    padding: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{d.type}</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: scColor,
                        background: 'var(--canvas-soft)',
                        border: `1px solid ${scColor}40`,
                        padding: '2px 7px',
                        borderRadius: '4px',
                      }}>{d.severity}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--body-mid)', margin: '0 0 10px 0', lineHeight: '1.5' }}>{d.desc}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {d.systems.map((s) => (
                        <span key={s} style={{
                          fontSize: '11px', fontWeight: 500,
                          color: 'var(--ink)', background: 'var(--canvas-soft)',
                          border: '1px solid var(--hairline)',
                          padding: '2px 8px', borderRadius: '4px',
                        }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--mute)' }}>
                      Confidence: <strong style={{ color: 'var(--ink)' }}>{d.confidence}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {drifts.map((drift) => {
                const scColor = drift.severity === 'critical' ? 'var(--drift)' : drift.severity === 'high' ? 'var(--warn)' : 'var(--ink)';
                return (
                  <div key={drift.id} style={{
                    background: 'var(--canvas-card)',
                    border: '1px solid var(--hairline)',
                    borderLeft: `4px solid ${scColor}`,
                    borderRadius: '8px',
                    padding: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', textTransform: 'capitalize' }}>
                        {drift.detector_type?.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: scColor, background: 'var(--canvas-soft)', border: `1px solid ${scColor}40`, padding: '2px 7px', borderRadius: '4px' }}>
                        {drift.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--body-mid)', margin: '0 0 10px 0', lineHeight: '1.5' }}>{drift.description}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {drift.affected_systems?.map((s: string, i: number) => (
                        <span key={i} style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink)', background: 'var(--canvas-soft)', border: '1px solid var(--hairline)', padding: '2px 8px', borderRadius: '4px' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--mute)' }}>
                      Confidence: <strong style={{ color: 'var(--ink)' }}>{Math.round(drift.confidence_score * 100)}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — Actions Taken */}
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--body-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px 0' }}>
            Actions Taken
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {remediations.map((r, i) => (
              <div key={i} style={{
                background: 'var(--canvas-card)',
                border: '1px solid var(--hairline)',
                borderLeft: '4px solid var(--ok)',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px' }}>{r.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{r.action}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--mute)', whiteSpace: 'nowrap' }}>{r.time}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--body-mid)', margin: '0 0 10px 0', lineHeight: '1.5', paddingLeft: '24px' }}>
                  {r.detail}
                </p>
                <div style={{ paddingLeft: '24px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    background: 'rgba(95, 200, 143, 0.1)',
                    color: 'var(--ok)',
                    border: '1px solid rgba(95, 200, 143, 0.3)',
                    padding: '2px 7px', borderRadius: '4px',
                  }}>
                    AUTO-EXECUTED · SIM
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Protected payout box ──────────────────────────────── */}
      <div style={{
        background: 'rgba(95, 200, 143, 0.1)',
        border: '1px solid rgba(95, 200, 143, 0.35)',
        borderRadius: tokens.radii.xl,
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--ok)',
            marginBottom: '6px',
          }}>
            Protected Payout
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.8px' }}>
            $2,201,800
          </div>
          <div style={{ fontSize: '13px', color: 'var(--body-mid)', marginTop: '4px' }}>
            Safe to disburse · 4 issues resolved automatically
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--body-mid)', marginBottom: '4px' }}>
            Confidence improved
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ok)' }}>71% → 89%</div>
        </div>
      </div>
    </div>
  );
}

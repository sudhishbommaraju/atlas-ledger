'use client';

import { useEffect, useState } from 'react';
import { getDriftEvents, getCanonicalState } from '@/lib/db';
import { Header } from '@/app/components/Header';

export default function DashboardPage() {
  const [drifts, setDrifts] = useState<any[]>([]);
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const company_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  useEffect(() => {
    async function load() {
      try {
        const [driftData, stateData] = await Promise.all([
          getDriftEvents(company_id),
          getCanonicalState(company_id)
        ]);
        setDrifts(driftData || []);
        setState(stateData);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const confidenceColor = state?.state_confidence_score > 0.8 ? '#10B981' : state?.state_confidence_score > 0.6 ? '#F59E0B' : '#EF4444';

  return (
    <>
      <Header />
      <div style={{ marginLeft: '250px', marginTop: '70px', padding: '40px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0, color: '#111827' }}>
              Meridian Marketplace
            </h1>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: confidenceColor, color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                Confidence: {state ? Math.round(state.state_confidence_score * 100) : 0}%
              </div>
              <div style={{ background: drifts.length > 0 ? '#EF4444' : '#10B981', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                {drifts.length} Alerts
              </div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Continuous operational monitoring — Tier 1: Observe & Alert
          </p>
        </div>

        {/* Warning Banner */}
        <div style={{ background: '#FEF3C7', border: '1px solid #FBBF24', borderRadius: '8px', padding: '16px', marginBottom: '40px', display: 'flex', gap: '12px' }}>
          <div style={{ fontSize: '20px' }}>⚠️</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E' }}>Demo Mode: All actions are SIMULATED</div>
            <div style={{ fontSize: '12px', color: '#B45309', marginTop: '4px' }}>
              When you connect your real API keys, these detections will execute against your actual Stripe, ERP, and banking systems.
            </div>
          </div>
        </div>

        {/* Drift Events Section */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#111827' }}>
            Detected Issues
          </h2>

          {drifts.length === 0 ? (
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                No issues detected
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                Your payout operations are running smoothly.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {drifts.map(drift => {
                const severityColor = drift.severity === 'critical' ? '#EF4444' : drift.severity === 'high' ? '#F59E0B' : '#1F6FEB';
                const severityBg = drift.severity === 'critical' ? '#FEE2E2' : drift.severity === 'high' ? '#FEF3C7' : '#EFF6FF';
                
                return (
                  <div key={drift.id} style={{
                    background: '#FFFFFF',
                    border: `2px solid ${severityColor}`,
                    borderRadius: '12px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#111827', textTransform: 'capitalize' }}>
                        {drift.detector_type?.replace(/_/g, ' ')}
                      </h3>
                      <div style={{ background: severityBg, color: severityColor, padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                        {drift.severity}
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                      {drift.description}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      {drift.affected_systems?.map((sys: any, i: number) => (
                        <span key={i} style={{ background: '#F0F9FF', color: '#0369A1', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', border: '1px solid #BAE6FD', fontWeight: 500 }}>
                          {sys}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Confidence</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                          {Math.round(drift.confidence_score * 100)}%
                        </div>
                      </div>
                      <button style={{
                        padding: '8px 16px',
                        background: '#1F6FEB',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getCanonicalState } from '@/lib/db';
import { Header } from '@/app/components/Header';

export default function StatePage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const company_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  useEffect(() => {
    async function load() {
      try {
        const data = await getCanonicalState(company_id);
        setState(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;
  if (!state) return <div style={{ padding: '40px' }}>No data</div>;

  const confidenceColor = state.state_confidence_score > 0.8 ? '#10B981' : state.state_confidence_score > 0.6 ? '#F59E0B' : '#EF4444';

  return (
    <>
      <Header />
      <div style={{ marginLeft: '250px', marginTop: '70px', padding: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '40px', color: '#111827' }}>Canonical State</h1>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {[
            { label: 'Stripe Balance', value: state.stripe_settled_balance, icon: '💳' },
            { label: 'ERP Balance', value: state.erp_recorded_balance, icon: '📊' },
            { label: 'Bank Balance', value: state.bank_confirmed_balance, icon: '🏦' },
            { label: 'Safe to Disburse', value: state.safe_to_disburse, icon: '✓' }
          ].map((metric, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 700 }}>
                {metric.icon} {metric.label}
              </div>
              <div style={{ fontSize: '40px', fontWeight: 700, color: '#1F6FEB', marginBottom: '16px' }}>
                ${(metric.value / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>✓ Fresh data</div>
            </div>
          ))}
        </div>

        {/* Confidence */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px', textTransform: 'uppercase', fontWeight: 700 }}>
            State Confidence Score
          </div>
          <div style={{ fontSize: '64px', fontWeight: 700, color: confidenceColor, marginBottom: '16px' }}>
            {Math.round(state.state_confidence_score * 100)}%
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            All systems are synchronized and providing reliable data.
          </div>
        </div>
      </div>
    </>
  );
}

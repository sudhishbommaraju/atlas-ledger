'use client';

import { useEffect, useState } from 'react';

interface RemediationAction {
  id: string;
  action_type: string;
  confidence_score: number;
  status: string;
  simulated: boolean | null;
  triggered_by: string;
  audit_log: string | null;
  created_at: string;
  executed_at: string | null;
}

export default function RemediationPage() {
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/remediation-actions')
      .then(res => res.json())
      .then(data => {
        setActions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', color: '#8B949E', fontSize: '14px' }}>
        Loading...
      </div>
    );
  }

  const statusColor = (s: string) =>
    s === 'auto_executed' ? '#1D9E75' :
    s === 'escalated'     ? '#BA7517' :
    s === 'approved'      ? '#1D9E75' :
    s === 'rejected'      ? '#DA3633' : '#6E7681';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0, color: '#C9D1D9' }}>Remediation Log</h1>
        <span style={{ fontSize: '13px', color: '#8B949E' }}>{actions.length} actions</span>
      </div>

      {actions.length === 0 ? (
        <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', padding: '48px', textAlign: 'center', color: '#8B949E' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#C9D1D9', marginBottom: '4px' }}>Atlas is monitoring your operations</div>
          <div style={{ fontSize: '13px' }}>Remediation actions will appear here when triggered</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {actions.map(action => (
            <div key={action.id} style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: '#C9D1D9', textTransform: 'capitalize' }}>
                  {action.action_type.replace(/_/g, ' ')}
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                  {action.simulated && (
                    <span style={{ background: 'rgba(186,117,23,0.15)', color: '#BA7517', padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 700 }}>
                      SIM
                    </span>
                  )}
                  <span style={{ background: statusColor(action.status) + '22', color: statusColor(action.status), padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 600, border: `1px solid ${statusColor(action.status)}44`, textTransform: 'uppercase' }}>
                    {action.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#6E7681' }}>
                <span>Confidence: {Math.round(action.confidence_score * 100)}%</span>
                <span>By: {action.triggered_by}</span>
                <span>{new Date(action.created_at).toLocaleString()}</span>
              </div>

              {action.audit_log && (
                <div style={{ marginTop: '12px', background: '#0D1117', border: '1px solid #21262D', borderRadius: '4px', padding: '12px', fontSize: '12px', color: '#8B949E', lineHeight: '1.5', fontFamily: 'monospace' }}>
                  {action.audit_log}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

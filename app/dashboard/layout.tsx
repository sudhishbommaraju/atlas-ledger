import React from 'react';
import { Header } from '@/app/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1117', color: '#C9D1D9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Header />
      {/* Sidebar */}
      <div style={{ width: '200px', background: '#161B22', borderRight: '1px solid #30363D', padding: '24px 16px', overflowY: 'auto', position: 'fixed', height: '100vh', left: 0, top: 0 }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '32px', margin: '0 0 32px 0' }}>Atlas</h2>
        
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#6E7681', marginBottom: '12px', letterSpacing: '0.05em' }}>Tier 1 — Observe</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="/dashboard" style={{ fontSize: '13px', color: '#79c0ff', textDecoration: 'none', padding: '8px 0' }}>Drift Detection</a>
            <a href="/dashboard/state" style={{ fontSize: '13px', color: '#79c0ff', textDecoration: 'none', padding: '8px 0' }}>Canonical State</a>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#6E7681', marginBottom: '12px', letterSpacing: '0.05em' }}>Audit</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="/dashboard/audit" style={{ fontSize: '13px', color: '#79c0ff', textDecoration: 'none', padding: '8px 0' }}>Audit Log</a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #30363D', paddingTop: '16px', marginTop: '32px' }}>
          <a href="/dashboard/setup" style={{ fontSize: '13px', color: '#58A6FF', textDecoration: 'none', padding: '8px 0', display: 'block', fontWeight: 500 }}>⚙️ Setup Integrations</a>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '200px', marginTop: '60px', flex: 1, padding: '32px' }}>
        {children}
      </div>
    </div>
  );
}

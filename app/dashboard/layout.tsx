import React from 'react';
import { Header } from '@/app/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827' }}>
      <Header />
      
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: '#F9FAFB',
        borderRight: '1px solid #E5E7EB',
        padding: '90px 0 0 0',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 20px' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '12px', letterSpacing: '0.05em' }}>
              Tier 1 — Observe
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/dashboard" style={{ fontSize: '13px', color: '#1F6FEB', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 500, transition: 'all 0.2s', background: '#EFF6FF' }}>
                📊 Drift Detection
              </a>
              <a href="/dashboard/state" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 500, transition: 'all 0.2s' }}>
                ⚖️ Canonical State
              </a>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '12px', letterSpacing: '0.05em' }}>
              Audit & Setup
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="/dashboard/audit" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 500 }}>
                📋 Audit Log
              </a>
              <a href="/dashboard/setup" style={{ fontSize: '13px', color: '#10B981', textDecoration: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 600, background: '#ECFDF5' }}>
                ⚙️ Setup Systems
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', marginTop: '70px', flex: 1, background: '#FFFFFF' }}>
        {children}
      </div>
    </div>
  );
}

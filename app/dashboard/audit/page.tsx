'use client';

import { Header } from '@/app/components/Header';

export default function AuditPage() {
  return (
    <>
      <Header />
      <div style={{ marginLeft: '250px', marginTop: '70px', padding: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '40px', color: '#111827' }}>Audit Log</h1>
        
        <div style={{
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Audit trail is empty</div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>All Atlas actions are logged here for compliance.</div>
        </div>
      </div>
    </>
  );
}

'use client';

export function Header() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1F6FEB' }}>🔷</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Atlas</div>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <a href="#" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Documentation</a>
        <a href="#" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Settings</a>
        <a href="#" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Logout</a>
      </div>
    </div>
  );
}

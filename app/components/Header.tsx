'use client';

export function Header() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      background: '#161B22',
      borderBottom: '1px solid #30363D',
      position: 'fixed',
      top: 0,
      left: 200,
      right: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>🔷</div>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>Atlas</div>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <a href="#" style={{ fontSize: '13px', color: '#79c0ff', textDecoration: 'none' }}>Documentation</a>
        <a href="#" style={{ fontSize: '13px', color: '#79c0ff', textDecoration: 'none' }}>Logout</a>
      </div>
    </div>
  );
}

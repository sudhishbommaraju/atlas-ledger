const ITEMS = [
  'PAPER BALANCE','$2,410,000','◆',
  'BLOCKED FUNDS','$480,000','◆',
  'PAYOUTABLE','$1,930,000','◆',
  'VERDICT','PARTIAL','◆',
  'RECONCILIATION','2,847 ROWS · 800ms','◆',
  'EXCEPTIONS','2 OPEN','◆',
  'PAYOUT RAILS','ACH · WIRE · SWIFT','◆',
  'AUDIT LOG','IMMUTABLE','◆',
  'SETTLEMENT MATCH','99.8%','◆',
  'LAST SYNC','LIVE','◆',
]

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div style={{
      background: 'var(--raised)',
      borderTop: '1px solid var(--line)',
      borderBottom: '1px solid var(--line)',
      padding: '11px 0',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', animation: 'marquee 50s linear infinite', whiteSpace: 'nowrap' }}>
        {doubled.map((item, i) => (
          <span key={i} className="mono" style={{
            fontSize: '0.58rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginRight: 16,
            color:
              item === '◆'           ? 'rgba(198,166,107,0.2)' :
              item === 'PARTIAL'      ? 'var(--amber)' :
              item === '2 OPEN'       ? 'var(--scarlet)' :
              item === '$1,930,000'   ? 'var(--sage)' :
              item === 'LIVE'         ? 'var(--sage)' :
              item === 'IMMUTABLE'    ? 'var(--gold-dim)' :
              item === '99.8%'        ? 'var(--sage)' :
              'var(--dust)',
          }}>{item}</span>
        ))}
      </div>
    </div>
  )
}

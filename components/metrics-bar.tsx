'use client'

import { useReconStore } from '@/store/recon-store'

function fmt(n: number, currency?: string): string {
  if (currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  }
  return n.toLocaleString()
}

export default function MetricsBar() {
  const { files, matchResults, disbursable, hasRun } = useReconStore()

  const totalFiles = files.filter((f) => f.status === 'parsed' || f.status === 'warning').length
  const totalRecords = files.reduce((s, f) => s + f.recordCount, 0)
  const matched = matchResults.filter((r) => r.status === 'matched').length
  const total = matchResults.length
  const matchRate = total > 0 ? ((matched / total) * 100).toFixed(1) + '%' : '—'
  const exceptions = matchResults.filter((r) => r.status !== 'matched').length
  const disbursableAmt = disbursable
    ? fmt(disbursable.available, disbursable.currency)
    : '—'

  const metrics = [
    { label: 'Files Uploaded', value: totalFiles || '—' },
    { label: 'Records Parsed', value: totalRecords > 0 ? fmt(totalRecords) : '—' },
    { label: 'Match Rate', value: hasRun ? matchRate : '—' },
    {
      label: 'Exceptions',
      value: hasRun ? exceptions : '—',
      highlight: hasRun && exceptions > 0 ? '#fca5a5' : undefined,
    },
    {
      label: 'Disbursable',
      value: hasRun ? disbursableAmt : '—',
      highlight: hasRun && disbursable && disbursable.available > 0 ? '#86efac' : undefined,
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        gap: 1,
        background: 'var(--border-subtle)',
        borderRadius: 6,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {metrics.map((m) => (
        <div
          key={m.label}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
            {m.label}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: 'var(--font-mono), monospace',
              color: m.highlight || 'var(--text-primary)',
              marginTop: 4,
              letterSpacing: '-0.02em',
            }}
          >
            {m.value}
          </div>
        </div>
      ))}
    </div>
  )
}

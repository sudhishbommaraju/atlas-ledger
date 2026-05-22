'use client'

import { useReconStore } from '@/store/recon-store'
import { generateReport } from '@/lib/export'

function fmtCurrency(n: number, ccy: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy || 'USD' }).format(n)
}

export default function ReportsPage() {
  const { files, matchResults, disbursable, hasRun } = useReconStore()

  const total = matchResults.length
  const matched = matchResults.filter((r) => r.status === 'matched').length
  const exceptions = matchResults.filter((r) => r.status !== 'matched').length
  const matchRate = total > 0 ? ((matched / total) * 100).toFixed(1) + '%' : '—'

  const handleDownload = () => {
    if (!disbursable) return
    const csv = generateReport(files, matchResults, disbursable)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `atlas-ledger-recon-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stat = (label: string, value: string | number) => (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono), monospace', color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Reports
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
          Export reconciliation summary and exception details.
        </p>
      </div>

      {!hasRun && (
        <div
          style={{
            border: '1px dashed var(--border-subtle)',
            borderRadius: 6,
            padding: 32,
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 13,
          }}
        >
          Run reconciliation first to generate a report.
        </div>
      )}

      {hasRun && (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Summary
            </div>
            {stat('Files ingested', files.filter((f) => f.status !== 'failed').length)}
            {stat('Total records', matchResults.length)}
            {stat('Matched', matched)}
            {stat('Exceptions', exceptions)}
            {stat('Match rate', matchRate)}
            {disbursable && stat('Disbursable', fmtCurrency(disbursable.available, disbursable.currency))}

            <button
              onClick={handleDownload}
              disabled={!disbursable}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '9px 0',
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 500,
                fontSize: 13,
                border: 'none',
                borderRadius: 4,
              }}
            >
              Download Reconciliation Report
            </button>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
              CSV format · includes exceptions + disbursable breakdown
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Ingested Files
            </div>
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Records</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>{f.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{f.extension}</td>
                    <td style={{ textAlign: 'right', fontSize: 11, fontFamily: 'monospace' }}>{f.recordCount}</td>
                    <td style={{ fontSize: 11, color: f.status === 'parsed' ? '#86efac' : f.status === 'failed' ? '#fca5a5' : '#fde68a' }}>
                      {f.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

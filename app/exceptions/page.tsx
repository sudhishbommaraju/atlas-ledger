'use client'

import { useReconStore } from '@/store/recon-store'
import ReconTable from '@/components/recon-table'

export default function ExceptionsPage() {
  const { matchResults, hasRun } = useReconStore()
  const exceptions = matchResults.filter((r) => r.status !== 'matched')

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Exceptions
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
            Records requiring manual review or action.
          </p>
        </div>
        {hasRun && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 10,
              color: exceptions.length > 0 ? '#fca5a5' : '#86efac',
              background: exceptions.length > 0 ? '#2a0000' : '#052e16',
            }}
          >
            {exceptions.length} exception{exceptions.length !== 1 ? 's' : ''}
          </span>
        )}
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
          Run reconciliation to see exceptions.
        </div>
      )}

      {hasRun && exceptions.length === 0 && (
        <div
          style={{
            border: '1px solid #052e16',
            borderRadius: 6,
            padding: 24,
            color: '#86efac',
            fontSize: 13,
            background: '#011a0a',
          }}
        >
          No exceptions — all records matched cleanly.
        </div>
      )}

      {hasRun && exceptions.length > 0 && (
        <ReconTable results={exceptions} parserWarnings={[]} />
      )}
    </div>
  )
}

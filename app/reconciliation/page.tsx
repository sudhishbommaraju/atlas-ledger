'use client'

import { useReconStore } from '@/store/recon-store'
import FileUploader from '@/components/file-uploader'
import SourceList from '@/components/source-list'
import MetricsBar from '@/components/metrics-bar'
import ReconTable from '@/components/recon-table'

export default function ReconciliationPage() {
  const { files, matchResults, hasRun, runReconciliation: run } = useReconStore()

  const readyFiles = files.filter((f) => f.status === 'parsed' || f.status === 'warning')
  const canRun = readyFiles.length > 0

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Reconciliation
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
          Upload settlement files and run reconciliation across sources.
        </p>
      </div>

      <MetricsBar />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, flex: 1 }}>
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FileUploader />

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Ingested Sources
            </div>
            <SourceList />
          </div>

          <button
            onClick={run}
            disabled={!canRun}
            style={{
              background: canRun ? 'var(--accent)' : 'var(--bg-elevated)',
              color: canRun ? '#fff' : 'var(--text-muted)',
              padding: '9px 0',
              width: '100%',
              fontWeight: 500,
              fontSize: 13,
              border: '1px solid',
              borderColor: canRun ? 'var(--accent)' : 'var(--border-default)',
            }}
          >
            Run Reconciliation
          </button>
        </div>

        {/* Right panel */}
        <div style={{ overflow: 'hidden' }}>
          {!hasRun ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 300,
                border: '1px dashed var(--border-subtle)',
                borderRadius: 6,
                color: 'var(--text-muted)',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 14 }}>No reconciliation run yet</div>
              <div style={{ fontSize: 12 }}>Upload files and click Run Reconciliation</div>
            </div>
          ) : (
            <ReconTable results={matchResults} />
          )}
        </div>
      </div>
    </div>
  )
}

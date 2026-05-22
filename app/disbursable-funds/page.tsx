'use client'

import { useState } from 'react'
import { useReconStore } from '@/store/recon-store'
import DisbursablePanel from '@/components/disbursable-panel'
import { calcDisbursable } from '@/lib/engine'

export default function DisbursableFundsPage() {
  const { disbursable, matchResults, files, hasRun } = useReconStore()
  const [includePartials, setIncludePartials] = useState(false)

  const allRecords = files.flatMap((f) => f.records)

  const activeDisbursable = hasRun
    ? includePartials
      ? calcDisbursable(
          allRecords,
          matchResults.filter((r) => r.status !== 'partial')
        )
      : disbursable
    : null

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Disbursable Funds
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
          Net funds available for payout after all deductions and holds.
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
          Run reconciliation first to calculate disbursable funds.
        </div>
      )}

      {hasRun && activeDisbursable && (
        <div style={{ maxWidth: 560 }}>
          <DisbursablePanel
            disbursable={activeDisbursable}
            showPartials={includePartials}
            onTogglePartials={setIncludePartials}
          />
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            Last calculated: {new Date().toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useReconStore } from '@/store/recon-store'
import FileUploader from '@/components/file-uploader'
import ReconTable from '@/components/recon-table'
import { WorkflowStepper, MetricCard } from '@/components/ui-helpers'
import { downloadReport } from '@/lib/export-report'

function fmt(n: number, currency?: string): string {
  if (currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  }
  return n.toLocaleString()
}

export default function ReconciliationPage() {
  const { files, matchResults, disbursable, hasRun, runReconciliation } = useReconStore()

  const readyFiles = files.filter((f) => f.status === 'parsed' || f.status === 'warning')
  const canRun = readyFiles.length > 0

  const totalRecords = files.reduce((s, f) => s + f.recordCount, 0)
  const matched = matchResults.filter((r) => r.status === 'matched').length
  const partial = matchResults.filter((r) => r.status === 'partial').length
  const timingDrift = matchResults.filter((r) => r.status === 'timing_drift').length
  const duplicates = matchResults.filter((r) => r.status === 'duplicate').length
  const unmatched = matchResults.filter((r) => r.status === 'unmatched').length
  const exceptions = matchResults.filter((r) => r.status !== 'matched' && r.status !== 'partial' && r.status !== 'timing_drift').length
  
  const reconcilableCount = matched + partial + timingDrift + unmatched + duplicates;
  const matchRate = reconcilableCount > 0 ? ((matched + partial + timingDrift) / reconcilableCount) * 100 : 0;

  const parserWarnings = files.flatMap(f => f.warnings);

  return (
    <div className="flex h-full flex-col gap-6 p-8 text-neutral-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Reconciliation</h1>
          <p className="mt-1 text-sm text-neutral-500">Validate settlement data before payouts move.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runReconciliation}
            disabled={!canRun}
            className={`rounded px-4 py-2 text-sm font-medium transition ${
              canRun
                ? 'bg-neutral-100 text-neutral-900 hover:bg-white'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Run Reconciliation
          </button>
          <button
            onClick={() => downloadReport(files, matchResults, disbursable, parserWarnings)}
            disabled={!hasRun}
            className={`rounded border px-4 py-2 text-sm font-medium transition ${
              hasRun
                ? 'border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800'
                : 'border-neutral-800 bg-neutral-950 text-neutral-600 cursor-not-allowed'
            }`}
          >
            Export Report
          </button>
        </div>
      </div>

      <WorkflowStepper 
        uploaded={files.length > 0} 
        normalized={canRun} 
        matched={hasRun} 
        reviewed={false} 
      />

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-6">
          <FileUploader />
          
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-4">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Source Health</h3>
            {files.length === 0 ? (
              <div className="text-sm text-neutral-600">No sources ingested.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {files.map(f => (
                  <div key={f.id} className="flex flex-col gap-1 border-b border-neutral-800/50 pb-2 last:border-0">
                    <div className="flex justify-between text-sm text-neutral-300">
                      <span className="truncate">{f.name}</span>
                      <span className="font-mono text-neutral-500">{f.recordCount}</span>
                    </div>
                    {f.warnings.length > 0 && (
                      <div className="text-xs text-amber-500/80">{f.warnings.length} warnings</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-4">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Disbursable Formula</h3>
            {hasRun && disbursable ? (
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Gross Settled</span>
                  <span>{fmt(disbursable.grossSettled, disbursable.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>- Fees</span>
                  <span>{fmt(disbursable.fees, disbursable.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>- Refunds</span>
                  <span>{fmt(disbursable.refunds, disbursable.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>- Chargebacks</span>
                  <span>{fmt(disbursable.chargebacks, disbursable.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>- Reserves</span>
                  <span>{fmt(disbursable.reserves, disbursable.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>- Unresolved</span>
                  <span>{fmt(disbursable.unresolved, disbursable.currency)}</span>
                </div>
                <div className="my-1 h-px bg-neutral-800" />
                <div className="flex justify-between text-sm font-semibold text-green-400">
                  <span>= Available</span>
                  <span>{fmt(disbursable.available, disbursable.currency)}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-600">Run reconciliation to calculate.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard label="Match Rate" value={hasRun ? matchRate.toFixed(1) + '%' : '—'} tone={hasRun ? "green" : "neutral"} />
            <MetricCard label="Exceptions" value={hasRun ? exceptions : '—'} tone={hasRun && exceptions > 0 ? "red" : "neutral"} />
            <MetricCard label="Matched" value={hasRun ? matched : '—'} tone="neutral" />
            <MetricCard label="Duplicates" value={hasRun ? duplicates : '—'} tone={hasRun && duplicates > 0 ? "amber" : "neutral"} />
          </div>

          <div className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950/70 overflow-hidden">
            {!hasRun ? (
              <div className="flex h-full flex-col items-center justify-center text-neutral-500">
                <div className="text-sm">No reconciliation run yet</div>
              </div>
            ) : (
              <ReconTable results={matchResults} parserWarnings={parserWarnings} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

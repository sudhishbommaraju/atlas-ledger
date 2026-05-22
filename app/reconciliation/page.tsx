'use client'

import { useReconStore } from '@/store/recon-store'
import FileUploader from '@/components/file-uploader'
import ReconClusterTable from '@/components/recon-cluster-table'
import { WorkflowStepper, MetricCard } from '@/components/ui-helpers'
import { downloadReport } from '@/lib/export-report'

function fmt(n: number, currency?: string): string {
  if (currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  }
  return n.toLocaleString()
}

export default function ReconciliationPage() {
  const { files, results, excludedSheets, hasRun, runReconciliation } = useReconStore()

  const readyFiles = files.filter((f) => f.status === 'parsed' || f.status === 'warning')
  const canRun = readyFiles.length >= 2 && files.some(f => f.recordCount > 0)

  return (
    <div className="flex h-full flex-col gap-6 p-8 text-neutral-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Reconciliation</h1>
          <p className="mt-1 text-sm text-neutral-500">Validate settlement data before payouts move.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasRun && results && (
            <div className="mr-4 flex flex-col items-end text-xs text-neutral-500">
              <span>Run ID: {results.runId}</span>
              <span>{new Date(results.generatedAt).toLocaleString()}</span>
            </div>
          )}
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
            onClick={() => {
              if (results) downloadReport(files, results)
            }}
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
              <div className="flex flex-col gap-4">
                {Object.entries(
                  files.reduce((acc, f) => {
                    const key = f.archiveName || 'root'
                    if (!acc[key]) acc[key] = []
                    acc[key].push(f)
                    return acc
                  }, {} as Record<string, typeof files>)
                ).map(([archiveName, groupedFiles]) => (
                  <div key={archiveName} className="flex flex-col gap-2 border-b border-neutral-800/50 pb-3 last:border-0">
                    {archiveName !== 'root' && (
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                        <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span className="truncate">{archiveName}</span>
                      </div>
                    )}
                    <div className={archiveName !== 'root' ? 'ml-4 flex flex-col gap-2 border-l border-neutral-800 pl-3' : 'flex flex-col gap-2'}>
                      {groupedFiles.map(f => (
                        <div key={f.id} className="flex flex-col gap-1">
                          <div className="flex justify-between text-sm text-neutral-300">
                            <span className="truncate">{f.name}</span>
                            <span className="font-mono text-neutral-500">{f.recordCount} rows</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-neutral-500">
                              {f.sourceType ? `Type: ${f.sourceType}` : 'Type: unknown'}
                            </div>
                            {f.warnings.length > 0 && (
                              <div className="text-xs text-amber-500/80">{f.warnings.length} parser warnings</div>
                            )}
                            {f.status === 'failed' && (
                              <div className="text-xs text-red-500/80">Failed to parse</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {excludedSheets.length > 0 && (
                  <div className="mt-1 text-xs text-neutral-500">
                    Excluded {excludedSheets.length} metadata sheets
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-4">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Disbursable Breakdown</h3>
            {hasRun && results ? (
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Gross Settled</span>
                  <span>{fmt(results.disbursableBreakdown.grossSettled, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>- Fees</span>
                  <span>{fmt(results.disbursableBreakdown.fees, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>- Refunds</span>
                  <span>{fmt(results.disbursableBreakdown.refunds, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>- Chargebacks</span>
                  <span>{fmt(results.disbursableBreakdown.chargebacks, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>- Reserves</span>
                  <span>{fmt(results.disbursableBreakdown.reserves, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-amber-500/80">
                  <span>- Unresolved Exposure</span>
                  <span>{fmt(results.disbursableBreakdown.unresolvedExposure, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="my-1 h-px bg-neutral-800" />
                <div className="flex justify-between text-sm font-semibold text-green-400">
                  <span>= Payoutable</span>
                  <span>{fmt(results.disbursableBreakdown.payoutable, results.disbursableBreakdown.currency)}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-600">Run reconciliation to calculate.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-8">
            <MetricCard label="Match Rate" value={results ? results.matchRate.toFixed(1) + '%' : '—'} tone={results ? "green" : "neutral"} />
            <MetricCard label="Matched" value={results ? results.metrics.matched : '—'} tone="neutral" />
            <MetricCard label="Partial" value={results ? results.metrics.partial : '—'} tone="neutral" />
            <MetricCard label="Exceptions" value={results ? results.metrics.exceptions : '—'} tone={results && results.metrics.exceptions > 0 ? "red" : "neutral"} />
            <MetricCard label="Duplicate" value={results ? results.metrics.duplicates : '—'} tone={results && results.metrics.duplicates > 0 ? "amber" : "neutral"} />
            <MetricCard label="Ignored" value={results ? results.metrics.ignored : '—'} tone="neutral" />
            <MetricCard label="Validation" value={results ? results.metrics.validationAssets : '—'} tone="neutral" />
            <MetricCard label="Disbursable" value={results ? fmt(results.disbursableBreakdown.payoutable, 'USD') : '—'} tone={results ? "green" : "neutral"} />
          </div>

          <div className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950/70 overflow-hidden flex flex-col">
            {!hasRun || !results ? (
              <div className="flex h-full flex-col items-center justify-center text-neutral-500">
                <div className="text-sm">No reconciliation run yet</div>
              </div>
            ) : (
              <ReconClusterTable results={results} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

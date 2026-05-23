'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useReconStore, operationalFiles, validationFiles, canRun, canRunReason } from '@/store/recon-store'
import FileUploader from '@/components/file-uploader'
import ReconClusterTable from '@/components/recon-cluster-table'
import { WorkflowStepper, MetricCard } from '@/components/ui-helpers'
import { downloadReport } from '@/lib/export-report'

const IS_DEV = process.env.NODE_ENV === 'development'

function fmt(n: number, currency?: string): string {
  if (currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  }
  return n.toLocaleString()
}

function SourceIcon({ type }: { type?: string }) {
  if (type === 'psp') return <svg className="w-4 h-4 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
  if (type === 'erp') return <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  if (type === 'bank') return <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
  if (type === 'ledger') return <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  return <svg className="w-4 h-4 text-[#5B6472]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
}

export default function ReconciliationPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const { files, results, excludedSheets, hasRun, runReconciliation } = useReconStore()

  useEffect(() => {
    if (!sessionStorage.getItem('atlas_demo_access')) {
      router.push('/demo-access')
    } else {
      const t = setTimeout(() => setIsAuthorized(true), 0)
      return () => clearTimeout(t)
    }
  }, [router])

  if (!isAuthorized) return null

  const opFiles = operationalFiles(files)
  const valFiles = validationFiles(files)
  const canRunNow = canRun(files)

  // Parsing-complete = no file is in pending/parsing state
  const parsingInProgress = files.some((f) => f.status === 'pending' || f.status === 'parsing')

  function handleRunReconciliation() {
    if (!canRunNow) {
      console.warn('[Atlas] Run Reconciliation clicked while disabled:', canRunReason(files))
      return
    }
    setIsRunning(true)
    // Use setTimeout so the UI can re-render the loading state before the
    // synchronous (but potentially expensive) engine run blocks the thread.
    setTimeout(() => {
      try {
        runReconciliation()
      } finally {
        setIsRunning(false)
      }
    }, 50)
  }

  return (
    <div className="flex h-full min-h-screen flex-col gap-6 bg-[#F7F4EE] p-4 lg:p-8 text-[#0B1220] font-sans">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1220]">Reconciliation Workspace</h1>
          <p className="mt-1 text-sm text-[#5B6472]">Upload settlement sources to begin reconciliation.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasRun && results && (
            <div className="mr-4 flex flex-col items-end text-xs text-[#5B6472]">
              <span className="font-medium">Run ID: {results.runId.split('-')[0]}</span>
              <span>{new Date(results.generatedAt).toLocaleTimeString()}</span>
            </div>
          )}
          <button
            id="run-reconciliation-btn"
            onClick={handleRunReconciliation}
            disabled={!canRunNow || isRunning}
            title={!canRunNow ? canRunReason(files) : 'Run reconciliation engine'}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-all ${
              canRunNow && !isRunning
                ? 'bg-[#1D4ED8] text-white hover:bg-blue-800 hover:shadow-md'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {isRunning ? 'Running…' : 'Run Reconciliation'}
          </button>
          <button
            id="export-report-btn"
            onClick={() => {
              if (results) downloadReport(files, results)
            }}
            disabled={!hasRun}
            className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
              hasRun
                ? 'border-[rgba(11,18,32,0.15)] bg-white text-[#0B1220] hover:bg-neutral-50 shadow-sm'
                : 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* ── Dev debug badges ── */}
      {IS_DEV && (
        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
          <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 border border-blue-200">
            operationalSources: {opFiles.length}
          </span>
          <span className="rounded bg-purple-100 px-2 py-0.5 text-purple-800 border border-purple-200">
            validationAssets: {valFiles.length}
          </span>
          <span className={`rounded px-2 py-0.5 border ${parsingInProgress ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
            parsingComplete: {String(!parsingInProgress)}
          </span>
          <span className={`rounded px-2 py-0.5 border ${canRunNow ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
            canRunReconciliation: {String(canRunNow)}
          </span>
          {!canRunNow && files.length > 0 && (
            <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 border border-red-200">
              reason: {canRunReason(files)}
            </span>
          )}
        </div>
      )}

      {/* ── Stepper ── */}
      <WorkflowStepper
        uploaded={files.length > 0}
        normalized={canRunNow}
        matched={hasRun}
        reviewed={false}
      />

      {/* ── Main grid ── */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <FileUploader />

          {/* Source Health */}
          <div className="rounded-2xl border border-[rgba(11,18,32,0.10)] bg-[#FFFFFF] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B6472]">Source Health</h3>

            {parsingInProgress && (
              <div className="mb-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Parsing files…
              </div>
            )}

            {opFiles.length === 0 ? (
              <div className="text-sm text-[#5B6472] flex items-center justify-center py-6 border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                {parsingInProgress ? 'Parsing in progress…' : 'No sources ingested.'}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {Object.entries(
                  opFiles.reduce((acc, f) => {
                    const key = f.archiveName || 'root'
                    if (!acc[key]) acc[key] = []
                    acc[key].push(f)
                    return acc
                  }, {} as Record<string, typeof files>)
                ).map(([archiveName, groupedFiles]) => (
                  <div key={archiveName} className="flex flex-col gap-3 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                    {archiveName !== 'root' && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#0B1220]">
                        <svg className="h-4 w-4 text-[#5B6472]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span className="truncate">{archiveName}</span>
                      </div>
                    )}
                    <div className={archiveName !== 'root' ? 'ml-5 flex flex-col gap-3 border-l-2 border-neutral-100 pl-4' : 'flex flex-col gap-3'}>
                      {groupedFiles.map(f => (
                        <div key={f.id} className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-neutral-50 transition-colors -mx-2 px-2">
                          <div className="flex justify-between items-center text-sm font-medium text-[#0B1220]">
                            <div className="flex items-center gap-2 truncate">
                              <SourceIcon type={f.sourceType} />
                              <span className="truncate">{f.name}</span>
                            </div>
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${
                              f.recordCount > 0
                                ? 'bg-blue-50 text-[#1D4ED8] border-blue-200'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                            }`}>
                              {f.status === 'parsing' || f.status === 'pending' ? '…' : f.recordCount.toLocaleString()} rows
                            </span>
                          </div>
                          <div className="flex justify-between items-center pl-6">
                            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#5B6472]">
                              {f.sourceType ?? 'unknown'}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {f.warnings.length > 0 && (
                                <div className="text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{f.warnings.length} warnings</div>
                              )}
                              {f.status === 'failed' && (
                                <div className="text-[11px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200" title={f.error}>Failed</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {excludedSheets.length > 0 && (
                  <div className="mt-2 text-xs font-medium text-amber-600 flex items-center gap-1.5 bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Excluded {excludedSheets.length} metadata sheet{excludedSheets.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {/* Validation Assets */}
            {valFiles.length > 0 && (
              <div className="mt-6 border-t border-neutral-100 pt-5">
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B6472]">Validation Assets</h3>
                <div className="flex flex-col gap-2">
                  {valFiles.map(f => (
                    <div key={f.id} className="flex justify-between items-center text-sm font-medium text-[#0B1220] p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <div className="flex items-center gap-2 truncate">
                        <svg className="w-4 h-4 text-[#5B6472]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="truncate">{f.name}</span>
                      </div>
                      <span className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-neutral-600 border border-neutral-200 shadow-sm">
                        {f.recordCount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Disbursable Breakdown */}
          <div className="rounded-2xl border border-[rgba(11,18,32,0.10)] bg-[#FFFFFF] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B6472]">Disbursable Breakdown</h3>
            {hasRun && results ? (
              <div className="flex flex-col gap-3 font-mono text-sm">
                <div className="flex justify-between text-[#0B1220] font-medium">
                  <span>Gross Settled</span>
                  <span>{fmt(results.disbursableBreakdown.grossSettled, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-[#5B6472]">
                  <span>- Fees</span>
                  <span>{fmt(results.disbursableBreakdown.fees, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-[#5B6472]">
                  <span>- Refunds</span>
                  <span>{fmt(results.disbursableBreakdown.refunds, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-[#5B6472]">
                  <span>- Chargebacks</span>
                  <span>{fmt(results.disbursableBreakdown.chargebacks, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-[#5B6472]">
                  <span>- Reserves</span>
                  <span>{fmt(results.disbursableBreakdown.reserves, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="flex justify-between text-amber-600 font-medium">
                  <span>- Unresolved Exposure</span>
                  <span>{fmt(results.disbursableBreakdown.unresolvedExposure, results.disbursableBreakdown.currency)}</span>
                </div>
                <div className="my-2 h-px bg-neutral-200" />
                <div className="flex justify-between text-lg font-bold text-[#1D4ED8]">
                  <span>= Payoutable</span>
                  <span>{fmt(results.disbursableBreakdown.payoutable, results.disbursableBreakdown.currency)}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#5B6472] flex items-center justify-center py-6 border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                Run reconciliation to calculate.
              </div>
            )}
          </div>
        </div>

        {/* Right column — metrics + cluster table */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-8">
            <MetricCard label="Match Rate" value={results ? results.matchRate.toFixed(1) + '%' : '—'} tone={results ? "blue" : "neutral"} />
            <MetricCard label="Matched" value={results ? results.metrics.matched.toLocaleString() : '—'} tone="green" />
            <MetricCard label="Partial" value={results ? results.metrics.partial.toLocaleString() : '—'} tone="amber" />
            <MetricCard label="Exceptions" value={results ? results.metrics.exceptions.toLocaleString() : '—'} tone={results && results.metrics.exceptions > 0 ? "red" : "neutral"} />
            <MetricCard label="Duplicate" value={results ? results.metrics.duplicates.toLocaleString() : '—'} tone={results && results.metrics.duplicates > 0 ? "orange" : "neutral"} />
            <MetricCard label="Ignored" value={results ? results.metrics.ignored.toLocaleString() : '—'} tone="neutral" />
            <MetricCard label="Validation" value={results ? results.metrics.validationAssets.toLocaleString() : '—'} tone="neutral" />
            <MetricCard label="Disbursable" value={results ? fmt(results.disbursableBreakdown.payoutable, 'USD') : '—'} tone={results ? "blue" : "neutral"} />
          </div>

          <div className="flex-1 rounded-2xl border border-[rgba(11,18,32,0.10)] bg-[#FFFFFF] shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col relative">
            {!hasRun || !results ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#5B6472] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center bg-white/80 p-8 rounded-2xl backdrop-blur-sm border border-neutral-100 shadow-sm"
                >
                  <motion.div
                    animate={isRunning ? { rotate: 360 } : { y: [0, -10, 0] }}
                    transition={isRunning
                      ? { duration: 1, repeat: Infinity, ease: 'linear' }
                      : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="mb-6 relative"
                  >
                    {isRunning ? (
                      <svg className="w-16 h-16 text-[#1D4ED8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    ) : (
                      <>
                        <svg className="w-16 h-16 text-[#DBEAFE]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                        <svg className="w-8 h-8 text-[#1D4ED8] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </>
                    )}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-[#0B1220] mb-2">
                    {isRunning ? 'Running reconciliation engine…' : 'No reconciliation run yet'}
                  </h3>
                  <p className="text-sm text-[#5B6472] text-center max-w-xs">
                    {isRunning
                      ? 'Matching transactions across sources. This may take a moment.'
                      : 'Upload your settlement sources on the left and run the engine to view matching clusters here.'}
                  </p>

                  {!isRunning && (
                    <div className="mt-8 flex flex-col gap-3 w-full max-w-sm opacity-40">
                      <div className="h-10 bg-neutral-100 rounded-lg w-full" />
                      <div className="h-10 bg-neutral-100 rounded-lg w-[90%]" />
                      <div className="h-10 bg-neutral-100 rounded-lg w-[95%]" />
                    </div>
                  )}
                </motion.div>
              </div>
            ) : (
              <div className="relative z-10 bg-white h-full">
                <ReconClusterTable results={results} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { MatchStatus, ReconciliationCluster } from '@/lib/types'

type Props = {
  cluster: ReconciliationCluster | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_COLORS: Record<MatchStatus, string> = {
  matched: 'bg-green-500/10 text-green-500 ring-green-500/20',
  partial: 'bg-green-500/10 text-green-500 ring-green-500/20',
  unmatched: 'bg-red-500/10 text-red-500 ring-red-500/20',
  duplicate: 'bg-amber-500/10 text-amber-500 ring-amber-500/20',
  timing_drift: 'bg-green-500/10 text-green-500 ring-green-500/20',
  reserve_hold: 'bg-red-500/10 text-red-500 ring-red-500/20',
  eligibility_hold: 'bg-red-500/10 text-red-500 ring-red-500/20',
  invalid: 'bg-neutral-500/10 text-neutral-500 ring-neutral-500/20',
}

const STATUS_LABELS: Record<MatchStatus, string> = {
  matched: 'Matched',
  partial: 'Partial Match',
  unmatched: 'Unmatched',
  duplicate: 'Duplicate',
  timing_drift: 'Timing Drift',
  reserve_hold: 'Reserve Hold',
  eligibility_hold: 'Eligibility Hold',
  invalid: 'Invalid',
}

const RISK_COLORS: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
}

function fmtMoney(amt: number, ccy: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy }).format(amt)
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null
  return (
    <div className="mb-3">
      <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xs text-neutral-300 font-mono break-all">{String(value)}</div>
    </div>
  )
}

export function ExceptionDrawer({ cluster, open, onOpenChange }: Props) {
  if (!cluster || !open) return null

  return (
    <>
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
      />

      <div className="fixed top-0 right-0 bottom-0 w-[480px] bg-neutral-950 border-l border-neutral-800 z-50 overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex justify-between items-start p-6 border-b border-neutral-800/50">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Reconciliation Cluster</div>
            <div className="text-base font-semibold text-white mt-1 font-mono">{cluster.canonicalReference}</div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded bg-neutral-900 px-2 py-1 text-neutral-400 hover:text-white transition"
          >
            ×
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex gap-4 items-center border-b border-neutral-800/50 pb-6">
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[cluster.status]}`}
            >
              {STATUS_LABELS[cluster.status]}
            </span>
            <span className="text-xs text-neutral-500">{cluster.confidence}% confidence</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800/50">
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Exposure</div>
              <div className="text-sm font-mono text-white">{fmtMoney(cluster.exposureAmount, cluster.transactions[0]?.currency || 'USD')}</div>
            </div>
            <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800/50">
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Operational Risk</div>
              <div className={`text-sm font-semibold uppercase ${RISK_COLORS[cluster.operationalRisk]}`}>{cluster.operationalRisk}</div>
            </div>
          </div>

          {(cluster.issues.length > 0 || cluster.matchReason) && (
            <div className="flex flex-col gap-4 border-b border-neutral-800/50 pb-6">
              {cluster.matchReason && (
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Match Reason</div>
                  <div className="text-xs text-green-400/90 leading-relaxed">{cluster.matchReason}</div>
                </div>
              )}
              {cluster.issues.length > 0 && (
                <div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Issues</div>
                  <ul className="text-xs text-red-400/90 leading-relaxed list-disc list-inside">
                    {cluster.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Audit Trail ({cluster.transactions.length} sources)</div>
            {cluster.transactions.map((txn, i) => (
              <div key={txn.id + i} className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="flex justify-between border-b border-neutral-800/50 pb-2 mb-3">
                  <span className="text-sm font-medium text-neutral-300">{txn.sourceFile}</span>
                  <span className="text-xs font-mono text-neutral-500">{fmtMoney(txn.amount, txn.currency)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Type" value={txn.type} />
                  <Field label="Date" value={txn.date} />
                  <Field label="Normalized Ref" value={txn.normalizedReference} />
                </div>
                
                {txn.normalizationWarnings.length > 0 && (
                  <div className="mt-2 text-[10px] text-amber-500/80 bg-amber-500/5 rounded p-2 border border-amber-500/10">
                    Warnings: {txn.normalizationWarnings.join(', ')}
                  </div>
                )}

                {Object.keys(txn.rawRow).length > 0 && (
                  <div className="mt-4">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Raw Metadata</div>
                    <div className="bg-neutral-950 rounded p-3 text-[10px] font-mono text-neutral-500 max-h-32 overflow-y-auto">
                      {Object.entries(txn.rawRow).map(([k, v]) => (
                        <div key={k} className="mb-1"><span className="text-blue-400/70">{k}</span>: {v}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
        
        <div className="p-4 border-t border-neutral-800/50 bg-neutral-900/30 flex justify-end gap-3 shrink-0">
          <button className="text-xs font-medium text-neutral-400 hover:text-white transition px-3 py-2">Hold Funds</button>
          <button className="text-xs font-medium text-neutral-400 hover:text-white transition px-3 py-2">Ignore</button>
          <button className="text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white transition rounded px-4 py-2">Mark Reviewed</button>
        </div>
      </div>
    </>
  )
}

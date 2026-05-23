'use client'

import { useState } from 'react'
import { CanonicalResults, MatchStatus, ReconciliationCluster, CanonicalTransaction, ParserWarning } from '@/lib/types'
import { ExceptionDrawer } from './exception-drawer'
import * as Accordion from '@radix-ui/react-accordion'

type TabValue = 'exceptions' | 'matched' | 'partial' | 'duplicates' | 'all' | 'warnings'

const STATUS_COLORS: Record<MatchStatus, string> = {
  matched: 'bg-green-500/10 text-green-500 ring-green-500/20',
  partial: 'bg-green-500/10 text-green-500 ring-green-500/20',
  unmatched: 'bg-red-500/10 text-red-500 ring-red-500/20',
  duplicate: 'bg-amber-500/10 text-amber-500 ring-amber-500/20',
  timing_drift: 'bg-green-500/10 text-green-500 ring-green-500/20',
  reserve_hold: 'bg-red-500/10 text-red-500 ring-red-500/20',
  eligibility_hold: 'bg-red-500/10 text-red-500 ring-red-500/20',
  invalid: 'bg-neutral-500/10 text-neutral-500 ring-neutral-500/20',
  ignored: 'bg-neutral-500/10 text-neutral-500 ring-neutral-500/20',
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
  ignored: 'Ignored',
}

function fmtMoney(amt: number, ccy: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy }).format(amt)
}

function ClusterRow({ cluster, onClick }: { cluster: ReconciliationCluster; onClick: () => void }) {
  return (
    <Accordion.Item value={cluster.clusterId} className="border-b border-neutral-800/50 overflow-hidden">
      <Accordion.Header className="flex">
        <Accordion.Trigger className="flex flex-1 items-center justify-between py-3 px-4 hover:bg-neutral-800/30 transition text-sm">
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <span className="font-mono text-neutral-300 w-48 shrink-0 truncate">{cluster.canonicalReference}</span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap shrink-0 ${STATUS_COLORS[cluster.status]}`}
            >
              {STATUS_LABELS[cluster.status]}
            </span>
            <span className="text-xs text-neutral-400 shrink-0">{cluster.confidence}% conf</span>
            <span className="text-xs text-neutral-400 shrink-0 border-l border-neutral-700 pl-4">{cluster.sourcesPresent.length} sources</span>
            {cluster.status === 'unmatched' || cluster.status === 'partial' || cluster.status === 'reserve_hold' || cluster.status === 'eligibility_hold' ? (
              cluster.failedRules && cluster.failedRules.length > 0 ? (
                <span className="text-xs text-red-500/80 shrink-0">
                  {cluster.failedRules.join(', ')}
                </span>
              ) : (
                cluster.missingSources.length > 0 ? (
                  <span className="text-xs text-amber-500/80 shrink-0">Missing: {cluster.missingSources.length}</span>
                ) : (
                  <span className="text-xs text-neutral-500 shrink-0">No candidate found</span>
                )
              )
            ) : null}
            <span className={`text-xs ml-4 shrink-0 px-2 py-0.5 rounded uppercase ${cluster.operationalRisk === 'high' ? 'bg-red-500/20 text-red-400' : cluster.operationalRisk === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>
              {cluster.operationalRisk} Risk
            </span>
          </div>
          <div className="flex items-center gap-6 shrink-0 pl-4">
            <span className="font-mono text-neutral-200">{fmtMoney(cluster.exposureAmount, cluster.transactions[0]?.currency || 'USD')}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              Review Details →
            </button>
          </div>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="bg-neutral-900/50 px-4 py-3 text-sm">
        <div className="flex flex-col gap-2">
          {cluster.transactions.map((txn, idx) => (
            <div key={txn.id + idx} className="flex justify-between items-center py-1 border-b border-neutral-800/50 last:border-0">
              <div className="flex flex-col">
                <span className="text-neutral-300">{txn.sourceFile}</span>
                <span className="text-xs text-neutral-500">{txn.type} · {txn.normalizedDate || txn.transactionDate}</span>
              </div>
              <span className="font-mono text-neutral-400">{fmtMoney(txn.amountOriginal || 0, txn.currency)}</span>
            </div>
          ))}
          {cluster.matchReason && <div className="mt-2 text-xs text-green-400">Match Reason: {cluster.matchReason}</div>}
          {cluster.issues.length > 0 && (
            <div className="mt-2 text-xs text-red-400/80">
              Issues: {cluster.issues.join(', ')}
            </div>
          )}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  )
}

export default function ReconClusterTable({ results }: { results: CanonicalResults }) {
  const [activeTab, setActiveTab] = useState<TabValue>('exceptions')
  const [selectedCluster, setSelectedCluster] = useState<ReconciliationCluster | null>(null)

  const TABS: { id: TabValue; label: string; count: number }[] = [
    { id: 'exceptions', label: 'Exceptions', count: results.metrics.exceptions },
    { id: 'matched', label: 'Matched', count: results.metrics.matched },
    { id: 'partial', label: 'Partial', count: results.metrics.partial },
    { id: 'duplicates', label: 'Duplicates', count: results.metrics.duplicates },
    { id: 'all', label: 'All Records', count: results.clusters.length },
    { id: 'warnings', label: 'Parser Warnings', count: results.parserWarnings.length },
  ]

  let visibleClusters = results.clusters;
  if (activeTab === 'exceptions') {
    visibleClusters = results.clusters.filter(c => !['matched', 'partial', 'timing_drift'].includes(c.status))
  } else if (activeTab === 'matched') {
    visibleClusters = results.clusters.filter(c => c.status === 'matched' || c.status === 'timing_drift')
  } else if (activeTab === 'partial') {
    visibleClusters = results.clusters.filter(c => c.status === 'partial')
  } else if (activeTab === 'duplicates') {
    visibleClusters = results.clusters.filter(c => c.status === 'duplicate')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-6 border-b border-neutral-800 px-4 pt-2 overflow-x-auto shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-white text-white'
                : 'border-b-2 border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label} <span className="ml-1 text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'warnings' ? (
          <div className="p-4">
            {results.parserWarnings.length === 0 ? (
              <div className="text-sm text-neutral-500">No parser warnings.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {results.parserWarnings.map((w, i) => (
                  <div key={i} className="rounded bg-amber-500/5 p-3 text-sm border border-amber-500/10">
                    <span className="font-semibold text-amber-500/80 mr-2">{w.sourceName}</span>
                    <span className="text-amber-500/60">{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="min-w-full">
            {visibleClusters.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-sm text-neutral-500">No records found for this view.</p>
              </div>
            ) : (
              <Accordion.Root type="multiple" className="w-full flex flex-col">
                {visibleClusters.map(cluster => (
                  <ClusterRow 
                    key={cluster.clusterId} 
                    cluster={cluster} 
                    onClick={() => setSelectedCluster(cluster)} 
                  />
                ))}
              </Accordion.Root>
            )}
          </div>
        )}
      </div>

      <ExceptionDrawer
        cluster={selectedCluster}
        open={!!selectedCluster}
        onOpenChange={(open) => !open && setSelectedCluster(null)}
      />
    </div>
  )
}

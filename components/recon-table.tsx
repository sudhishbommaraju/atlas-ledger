'use client'

import { useState } from 'react'
import { MatchResult } from '@/lib/types'
import ExceptionDrawer from './exception-drawer'
import { StatusBadge } from './ui-helpers'

type Props = {
  results: MatchResult[]
  parserWarnings: string[]
}

type TabType = 'exceptions' | 'matched' | 'all' | 'warnings'

function fmtAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function ReconTable({ results, parserWarnings }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('exceptions')
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null)

  const exceptionRows = results.filter((r) => 
    ['unmatched', 'duplicate', 'timing_drift', 'reserve_hold', 'invalid', 'eligibility_hold', 'partial'].includes(r.status)
  )
  const matchedRows = results.filter((r) => r.status === 'matched')

  const visibleRows = 
    activeTab === 'exceptions' ? exceptionRows :
    activeTab === 'matched' ? matchedRows :
    activeTab === 'all' ? results : []

  const tabs = [
    { id: 'exceptions', label: 'Exceptions', count: exceptionRows.length },
    { id: 'matched', label: 'Matched', count: matchedRows.length },
    { id: 'all', label: 'All Records', count: results.length },
    { id: 'warnings', label: 'Parser Warnings', count: parserWarnings.length },
  ] as const

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-4 border-b border-neutral-800 px-4 pt-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${
              activeTab === t.id
                ? 'border-neutral-300 text-neutral-200'
                : 'border-transparent text-neutral-500 hover:text-neutral-400'
            }`}
          >
            {t.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              activeTab === t.id ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-900 text-neutral-600'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'warnings' ? (
          <div className="p-4">
            {parserWarnings.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-500">No parser warnings.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {parserWarnings.map((w, i) => (
                  <div key={i} className="rounded border border-neutral-800 bg-neutral-900/50 p-3 text-sm text-amber-500/80">
                    {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-neutral-950/90 backdrop-blur z-10">
              <tr className="border-b border-neutral-800">
                <th className="px-4 py-3 font-medium text-neutral-500">Source</th>
                <th className="px-4 py-3 font-medium text-neutral-500">Reference</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-500">Amount</th>
                <th className="px-4 py-3 font-medium text-neutral-500">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-500">Reason / Issue</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    No records in this category.
                  </td>
                </tr>
              )}
              {visibleRows.map((r, idx) => (
                <tr
                  key={r.record.id + idx}
                  onClick={() => setSelectedResult(r)}
                  className="cursor-pointer border-b border-neutral-800/50 hover:bg-neutral-900/50 transition"
                >
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    <div className="max-w-[150px] truncate">{r.record.source}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-300">
                    {r.record.reference}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-neutral-200">
                    {fmtAmount(r.record.amount, r.record.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    <div className="max-w-[300px] truncate">
                      {r.matchReason || r.issue || '—'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ExceptionDrawer result={selectedResult} onClose={() => setSelectedResult(null)} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { MatchResult, MatchStatus } from '@/lib/types'
import ExceptionDrawer from './exception-drawer'

type Props = {
  results: MatchResult[]
}

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; bg: string }> = {
  matched:          { label: 'Matched',          color: '#86efac', bg: '#052e16' },
  partial:          { label: 'Partial',           color: '#fde68a', bg: '#1c1400' },
  unmatched:        { label: 'Unmatched',         color: '#fca5a5', bg: '#2a0000' },
  duplicate:        { label: 'Duplicate',         color: '#c4b5fd', bg: '#1a0a2a' },
  timing_drift:     { label: 'Timing Drift',      color: '#93c5fd', bg: '#0a1a2a' },
  eligibility_hold: { label: 'Eligibility Hold',  color: '#fca5a5', bg: '#2a0a00' },
}

const TABS: { status: MatchStatus | 'all'; label: string }[] = [
  { status: 'all',              label: 'All' },
  { status: 'matched',          label: 'Matched' },
  { status: 'partial',          label: 'Partial' },
  { status: 'unmatched',        label: 'Unmatched' },
  { status: 'duplicate',        label: 'Duplicate' },
  { status: 'timing_drift',     label: 'Timing Drift' },
  { status: 'eligibility_hold', label: 'Hold' },
]

function fmtAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function ReconTable({ results }: Props) {
  const [activeTab, setActiveTab] = useState<MatchStatus | 'all'>('all')
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null)

  const filtered = activeTab === 'all' ? results : results.filter((r) => r.status === activeTab)

  const tabCounts = TABS.map((t) => ({
    ...t,
    count: t.status === 'all' ? results.length : results.filter((r) => r.status === t.status).length,
  })).filter((t) => t.count > 0 || t.status === 'all')

  return (
    <>
      {/* Tab filter */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 12, flexWrap: 'wrap' }}>
        {tabCounts.map((t) => (
          <button
            key={t.status}
            onClick={() => setActiveTab(t.status)}
            style={{
              padding: '4px 12px',
              background: activeTab === t.status ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === t.status ? 'var(--text-primary)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: activeTab === t.status ? 'var(--border-default)' : 'transparent',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontSize: 11 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflow: 'auto', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
        <table style={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th>Source</th>
              <th>Reference</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Conf.</th>
              <th>Issue</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
                  No records in this category.
                </td>
              </tr>
            )}
            {filtered.map((r) => {
              const cfg = STATUS_CONFIG[r.status]
              return (
                <tr
                  key={r.record.id}
                  onClick={() => setSelectedResult(r)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ color: 'var(--text-muted)', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.record.source}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>
                    {r.record.reference}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.record.description || '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono), monospace', fontSize: 12 }}>
                    {fmtAmount(r.record.amount, r.record.currency)}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        padding: '2px 7px',
                        borderRadius: 10,
                        color: cfg.color,
                        background: cfg.bg,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {r.confidence}%
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.issue || '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ExceptionDrawer result={selectedResult} onClose={() => setSelectedResult(null)} />
    </>
  )
}

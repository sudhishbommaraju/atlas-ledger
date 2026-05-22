'use client'

import { MatchResult } from '@/lib/types'

type Props = {
  result: MatchResult | null
  onClose: () => void
}

const STATUS_LABELS: Record<string, string> = {
  matched: 'Matched',
  partial: 'Partial Match',
  unmatched: 'Unmatched',
  duplicate: 'Duplicate',
  timing_drift: 'Timing Drift',
  eligibility_hold: 'Eligibility Hold',
}

const STATUS_COLORS: Record<string, string> = {
  matched: '#86efac',
  partial: '#fde68a',
  unmatched: '#fca5a5',
  duplicate: '#c4b5fd',
  timing_drift: '#93c5fd',
  eligibility_hold: '#fca5a5',
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono), monospace', wordBreak: 'break-all' }}>
        {String(value)}
      </div>
    </div>
  )
}

export default function ExceptionDrawer({ result, onClose }: Props) {
  if (!result) return null

  const { record, matchedRecord, status, confidence, issue, matchReason, recommendedAction } = result

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 400,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          zIndex: 50,
          overflow: 'auto',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Transaction Detail
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              {record.reference}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              fontSize: 13,
            }}
          >
            ×
          </button>
        </div>

        {/* Status badge */}
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 10,
              color: STATUS_COLORS[status] || '#888',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${STATUS_COLORS[status] || '#555'}40`,
            }}
          >
            {STATUS_LABELS[status] || status}
          </span>
          <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--text-muted)' }}>
            {confidence}% confidence
          </span>
        </div>

        <div style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: 16, paddingBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Source Record
          </div>
          <Field label="Source File" value={record.source} />
          <Field label="Reference" value={record.reference} />
          <Field label="Amount" value={`${record.amount.toFixed(2)} ${record.currency}`} />
          <Field label="Date" value={record.date} />
          <Field label="Type" value={record.type} />
          <Field label="Description" value={record.description} />
        </div>

        {matchedRecord && (
          <div style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: 16, paddingBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Matched Record
            </div>
            <Field label="Source File" value={matchedRecord.source} />
            <Field label="Reference" value={matchedRecord.reference} />
            <Field label="Amount" value={`${matchedRecord.amount.toFixed(2)} ${matchedRecord.currency}`} />
            <Field label="Date" value={matchedRecord.date} />
            <Field label="Type" value={matchedRecord.type} />
          </div>
        )}

        {matchReason && (
          <div style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: 16, paddingBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Match Reason
            </div>
            <div style={{ fontSize: 12, color: '#86efac' }}>{matchReason}</div>
          </div>
        )}

        {issue && (
          <div style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: 16, paddingBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Issue
            </div>
            <div style={{ fontSize: 12, color: '#fca5a5' }}>{issue}</div>
          </div>
        )}

        {recommendedAction && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Recommended Action
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{recommendedAction}</div>
          </div>
        )}

        {Object.keys(record.raw).length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Raw Fields
            </div>
            <div
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 4,
                padding: 12,
                fontSize: 11,
                fontFamily: 'var(--font-mono), monospace',
                color: 'var(--text-muted)',
                wordBreak: 'break-all',
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              {Object.entries(record.raw).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 2 }}>
                  <span style={{ color: '#4a7fc1' }}>{k}</span>: {v}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

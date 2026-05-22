'use client'

import { DisbursableFunds } from '@/lib/types'

type Props = {
  disbursable: DisbursableFunds
  showPartials?: boolean
  onTogglePartials?: (v: boolean) => void
}

function fmtCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function Row({
  label,
  amount,
  currency,
  isDeduction = false,
  isTotal = false,
}: {
  label: string
  amount: number
  currency: string
  isDeduction?: boolean
  isTotal?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isTotal ? '12px 0 0' : '8px 0',
        borderTop: isTotal ? '1px solid var(--border-default)' : undefined,
        marginTop: isTotal ? 4 : 0,
      }}
    >
      <span
        style={{
          fontSize: isTotal ? 13 : 12,
          color: isTotal ? 'var(--text-primary)' : isDeduction ? 'var(--text-secondary)' : 'var(--text-primary)',
          fontWeight: isTotal ? 600 : 400,
        }}
      >
        {isDeduction && <span style={{ marginRight: 4, color: 'var(--text-muted)' }}>−</span>}
        {label}
      </span>
      <span
        style={{
          fontSize: isTotal ? 15 : 12,
          fontFamily: 'var(--font-mono), monospace',
          color: isTotal
            ? amount > 0 ? '#86efac' : 'var(--text-primary)'
            : isDeduction
            ? '#fca5a5'
            : 'var(--text-primary)',
          fontWeight: isTotal ? 700 : 400,
          letterSpacing: '-0.01em',
        }}
      >
        {isDeduction ? `-${fmtCurrency(amount, currency)}` : fmtCurrency(amount, currency)}
      </span>
    </div>
  )
}

export default function DisbursablePanel({ disbursable, showPartials, onTogglePartials }: Props) {
  const { grossSettled, fees, refunds, chargebacks, reserves, unresolved, available, currency } = disbursable

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Disbursable Funds
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Net available after deductions
          </div>
        </div>
        {onTogglePartials !== undefined && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={showPartials}
              onChange={(e) => onTogglePartials(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            Include partial matches
          </label>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
        <Row label="Gross Settled" amount={grossSettled} currency={currency} />
        {fees > 0 && <Row label="Fees" amount={fees} currency={currency} isDeduction />}
        {refunds > 0 && <Row label="Refunds" amount={refunds} currency={currency} isDeduction />}
        {chargebacks > 0 && <Row label="Chargebacks" amount={chargebacks} currency={currency} isDeduction />}
        {reserves > 0 && <Row label="Reserves" amount={reserves} currency={currency} isDeduction />}
        {unresolved > 0 && <Row label="Unresolved Exceptions" amount={unresolved} currency={currency} isDeduction />}
        <Row label="Available Disbursable" amount={available} currency={currency} isTotal />
      </div>
    </div>
  )
}

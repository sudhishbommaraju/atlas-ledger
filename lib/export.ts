import { DisbursableFunds, MatchResult, UploadedFile } from './types'

function escapeCSV(val: string | number): string {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function row(...cells: (string | number)[]): string {
  return cells.map(escapeCSV).join(',')
}

export function generateReport(
  files: UploadedFile[],
  matchResults: MatchResult[],
  disbursable: DisbursableFunds
): string {
  const lines: string[] = []
  const now = new Date().toISOString()

  lines.push(`Atlas Ledger Reconciliation Report`)
  lines.push(`Generated: ${now}`)
  lines.push('')

  // Section: Files
  lines.push('SECTION: FILES')
  lines.push(row('filename', 'extension', 'records', 'status', 'warnings'))
  for (const f of files) {
    lines.push(row(f.name, f.extension, f.recordCount, f.status, f.warnings.join('; ')))
  }
  lines.push('')

  // Section: Reconciliation Summary
  const total = matchResults.length
  const matched = matchResults.filter((r) => r.status === 'matched').length
  const partial = matchResults.filter((r) => r.status === 'partial').length
  const unmatched = matchResults.filter((r) => r.status === 'unmatched').length
  const duplicate = matchResults.filter((r) => r.status === 'duplicate').length
  const timingDrift = matchResults.filter((r) => r.status === 'timing_drift').length
  const eligibilityHold = matchResults.filter((r) => r.status === 'eligibility_hold').length
  const matchRate = total > 0 ? ((matched / total) * 100).toFixed(1) : '0.0'

  lines.push('SECTION: RECONCILIATION SUMMARY')
  lines.push(row('metric', 'value'))
  lines.push(row('total_records', total))
  lines.push(row('matched', matched))
  lines.push(row('partial', partial))
  lines.push(row('unmatched', unmatched))
  lines.push(row('duplicate', duplicate))
  lines.push(row('timing_drift', timingDrift))
  lines.push(row('eligibility_hold', eligibilityHold))
  lines.push(row('match_rate_pct', matchRate))
  lines.push('')

  // Section: Exceptions
  const exceptions = matchResults.filter((r) => r.status !== 'matched')
  lines.push('SECTION: EXCEPTIONS')
  lines.push(row('reference', 'source', 'amount', 'currency', 'status', 'confidence', 'issue', 'recommended_action'))
  for (const ex of exceptions) {
    lines.push(row(
      ex.record.reference,
      ex.record.source,
      ex.record.amount,
      ex.record.currency,
      ex.status,
      ex.confidence,
      ex.issue || '',
      ex.recommendedAction || ''
    ))
  }
  lines.push('')

  // Section: Disbursable Funds
  const fmt = (n: number) => n.toFixed(2)
  lines.push('SECTION: DISBURSABLE FUNDS')
  lines.push(row('line_item', 'amount', 'currency'))
  lines.push(row('gross_settled', fmt(disbursable.grossSettled), disbursable.currency))
  lines.push(row('fees', `-${fmt(disbursable.fees)}`, disbursable.currency))
  lines.push(row('refunds', `-${fmt(disbursable.refunds)}`, disbursable.currency))
  lines.push(row('chargebacks', `-${fmt(disbursable.chargebacks)}`, disbursable.currency))
  lines.push(row('reserves', `-${fmt(disbursable.reserves)}`, disbursable.currency))
  lines.push(row('unresolved_exceptions', `-${fmt(disbursable.unresolved)}`, disbursable.currency))
  lines.push(row('available_disbursable', fmt(disbursable.available), disbursable.currency))

  return lines.join('\n')
}

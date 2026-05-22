import { DisbursableFunds, MatchResult, MatchStatus, ParsedRecord } from './types'

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime()
  const db = new Date(b).getTime()
  if (isNaN(da) || isNaN(db)) return 0
  return Math.abs((da - db) / 86400000)
}

const ISSUE_MESSAGES: Record<MatchStatus, string> = {
  matched: '',
  partial: 'Amount mismatch — likely fee or reserve deduction',
  unmatched: 'No corresponding record found across uploaded sources',
  duplicate: 'Transaction reference appears more than once',
  timing_drift: 'Settlement date differs by more than 3 days from expected',
  eligibility_hold: 'Payout blocked — chargeback, refund, or reserve risk detected',
}

const ACTIONS: Record<MatchStatus, string> = {
  matched: '',
  partial: 'Verify fee deductions and net settlement amounts with PSP statement',
  unmatched: 'Investigate with PSP or bank — request missing settlement confirmation',
  duplicate: 'Review source files for duplicate exports; de-duplicate before processing',
  timing_drift: 'Confirm settlement cut-off with bank; may require T+1 reprocessing',
  eligibility_hold: 'Hold disbursement until chargeback/refund resolution is confirmed',
}

export function runReconciliation(allRecords: ParsedRecord[]): MatchResult[] {
  if (allRecords.length === 0) return []

  // Group by reference
  const byRef = new Map<string, ParsedRecord[]>()
  for (const r of allRecords) {
    const key = r.reference.trim().toLowerCase()
    if (!byRef.has(key)) byRef.set(key, [])
    byRef.get(key)!.push(r)
  }

  const results: MatchResult[] = []

  for (const [, group] of byRef) {
    const settlements = group.filter((r) => r.type === 'settlement' || (r.type === 'unknown' && r.amount > 0))
    const nonSettlements = group.filter((r) => !settlements.includes(r))
    const hasFee = nonSettlements.some((r) => r.type === 'fee')
    const hasRefund = nonSettlements.some((r) => r.type === 'refund')
    const hasChargeback = nonSettlements.some((r) => r.type === 'chargeback')
    const hasReserve = nonSettlements.some((r) => r.type === 'reserve')

    if (settlements.length === 0) {
      // Non-settlement records without a settlement counterpart
      for (const r of nonSettlements) {
        results.push({
          record: r,
          status: 'unmatched',
          confidence: 0,
          issue: ISSUE_MESSAGES.unmatched,
          recommendedAction: ACTIONS.unmatched,
        })
      }
      continue
    }

    // Detect duplicates within the settlement group
    if (settlements.length > 1) {
      for (const r of settlements) {
        results.push({
          record: r,
          status: 'duplicate',
          confidence: 60,
          issue: ISSUE_MESSAGES.duplicate,
          recommendedAction: ACTIONS.duplicate,
        })
      }
      continue
    }

    const primary = settlements[0]
    const match = nonSettlements.find((r) => r.type !== 'unknown')

    // Eligibility hold
    if (hasChargeback || (hasRefund && hasReserve)) {
      results.push({
        record: primary,
        status: 'eligibility_hold',
        confidence: 50,
        matchedRecord: match,
        issue: ISSUE_MESSAGES.eligibility_hold,
        recommendedAction: ACTIONS.eligibility_hold,
      })
      continue
    }

    if (match) {
      const amtDiff = Math.abs(primary.amount - Math.abs(match.amount))
      const pctDiff = primary.amount !== 0 ? amtDiff / Math.abs(primary.amount) : 0
      const drift = daysBetween(primary.date, match.date)

      if (drift > 3) {
        results.push({
          record: primary,
          status: 'timing_drift',
          confidence: 70,
          matchedRecord: match,
          issue: ISSUE_MESSAGES.timing_drift,
          recommendedAction: ACTIONS.timing_drift,
        })
        continue
      }

      if (amtDiff < 0.02 || (pctDiff <= 0.10 && (hasFee || hasRefund || hasReserve))) {
        results.push({
          record: primary,
          status: amtDiff < 0.02 ? 'matched' : 'partial',
          confidence: amtDiff < 0.02 ? 100 : 75,
          matchedRecord: match,
          issue: amtDiff < 0.02 ? '' : ISSUE_MESSAGES.partial,
          recommendedAction: amtDiff < 0.02 ? '' : ACTIONS.partial,
        })
        continue
      }

      // Amount differs significantly without obvious explanation
      results.push({
        record: primary,
        status: 'partial',
        confidence: 60,
        matchedRecord: match,
        issue: `Amount discrepancy of ${amtDiff.toFixed(2)} (${(pctDiff * 100).toFixed(1)}%)`,
        recommendedAction: ACTIONS.partial,
      })
    } else {
      results.push({
        record: primary,
        status: 'unmatched',
        confidence: 0,
        issue: ISSUE_MESSAGES.unmatched,
        recommendedAction: ACTIONS.unmatched,
      })
    }
  }

  return results.sort((a, b) => {
    const order: MatchStatus[] = ['eligibility_hold', 'unmatched', 'duplicate', 'timing_drift', 'partial', 'matched']
    return order.indexOf(a.status) - order.indexOf(b.status)
  })
}

export function calcDisbursable(records: ParsedRecord[], matchResults: MatchResult[]): DisbursableFunds {
  const settlements = records.filter((r) => r.type === 'settlement')
  const grossSettled = settlements.reduce((s, r) => s + Math.max(r.amount, 0), 0)

  const fees = records
    .filter((r) => r.type === 'fee')
    .reduce((s, r) => s + Math.abs(r.amount), 0)

  const refunds = records
    .filter((r) => r.type === 'refund')
    .reduce((s, r) => s + Math.abs(r.amount), 0)

  const chargebacks = records
    .filter((r) => r.type === 'chargeback')
    .reduce((s, r) => s + Math.abs(r.amount), 0)

  const reserves = records
    .filter((r) => r.type === 'reserve')
    .reduce((s, r) => s + Math.abs(r.amount), 0)

  const unresolved = matchResults
    .filter((mr) => mr.status === 'unmatched' || mr.status === 'partial' || mr.status === 'eligibility_hold')
    .reduce((s, mr) => s + Math.abs(mr.record.amount), 0)

  const available = Math.max(0, grossSettled - fees - refunds - chargebacks - reserves - unresolved)

  const currencies = [...new Set(records.map((r) => r.currency).filter(Boolean))]
  const currency = currencies.length === 1 ? currencies[0] : 'USD'

  return { grossSettled, fees, refunds, chargebacks, reserves, unresolved, available, currency }
}

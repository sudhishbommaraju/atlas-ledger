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
  invalid: 'Invalid or incomplete record data',
}

const ACTIONS: Record<MatchStatus, string> = {
  matched: '',
  partial: 'Verify fee deductions and net settlement amounts with PSP statement',
  unmatched: 'Investigate with PSP or bank — request missing settlement confirmation',
  duplicate: 'Review source files for duplicate exports; de-duplicate before processing',
  timing_drift: 'Confirm settlement cut-off with bank; may require T+1 reprocessing',
  eligibility_hold: 'Hold disbursement until chargeback/refund resolution is confirmed',
  invalid: 'Exclude from reconciliation engine',
}

export function runReconciliation(allRecords: ParsedRecord[]): MatchResult[] {
  // Exclude metadata and invalid rows
  const records = allRecords.filter(r => 
    r.valid &&
    !r.source.toLowerCase().includes('expected output') && 
    !r.source.toLowerCase().includes('validation summary') &&
    !r.source.toLowerCase().includes('readme')
  );

  if (records.length === 0) return []

  // Group by reference
  const byRef = new Map<string, ParsedRecord[]>()
  for (const r of records) {
    const key = r.reference.trim().toLowerCase()
    if (!byRef.has(key)) byRef.set(key, [])
    byRef.get(key)!.push(r)
  }

  const results: MatchResult[] = []

  for (const [, group] of byRef) {
    // 1. Check for True Duplicates (same reference, same source)
    const bySource = new Map<string, ParsedRecord[]>()
    for (const r of group) {
      const sourceKey = r.source.toLowerCase()
      if (!bySource.has(sourceKey)) bySource.set(sourceKey, [])
      bySource.get(sourceKey)!.push(r)
    }

    let hasDuplicates = false;
    for (const [source, sourceRecords] of bySource) {
      if (sourceRecords.length > 1) {
        hasDuplicates = true;
        for (const r of sourceRecords) {
          results.push({
            record: r,
            status: 'duplicate',
            confidence: 60,
            issue: 'Duplicate reference within the same source',
            recommendedAction: ACTIONS.duplicate,
          })
        }
      }
    }

    if (hasDuplicates) continue; // Skip reconciliation for this reference group if it contains raw duplicates

    const settlements = group.filter((r) => r.type === 'settlement' || (r.type === 'unknown' && r.amount > 0) || r.source.toLowerCase().includes('ledger'))
    const nonSettlements = group.filter((r) => !settlements.includes(r))
    
    // If there is only 1 record total across all sources, it is unmatched.
    if (group.length === 1) {
       results.push({
         record: group[0],
         status: 'unmatched',
         confidence: 0,
         issue: 'No corresponding record found across uploaded sources',
         recommendedAction: ACTIONS.unmatched,
       })
       continue;
    }

    const sortedGroup = [...group].sort((a, b) => a.source.toLowerCase().includes('ledger') ? -1 : 1);
    const primary = sortedGroup[0];
    const matchCandidates = sortedGroup.slice(1);
    
    const hasFee = nonSettlements.some((r) => r.type === 'fee')
    const hasRefund = nonSettlements.some((r) => r.type === 'refund')
    const hasChargeback = nonSettlements.some((r) => r.type === 'chargeback')
    const hasReserve = nonSettlements.some((r) => r.type === 'reserve')

    if (hasChargeback || (hasRefund && hasReserve)) {
      results.push({
        record: primary,
        status: 'eligibility_hold',
        confidence: 50,
        matchedRecord: matchCandidates[0],
        issue: ISSUE_MESSAGES.eligibility_hold,
        recommendedAction: ACTIONS.eligibility_hold,
      })
      continue
    }

    let bestMatch = matchCandidates[0];
    let bestStatus: MatchStatus = 'unmatched';
    let bestConfidence = 0;
    let bestIssue = '';
    let bestReason = '';

    for (const match of matchCandidates) {
      const amtDiff = Math.abs(Math.abs(primary.amount) - Math.abs(match.amount))
      const pctDiff = primary.amount !== 0 ? amtDiff / Math.abs(primary.amount) : 0
      const drift = daysBetween(primary.date, match.date)

      let status: MatchStatus = 'unmatched';
      let confidence = 0;
      let issue = '';
      let reason = '';

      if (amtDiff < 0.02) {
        status = drift > 3 ? 'timing_drift' : 'matched';
        confidence = drift > 3 ? 70 : 99;
        issue = drift > 3 ? ISSUE_MESSAGES.timing_drift : '';
        reason = drift > 3 ? "Reference and amount matched with settlement date drift" : "Exact reference, amount, and currency match across sources";
      } else if (pctDiff <= 0.10 && (hasFee || hasRefund || hasReserve || match.type === 'unknown' || match.type === 'settlement')) {
        status = 'partial';
        confidence = 95;
        issue = ISSUE_MESSAGES.partial;
        reason = "Reference matched after fee adjustment";
      } else {
        status = 'partial';
        confidence = 60;
        issue = `Amount discrepancy of ${amtDiff.toFixed(2)} (${(pctDiff * 100).toFixed(1)}%)`;
      }

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestStatus = status;
        bestMatch = match;
        bestIssue = issue;
        bestReason = reason;
      }
    }

    results.push({
      record: primary,
      status: bestStatus,
      confidence: bestConfidence,
      matchedRecord: bestMatch,
      issue: bestIssue,
      matchReason: bestReason,
      recommendedAction: ACTIONS[bestStatus] || '',
    })
  }

  return results.sort((a, b) => {
    const order: MatchStatus[] = ['eligibility_hold', 'unmatched', 'duplicate', 'timing_drift', 'partial', 'matched', 'invalid']
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

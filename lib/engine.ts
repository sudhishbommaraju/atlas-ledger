import { CanonicalResults, CanonicalTransaction, DisbursableBreakdown, ExcludedSheet, MatchStatus, OperationalRisk, ParsedRecord, ParserWarning, ReconciliationCluster } from './types'

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime()
  const db = new Date(b).getTime()
  if (isNaN(da) || isNaN(db)) return 0
  return Math.abs((da - db) / 86400000)
}

function calculateRisk(exposure: number, isChargebackOrRefund: boolean): OperationalRisk {
  if (isChargebackOrRefund || exposure > 10000) return 'high'
  if (exposure > 1000) return 'medium'
  return 'low'
}

function mapToCanonical(r: ParsedRecord): CanonicalTransaction {
  return {
    id: r.id,
    sourceFile: r.source,
    sourceSheet: r.source, // Map to sheet logic if needed
    sourceRowNumber: 0, // Fallback if row num not recorded
    normalizedReference: r.reference,
    settlementBatchId: r.settlementBatchId,
    amount: r.amount,
    currency: r.currency,
    date: r.date,
    type: r.type,
    rawRow: r.raw,
    normalizationWarnings: r.normalizationWarnings,
  }
}

function canonicalReference(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-]/g, "_")
    .replace(/_+/g, "_");
}

export function buildCanonicalResults(
  allRecords: ParsedRecord[],
  parserWarnings: ParserWarning[],
  excludedSheets: ExcludedSheet[],
  runId: string
): CanonicalResults {
  const records = allRecords.filter(r => r.valid)

  if (records.length === 0) {
    return {
      runId,
      generatedAt: new Date().toISOString(),
      clusters: [],
      disbursableBreakdown: { grossSettled: 0, fees: 0, refunds: 0, chargebacks: 0, reserves: 0, unresolvedExposure: 0, payoutable: 0, currency: 'USD' },
      parserWarnings,
      excludedSheets,
      matchRate: 0,
      metrics: { matched: 0, partial: 0, timingDrift: 0, unmatched: 0, duplicates: 0, reserveHolds: 0, exceptions: 0 }
    }
  }

  const clusters: ReconciliationCluster[] = []
  
  // Group by Canonical Reference
  const byRef = new Map<string, ParsedRecord[]>()
  for (const r of records) {
    const key = canonicalReference(r.reference)
    if (!byRef.has(key)) byRef.set(key, [])
    byRef.get(key)!.push(r)
  }

  // All known sources for determining missing sources
  const allKnownSources = Array.from(new Set(records.map(r => r.source)))

  for (const [refKey, group] of byRef) {
    // Detect duplicates (same reference within the SAME source)
    const bySource = new Map<string, ParsedRecord[]>()
    for (const r of group) {
      const sourceKey = r.source
      if (!bySource.has(sourceKey)) bySource.set(sourceKey, [])
      bySource.get(sourceKey)!.push(r)
    }

    const dedupedGroup: ParsedRecord[] = []
    
    for (const [source, sourceRecords] of bySource) {
      if (sourceRecords.length > 1) {
        // Repeated reference in SAME source = duplicate cluster
        const exposureAmount = sourceRecords.reduce((s, r) => s + Math.abs(r.amount), 0)
        clusters.push({
          clusterId: `cluster-dup-${refKey}-${source}`,
          canonicalReference: refKey,
          status: 'duplicate',
          confidence: 100,
          transactions: sourceRecords.map(mapToCanonical),
          sourcesPresent: [source],
          missingSources: allKnownSources.filter(s => s !== source),
          exposureAmount,
          operationalRisk: 'medium',
          payoutImpact: 0,
          matchReason: '',
          issues: ["Duplicate reference detected within the same source file"],
        })
      } else {
        // If not a duplicate within this source, keep it for cross-source matching
        dedupedGroup.push(sourceRecords[0])
      }
    }

    if (dedupedGroup.length === 0) continue; // All records were duplicates within their sources

    const transactions = dedupedGroup.map(mapToCanonical)
    const exposureAmount = dedupedGroup.reduce((s, r) => Math.max(s, Math.abs(r.amount)), 0)
    const sourcesPresent = dedupedGroup.map(r => r.source)
    const missingSources = allKnownSources.filter(s => !sourcesPresent.includes(s))

    if (dedupedGroup.length === 1) {
      clusters.push({
        clusterId: `cluster-unm-${refKey}`,
        canonicalReference: refKey,
        status: 'unmatched',
        confidence: 0,
        transactions,
        sourcesPresent,
        missingSources,
        exposureAmount,
        operationalRisk: calculateRisk(exposureAmount, false),
        payoutImpact: exposureAmount,
        matchReason: '',
        issues: ['No corresponding record found across other uploaded sources'],
      })
      continue;
    }

    const settlements = dedupedGroup.filter((r) => r.type === 'settlement' || (r.type === 'unknown' && r.amount > 0) || r.source.toLowerCase().includes('ledger'))
    const nonSettlements = dedupedGroup.filter((r) => !settlements.includes(r))

    const hasFee = nonSettlements.some((r) => r.type === 'fee')
    const hasRefund = nonSettlements.some((r) => r.type === 'refund')
    const hasChargeback = nonSettlements.some((r) => r.type === 'chargeback')
    const hasReserve = nonSettlements.some((r) => r.type === 'reserve')
    
    if (hasChargeback || (hasRefund && hasReserve)) {
      clusters.push({
        clusterId: `cluster-hld-${refKey}`,
        canonicalReference: refKey,
        status: 'eligibility_hold',
        confidence: 50,
        transactions,
        sourcesPresent,
        missingSources,
        exposureAmount,
        operationalRisk: 'high',
        payoutImpact: exposureAmount,
        matchReason: '',
        issues: ['Payout blocked — chargeback, refund, or reserve risk detected'],
      })
      continue;
    }

    const sortedGroup = [...dedupedGroup].sort((a, b) => a.source.toLowerCase().includes('ledger') ? -1 : 1);
    const primary = sortedGroup[0];
    const matchCandidates = sortedGroup.slice(1);

    let bestStatus: MatchStatus = 'unmatched';
    let bestConfidence = 0;
    let bestIssues: string[] = [];
    let bestReason = '';

    for (const match of matchCandidates) {
      const amtDiff = Math.abs(Math.abs(primary.amount) - Math.abs(match.amount))
      const pctDiff = primary.amount !== 0 ? amtDiff / Math.abs(primary.amount) : 0
      const drift = daysBetween(primary.date, match.date)

      let status: MatchStatus = 'unmatched';
      let confidence = 0;
      let issues: string[] = [];
      let reason = '';

      if (amtDiff < 0.02) {
        status = drift > 3 ? 'timing_drift' : 'matched';
        confidence = drift > 3 ? 92 : 99;
        if (drift > 3) issues.push('Settlement date differs by more than 3 days from expected');
        reason = drift > 3 ? "Matched with settlement timing drift" : "Exact reference, amount, and currency match";
      } else if (pctDiff <= 0.10 && (hasFee || hasRefund || hasReserve || match.type === 'unknown' || match.type === 'settlement')) {
        status = 'partial';
        confidence = 95;
        issues.push('Amount mismatch — likely fee or reserve deduction');
        reason = "Matched after settlement fee adjustment";
      } else {
        status = 'partial';
        confidence = 60;
        issues.push(`Amount discrepancy of ${amtDiff.toFixed(2)} (${(pctDiff * 100).toFixed(1)}%)`);
      }

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestStatus = status;
        bestIssues = issues;
        bestReason = reason;
      }
    }

    clusters.push({
      clusterId: `cluster-mat-${refKey}`,
      canonicalReference: refKey,
      status: bestStatus,
      confidence: bestConfidence,
      transactions,
      sourcesPresent,
      missingSources,
      exposureAmount,
      operationalRisk: calculateRisk(exposureAmount, false),
      payoutImpact: bestStatus === 'partial' || bestStatus === 'timing_drift' ? exposureAmount : 0,
      matchReason: bestReason,
      issues: bestIssues,
    })
  }

  // Calculate Disbursable
  const settlements = records.filter((r) => r.type === 'settlement')
  const grossSettled = settlements.reduce((s, r) => s + Math.max(r.amount, 0), 0)

  const fees = records.filter((r) => r.type === 'fee').reduce((s, r) => s + Math.abs(r.amount), 0)
  const refunds = records.filter((r) => r.type === 'refund').reduce((s, r) => s + Math.abs(r.amount), 0)
  const chargebacks = records.filter((r) => r.type === 'chargeback').reduce((s, r) => s + Math.abs(r.amount), 0)
  const reserves = records.filter((r) => r.type === 'reserve').reduce((s, r) => s + Math.abs(r.amount), 0)

  // Unresolved exposure from clusters
  const unresolvedExposure = clusters
    .filter((c) => c.status === 'unmatched' || c.status === 'partial' || c.status === 'eligibility_hold')
    .reduce((s, c) => s + c.exposureAmount, 0)

  const payoutable = Math.max(0, grossSettled - fees - refunds - chargebacks - reserves - unresolvedExposure)

  const currencies = [...new Set(records.map((r) => r.currency).filter(Boolean))]
  const currency = currencies.length === 1 ? currencies[0] : 'USD'

  const disbursableBreakdown: DisbursableBreakdown = {
    grossSettled, fees, refunds, chargebacks, reserves, unresolvedExposure, payoutable, currency
  }

  // Calculate Metrics
  const metrics = {
    matched: clusters.filter(c => c.status === 'matched').length,
    partial: clusters.filter(c => c.status === 'partial').length,
    timingDrift: clusters.filter(c => c.status === 'timing_drift').length,
    unmatched: clusters.filter(c => c.status === 'unmatched').length,
    duplicates: clusters.filter(c => c.status === 'duplicate').length,
    reserveHolds: clusters.filter(c => c.status === 'reserve_hold' || c.status === 'eligibility_hold').length,
    exceptions: clusters.filter(c => !['matched', 'partial', 'timing_drift'].includes(c.status)).length,
  }

  const reconcilableCount = metrics.matched + metrics.partial + metrics.timingDrift + metrics.unmatched + metrics.duplicates + metrics.reserveHolds;
  const matchRate = reconcilableCount > 0 ? ((metrics.matched + metrics.partial + metrics.timingDrift) / reconcilableCount) * 100 : 0;

  clusters.sort((a, b) => {
    const order: MatchStatus[] = ['eligibility_hold', 'unmatched', 'duplicate', 'timing_drift', 'partial', 'matched', 'invalid']
    return order.indexOf(a.status) - order.indexOf(b.status)
  })

  return {
    runId,
    generatedAt: new Date().toISOString(),
    clusters,
    disbursableBreakdown,
    parserWarnings,
    excludedSheets,
    matchRate,
    metrics
  }
}

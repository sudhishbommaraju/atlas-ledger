import {
  CanonicalResults,
  CanonicalTransaction,
  CandidateScore,
  DisbursableBreakdown,
  ExcludedSheet,
  MatchStatus,
  OperationalRisk,
  ParsedRecord,
  ParserWarning,
  ReconciliationCluster,
  RecordType,
  SourceType
} from './types'

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime()
  const db = new Date(b).getTime()
  if (isNaN(da) || isNaN(db)) return Infinity
  return Math.abs((da - db) / 86400000)
}

function calculateRisk(exposure: number, isChargebackOrRefund: boolean): OperationalRisk {
  if (isChargebackOrRefund || exposure > 10000) return 'high'
  if (exposure > 1000) return 'medium'
  return 'low'
}

function parseAndNormalizeDate(d: string): string {
  if (!d) return ''
  const trimmed = d.trim()
  
  // YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.split('T')[0]
  }

  // DD-MM-YYYY or DD/MM/YYYY format (e.g. 14-04-2026 or 14/04/2026)
  const dd_mm_yyyy_match = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (dd_mm_yyyy_match) {
    const day = dd_mm_yyyy_match[1].padStart(2, '0')
    const month = dd_mm_yyyy_match[2].padStart(2, '0')
    const year = dd_mm_yyyy_match[3]
    return `${year}-${month}-${day}`
  }

  // MM/DD/YYYY format (e.g. 04/14/2026)
  const mm_dd_yyyy_match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mm_dd_yyyy_match) {
    const month = mm_dd_yyyy_match[1].padStart(2, '0')
    const day = mm_dd_yyyy_match[2].padStart(2, '0')
    const year = mm_dd_yyyy_match[3]
    return `${year}-${month}-${day}`
  }

  // Fallback
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }

  return trimmed
}

function canonicalReference(value?: string): string {
  let v = String(value ?? "").trim().toLowerCase()
  v = v.replace(/[\s\-_]/g, "")
  v = v.replace(/^(ref|txn|po|payout)/, "")
  return v
}

function canonicalPayee(value?: string): string {
  let v = String(value ?? "").trim().toLowerCase()
  v = v.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
  v = v.replace(/\b(inc|llc|ltd|corp|co|company)\b/g, "")
  v = v.replace(/\s+/g, "")
  return v
}

function mapToCanonical(r: ParsedRecord): CanonicalTransaction {
  const normalizedDate = parseAndNormalizeDate(r.date)
  const amountSigned = r.amount
  const amountAbs = Math.abs(r.amount)
  
  // Extract payee with vendor_name support
  const payee = r.raw.payee || r.raw.merchant || r.raw.vendor_name || r.raw.vendorname || r.raw.counterparty || ''

  return {
    id: r.id,
    sourceFile: r.source,
    sourceType: r.sourceType || 'unknown',
    sourceSheet: r.source,
    sourceRowNumber: 0,
    originalReference: r.reference,
    normalizedReference: canonicalReference(r.reference),
    transactionDate: r.date,
    normalizedDate,
    amountOriginal: r.amount,
    amountSigned,
    amountAbs,
    currency: (r.currency || 'USD').toUpperCase(),
    payee,
    normalizedPayee: canonicalPayee(payee),
    description: r.description || '',
    normalizedDescription: (r.description || '').toLowerCase(),
    settlementBatchId: r.settlementBatchId || r.raw.settlement_id || r.raw.batch_id || '',
    type: r.type,
    rawRow: r.raw,
    normalizationWarnings: r.normalizationWarnings,
  }
}

function scoreCandidate(primary: CanonicalTransaction, candidate: CanonicalTransaction): CandidateScore {
  let score = 0
  let refScore = 0
  let amtScore = 0
  let currencyScore = 0
  let dateScore = 0
  let payeeScore = 0
  const failedRules: string[] = []

  // 1. Currency (+10)
  if (primary.currency === candidate.currency) {
    currencyScore = 10
  } else {
    failedRules.push('currency mismatch')
  }

  // 2. Amount exact abs (+35)
  const amtDiff = Math.abs(primary.amountAbs - candidate.amountAbs)
  if (amtDiff <= 0.01) {
    amtScore = 35
  } else {
    failedRules.push('amount mismatch')
  }

  // 3. Date within 2 days (+20)
  const drift = daysBetween(primary.normalizedDate, candidate.normalizedDate)
  if (drift <= 2) {
    dateScore = 20
  } else {
    failedRules.push('date outside tolerance')
  }

  // 4. Reference exact or fuzzy (+25)
  const pRef = primary.normalizedReference || ''
  const cRef = candidate.normalizedReference || ''
  if (pRef && cRef && (pRef === cRef || pRef.includes(cRef) || cRef.includes(pRef))) {
    refScore = 25
  } else {
    failedRules.push('reference mismatch')
  }

  // 5. Payee exact or fuzzy (+10)
  const pPay = primary.normalizedPayee || ''
  const cPay = candidate.normalizedPayee || ''
  if (pPay && cPay && (pPay === cPay || pPay.includes(cPay) || cPay.includes(pPay))) {
    payeeScore = 10
  }

  score = Math.min(100, refScore + amtScore + currencyScore + dateScore + payeeScore)

  return {
    candidateId: candidate.id,
    score,
    breakdown: { total: score, reference: refScore, amount: amtScore, date: dateScore, payee: payeeScore, semantics: 0, batch: 0 },
    failedDimensions: failedRules,
    candidateRow: candidate
  }
}

export function buildCanonicalResults(
  allRecords: ParsedRecord[],
  parserWarnings: ParserWarning[],
  excludedSheets: ExcludedSheet[],
  runId: string
): CanonicalResults {
  const validationAssets = allRecords.filter(r => r.sourceType === 'validation')
  const operationalParsed = allRecords.filter(r => r.sourceType !== 'validation')
  const validCanonical = operationalParsed.filter(r => r.valid).map(mapToCanonical)
  
  let operational = validCanonical
  const ignoredZero = operational.filter(r => r.amountAbs === 0)
  operational = operational.filter(r => r.amountAbs !== 0)

  const clusters: ReconciliationCluster[] = []
  
  // 2. Duplicate Detection (Same Source)
  const bySource = new Map<string, CanonicalTransaction[]>()
  for (const r of operational) {
    if (!bySource.has(r.sourceFile)) bySource.set(r.sourceFile, [])
    bySource.get(r.sourceFile)!.push(r)
  }

  const uniqueOperational: CanonicalTransaction[] = []

  for (const [source, records] of bySource) {
    const visited = new Set<string>()
    for (let i = 0; i < records.length; i++) {
      if (visited.has(records[i].id)) continue
      
      const p = records[i]
      const dups = [p]
      
      for (let j = i + 1; j < records.length; j++) {
        if (visited.has(records[j].id)) continue
        const c = records[j]
        
        if (p.currency === c.currency && p.amountAbs === c.amountAbs && p.normalizedDate === c.normalizedDate) {
          if (
            (p.normalizedReference && p.normalizedReference === c.normalizedReference) ||
            (p.normalizedPayee && p.normalizedPayee === c.normalizedPayee)
          ) {
            dups.push(c)
            visited.add(c.id)
          }
        }
      }
      
      visited.add(p.id)
      
      if (dups.length > 1) {
        clusters.push({
          clusterId: `cluster-dup-${p.id}`,
          canonicalReference: p.originalReference || `dup-${p.amountAbs}`,
          status: 'duplicate',
          confidence: 100,
          transactions: dups,
          sourcesPresent: [p.sourceType],
          missingSources: [],
          exposureAmount: dups.reduce((s, d) => s + d.amountAbs, 0),
          operationalRisk: 'low',
          payoutImpact: 0,
          matchReason: 'Duplicate records within the same source file',
          issues: ['Same amount, date, and reference/payee in one source']
        })
        uniqueOperational.push(p) // Keep the first one for matching
      } else {
        uniqueOperational.push(p)
      }
    }
  }

  // 3. Batch Matching (Ledger to Bank)
  const availableLedger = uniqueOperational.filter(r => r.sourceType === 'ledger')
  const availableBank = uniqueOperational.filter(r => r.sourceType === 'bank')
  
  const matchedLedgerIds = new Set<string>()
  const matchedCandidateIds = new Set<string>()

  for (const bank of availableBank) {
    const possibleLedgers = availableLedger.filter(l => !matchedLedgerIds.has(l.id) && l.currency === bank.currency)
    
    // Group by settlementBatchId
    const byBatch = new Map<string, CanonicalTransaction[]>()
    for (const l of possibleLedgers) {
      if (l.settlementBatchId) {
        if (!byBatch.has(l.settlementBatchId)) byBatch.set(l.settlementBatchId, [])
        byBatch.get(l.settlementBatchId)!.push(l)
      }
    }

    let matchedLedgers: CanonicalTransaction[] = []
    let matchedBatchId = ''
    
    for (const [batchId, group] of byBatch) {
      const sum = group.reduce((s, g) => s + g.amountAbs, 0)
      if (Math.abs(sum - bank.amountAbs) <= 0.01) {
        matchedLedgers = group
        matchedBatchId = batchId
        break
      }
    }

    if (matchedLedgers.length > 1) {
      const txns = [bank, ...matchedLedgers]
      txns.forEach(t => {
        if (t.sourceType === 'ledger') {
          matchedLedgerIds.add(t.id)
        } else {
          matchedCandidateIds.add(t.id)
        }
      })
      clusters.push({
        clusterId: `cluster-batch-${bank.id}`,
        canonicalReference: bank.originalReference || matchedBatchId || 'batch-match',
        status: 'matched',
        confidence: 95,
        transactions: txns,
        sourcesPresent: Array.from(new Set(txns.map(t => t.sourceType))),
        missingSources: [],
        exposureAmount: bank.amountAbs,
        operationalRisk: 'low',
        payoutImpact: 0,
        matchReason: `Batch match: ${matchedLedgers.length} ledger rows sum to bank debit`,
        issues: []
      })
    }
  }

  // 4. Candidate Lookup Search
  const candidatePool = uniqueOperational.filter(r => r.sourceType !== 'ledger')
  const ledgerRows = uniqueOperational.filter(r => r.sourceType === 'ledger')

  for (const ledger of ledgerRows) {
    if (matchedLedgerIds.has(ledger.id)) continue
    
    const availableCandidates = candidatePool.filter(c => !matchedCandidateIds.has(c.id))
    const allCandidatesScored = availableCandidates
      .map(c => scoreCandidate(ledger, c))
      .sort((a, b) => b.score - a.score)
      
    const bestCandidates = allCandidatesScored.slice(0, 3)
    const bestScore = bestCandidates.length > 0 ? bestCandidates[0].score : 0

    let status: MatchStatus = 'unmatched'
    let confidence = bestScore
    let failedRules: string[] = []
    let matchReason = ''
    let issues: string[] = []
    const matchedTxns: CanonicalTransaction[] = [ledger]

    if (bestScore >= 85) {
      status = 'matched'
      matchReason = 'Strong multi-source reconciliation match'
      const best = bestCandidates[0]
      matchedTxns.push(best.candidateRow)
      matchedCandidateIds.add(best.candidateRow.id)
    } else if (bestScore >= 55) {
      status = 'partial'
      matchReason = 'Partial match requires manual verification'
      const best = bestCandidates[0]
      matchedTxns.push(best.candidateRow)
      matchedCandidateIds.add(best.candidateRow.id)
      failedRules = best.failedDimensions
      issues = failedRules
    } else {
      status = 'unmatched'
      if (bestCandidates.length > 0) {
        failedRules = bestCandidates[0].failedDimensions
        issues = failedRules
      } else {
        failedRules = ['no candidate found']
        issues = ['No candidate found']
      }
    }

    // Missing sources list
    const sourcesPresentSet = new Set(matchedTxns.map(t => t.sourceType))
    const missingSources = ['bank', 'psp', 'erp'].filter(s => !sourcesPresentSet.has(s as SourceType))
    const finalMissingSources = allCandidatesScored.length > 0 ? [] : missingSources

    clusters.push({
      clusterId: `cluster-ledger-${ledger.id}`,
      canonicalReference: ledger.originalReference || ledger.id,
      status,
      confidence,
      transactions: matchedTxns,
      sourcesPresent: Array.from(sourcesPresentSet),
      missingSources: finalMissingSources,
      exposureAmount: ledger.amountAbs,
      operationalRisk: status === 'matched' ? 'low' : calculateRisk(ledger.amountAbs, false),
      payoutImpact: status === 'matched' ? 0 : ledger.amountAbs,
      matchReason,
      issues,
      topCandidates: bestCandidates,
      failedRules
    })
  }

  // Leftover operational non-ledger rows (orphans)
  const remainingOrphans = candidatePool.filter(c => !matchedCandidateIds.has(c.id))
  for (const orphan of remainingOrphans) {
    clusters.push({
      clusterId: `cluster-orphan-${orphan.id}`,
      canonicalReference: orphan.originalReference || orphan.id,
      status: 'unmatched',
      confidence: 0,
      transactions: [orphan],
      sourcesPresent: [orphan.sourceType],
      missingSources: ['ledger'], // It has no ledger match
      exposureAmount: orphan.amountAbs,
      operationalRisk: calculateRisk(orphan.amountAbs, false),
      payoutImpact: orphan.amountAbs,
      matchReason: '',
      issues: ['No ledger candidate found'],
      failedRules: ['no candidate found']
    })
  }

  // Ignored Zero Rows
  for (const r of ignoredZero) {
    clusters.push({
      clusterId: `cluster-ign-${r.id}`,
      canonicalReference: r.originalReference || 'zero-amount',
      status: 'ignored',
      confidence: 100,
      transactions: [r],
      sourcesPresent: [r.sourceType],
      missingSources: [],
      exposureAmount: 0,
      operationalRisk: 'low',
      payoutImpact: 0,
      matchReason: 'Zero amount record ignored',
      issues: []
    })
  }

  // Ignored Validation Assets
  for (const record of validationAssets) {
    const r = mapToCanonical(record)
    clusters.push({
      clusterId: `cluster-val-${r.id}`,
      canonicalReference: r.originalReference || 'validation-asset',
      status: 'ignored',
      confidence: 100,
      transactions: [r],
      sourcesPresent: [r.sourceType],
      missingSources: [],
      exposureAmount: 0,
      operationalRisk: 'low',
      payoutImpact: 0,
      matchReason: 'Validation asset ignored',
      issues: []
    })
  }

  // Disbursable Breakdown Calculation
  let baseTxns = operational.filter(r => r.sourceType === 'ledger')
  if (baseTxns.length === 0) {
    baseTxns = operational.filter(r => r.sourceType === 'psp')
  }
  if (baseTxns.length === 0) {
    baseTxns = operational.filter(r => r.sourceType === 'bank')
  }
  if (baseTxns.length === 0) {
    baseTxns = operational
  }

  const grossSettled = baseTxns.filter((r) => r.type === 'settlement').reduce((s, r) => s + r.amountAbs, 0)

  let feeTxns = operational.filter(r => r.sourceType === 'psp')
  if (feeTxns.length === 0) feeTxns = operational.filter(r => r.sourceType === 'bank')
  if (feeTxns.length === 0) feeTxns = baseTxns

  const fees = feeTxns.filter((r) => r.type === 'fee').reduce((s, r) => s + r.amountAbs, 0)
  const refunds = feeTxns.filter((r) => r.type === 'refund').reduce((s, r) => s + r.amountAbs, 0)
  const chargebacks = feeTxns.filter((r) => r.type === 'chargeback').reduce((s, r) => s + r.amountAbs, 0)
  const reserves = feeTxns.filter((r) => r.type === 'reserve').reduce((s, r) => s + r.amountAbs, 0)
  
  const unresolvedExposure = clusters
    .filter(c => ['unmatched', 'eligibility_hold'].includes(c.status) && c.operationalRisk === 'high')
    .reduce((s, c) => s + c.exposureAmount, 0)

  const payoutable = Math.max(0, grossSettled - fees - refunds - chargebacks - reserves - unresolvedExposure)

  // Metrics
  const mMatched = clusters.filter(c => c.status === 'matched').length
  const mPartial = clusters.filter(c => c.status === 'partial').length
  const mTiming = clusters.filter(c => c.status === 'timing_drift').length
  const mUnmatched = clusters.filter(c => c.status === 'unmatched').length
  const mDuplicates = clusters.filter(c => c.status === 'duplicate').length
  const mHolds = clusters.filter(c => c.status === 'reserve_hold' || c.status === 'eligibility_hold').length
  
  const reconcilableCount = mMatched + mPartial + mTiming + mUnmatched + mHolds
  const matchRate = reconcilableCount > 0 ? ((mMatched + mPartial + mTiming) / reconcilableCount) * 100 : 0

  clusters.sort((a, b) => {
    const order: MatchStatus[] = ['eligibility_hold', 'unmatched', 'duplicate', 'timing_drift', 'partial', 'matched', 'invalid', 'ignored']
    return order.indexOf(a.status) - order.indexOf(b.status)
  })

  // Generate debug report printout
  const debugReport = {
    operationalSources: Array.from(new Set(operational.map(r => r.sourceFile))),
    validationAssets: Array.from(new Set(validationAssets.map(r => r.source))),
    totalOperationalRows: operational.length + ignoredZero.length,
    totalReconcilableRows: reconcilableCount,
    matchedCount: mMatched,
    partialCount: mPartial,
    exceptionCount: mUnmatched,
    duplicateCount: mDuplicates,
    ignoredCount: ignoredZero.length,
    unmatchedSample: clusters
      .filter(c => c.status === 'unmatched')
      .slice(0, 10)
      .map(c => ({
        reference: c.canonicalReference,
        amount: c.transactions[0]?.amountOriginal,
        date: c.transactions[0]?.normalizedDate || c.transactions[0]?.transactionDate,
        topCandidates: c.topCandidates?.map(cand => ({
          source: cand.candidateRow.sourceFile,
          score: cand.score,
          failed: cand.failedDimensions
        })) || []
      }))
  }

  console.log("=== ATLAS RECONCILIATION ENGINE DEBUG REPORT ===")
  console.log("operationalSources:", debugReport.operationalSources)
  console.log("validationAssets:", debugReport.validationAssets)
  console.log("totalOperationalRows:", debugReport.totalOperationalRows)
  console.log("totalReconcilableRows:", debugReport.totalReconcilableRows)
  console.log("matchedCount:", debugReport.matchedCount)
  console.log("partialCount:", debugReport.partialCount)
  console.log("exceptionCount:", debugReport.exceptionCount)
  console.log("duplicateCount:", debugReport.duplicateCount)
  console.log("ignoredCount:", debugReport.ignoredCount)
  console.log("First 10 unmatched rows with top 3 candidates:")
  console.dir(debugReport.unmatchedSample, { depth: null })
  console.log("=================================================")

  return {
    runId,
    generatedAt: new Date().toISOString(),
    clusters,
    disbursableBreakdown: { grossSettled, fees, refunds, chargebacks, reserves, unresolvedExposure, payoutable, currency: 'USD' },
    parserWarnings,
    excludedSheets,
    matchRate,
    metrics: {
      matched: mMatched,
      partial: mPartial,
      timingDrift: mTiming,
      unmatched: mUnmatched,
      duplicates: mDuplicates,
      reserveHolds: mHolds,
      exceptions: mUnmatched + mHolds,
      ignored: ignoredZero.length,
      validationAssets: new Set(validationAssets.map(r => r.source)).size
    }
  }
}

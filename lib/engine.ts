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

function normalizeDate(d: string): string {
  if (!d) return ''
  const t = new Date(d)
  if (!isNaN(t.getTime())) {
    return t.toISOString().split('T')[0]
  }
  return d.trim()
}

function canonicalReference(value?: string) {
  let v = String(value ?? "").trim().toLowerCase()
  v = v.replace(/[\s\-_]/g, "")
  v = v.replace(/^(ref|txn|po|payout)/, "")
  return v
}

function canonicalPayee(value?: string) {
  let v = String(value ?? "").trim().toLowerCase()
  v = v.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
  v = v.replace(/\b(inc|llc|ltd|corp|co|company)\b/g, "")
  v = v.replace(/\s{2,}/g, " ")
  return v.trim()
}

function mapToCanonical(r: ParsedRecord): CanonicalTransaction {
  const normalizedDate = normalizeDate(r.date)
  const amountSigned = r.amount
  const amountAbs = Math.abs(r.amount)
  
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
    payee: r.raw.payee || r.raw.merchant || '',
    normalizedPayee: canonicalPayee(r.raw.payee || r.raw.merchant),
    description: r.description || '',
    normalizedDescription: (r.description || '').toLowerCase(),
    settlementBatchId: r.settlementBatchId,
    type: r.type,
    rawRow: r.raw,
    normalizationWarnings: r.normalizationWarnings,
  }
}

function scoreCandidate(primary: CanonicalTransaction, candidate: CanonicalTransaction): CandidateScore {
  let score = 0
  let refScore = 0
  let amtScore = 0
  let dateScore = 0
  let payeeScore = 0
  let semScore = 0
  let batchScore = 0
  const failedRules: string[] = []

  // Amount
  const amtDiff = Math.abs(primary.amountAbs - candidate.amountAbs)
  if (amtDiff <= 0.01) {
    amtScore = 30
  } else if (amtDiff <= 0.05) {
    amtScore = 20
  } else {
    failedRules.push('Amount outside $0.05 tolerance')
  }

  // Reference
  if (primary.normalizedReference && candidate.normalizedReference) {
    if (primary.normalizedReference === candidate.normalizedReference) {
      refScore = 40
    } else if (primary.normalizedReference.includes(candidate.normalizedReference) || candidate.normalizedReference.includes(primary.normalizedReference)) {
      refScore = 25
    } else {
      refScore = 10
      failedRules.push('Reference mismatch')
    }
  } else {
    failedRules.push('Missing reference')
  }

  // Date
  const drift = daysBetween(primary.normalizedDate, candidate.normalizedDate)
  if (drift === 0) dateScore = 15
  else if (drift <= 1) dateScore = 10
  else if (drift <= 2) dateScore = 7
  else if (drift <= 8) {
    dateScore = 3
    failedRules.push('Date extended review window')
  } else {
    failedRules.push('Date outside tolerance')
  }

  // Payee
  if (primary.normalizedPayee && candidate.normalizedPayee) {
    if (primary.normalizedPayee === candidate.normalizedPayee) payeeScore = 10
    else payeeScore = 6
  }

  // Semantics
  const pDesc = primary.normalizedDescription
  const cDesc = candidate.normalizedDescription
  const semTerms = ['ach', 'wire', 'payout', 'settlement', 'transfer', 'vendor', 'debit', 'credit']
  if (semTerms.some(t => pDesc.includes(t) && cDesc.includes(t))) {
    semScore = 5
  }

  // Batch
  if (primary.settlementBatchId && candidate.settlementBatchId && primary.settlementBatchId === candidate.settlementBatchId) {
    batchScore = 10
  }

  score = Math.min(100, refScore + amtScore + dateScore + payeeScore + semScore + batchScore)

  return {
    candidateId: candidate.id,
    score,
    breakdown: { total: score, reference: refScore, amount: amtScore, date: dateScore, payee: payeeScore, semantics: semScore, batch: batchScore },
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
  const allCanonical = allRecords.filter(r => r.valid).map(mapToCanonical)
  
  // 1. Exclude Validation Assets & Zero rows
  const validationAssets = allCanonical.filter(r => r.sourceType === 'validation')
  let operational = allCanonical.filter(r => r.sourceType !== 'validation')
  
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
          sourcesPresent: [source],
          missingSources: [],
          exposureAmount: dups.reduce((s, d) => s + d.amountAbs, 0),
          operationalRisk: 'low',
          payoutImpact: 0,
          matchReason: 'Duplicate records within the same source file',
          issues: ['Same amount, date, and reference/payee in one source']
        })
        uniqueOperational.push(dups[0]) // Keep one for cross-matching
      } else {
        uniqueOperational.push(p)
      }
    }
  }

  // 3. Cross-Source Candidate Matching
  const availableLedger = uniqueOperational.filter(r => r.sourceType === 'ledger')
  const availableBank = uniqueOperational.filter(r => r.sourceType === 'bank')
  const availablePsp = uniqueOperational.filter(r => r.sourceType === 'psp')
  const availableErp = uniqueOperational.filter(r => r.sourceType === 'erp')

  const usedIds = new Set<string>()

  // Batch Matching Helper (Ledger to Bank)
  // For each bank row, find if there are multiple ledger rows matching batch or date/payee that sum to it
  for (const bank of availableBank) {
    if (usedIds.has(bank.id)) continue
    
    // Find ledger rows not used
    const possibleLedgers = availableLedger.filter(l => !usedIds.has(l.id) && l.currency === bank.currency)
    
    // Group by batch ID
    const byBatch = new Map<string, CanonicalTransaction[]>()
    for (const l of possibleLedgers) {
      if (l.settlementBatchId) {
        if (!byBatch.has(l.settlementBatchId)) byBatch.set(l.settlementBatchId, [])
        byBatch.get(l.settlementBatchId)!.push(l)
      }
    }

    let matchedLedgers: CanonicalTransaction[] = []
    
    for (const [batchId, group] of byBatch) {
      const sum = group.reduce((s, g) => s + g.amountAbs, 0)
      if (Math.abs(sum - bank.amountAbs) <= 0.01) {
        matchedLedgers = group
        break
      }
    }

    if (matchedLedgers.length > 1) {
      const txns = [bank, ...matchedLedgers]
      txns.forEach(t => usedIds.add(t.id))
      clusters.push({
        clusterId: `cluster-batch-${bank.id}`,
        canonicalReference: bank.originalReference || bank.settlementBatchId || 'batch-match',
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

  // 1-to-1 matching
  const allKnownSources = Array.from(new Set(uniqueOperational.map(r => r.sourceType)))

  const match1to1 = (primary: CanonicalTransaction, candidatesPool: CanonicalTransaction[]) => {
    if (usedIds.has(primary.id)) return
    
    const candidates = candidatesPool.filter(c => !usedIds.has(c.id) && c.currency === primary.currency)
    if (candidates.length === 0) {
      clusters.push({
        clusterId: `cluster-unm-${primary.id}`,
        canonicalReference: primary.originalReference || primary.id,
        status: 'unmatched',
        confidence: 0,
        transactions: [primary],
        sourcesPresent: [primary.sourceType],
        missingSources: allKnownSources.filter(s => s !== primary.sourceType),
        exposureAmount: primary.amountAbs,
        operationalRisk: calculateRisk(primary.amountAbs, false),
        payoutImpact: primary.amountAbs,
        matchReason: '',
        issues: ['No compatible source candidate'],
        failedRules: []
      })
      usedIds.add(primary.id)
      return
    }

    const scored = candidates.map(c => scoreCandidate(primary, c)).sort((a, b) => b.score - a.score)
    const best = scored[0]

    if (best.score >= 90) {
      usedIds.add(primary.id)
      usedIds.add(best.candidateRow.id)
      clusters.push({
        clusterId: `cluster-mat-${primary.id}`,
        canonicalReference: primary.originalReference || best.candidateRow.originalReference,
        status: 'matched',
        confidence: best.score,
        transactions: [primary, best.candidateRow],
        sourcesPresent: [primary.sourceType, best.candidateRow.sourceType],
        missingSources: [],
        exposureAmount: primary.amountAbs,
        operationalRisk: 'low',
        payoutImpact: 0,
        matchReason: 'Strong 1-to-1 match',
        issues: [],
        topCandidates: scored.slice(0, 3)
      })
    } else if (best.score >= 70) {
      usedIds.add(primary.id)
      usedIds.add(best.candidateRow.id)
      clusters.push({
        clusterId: `cluster-par-${primary.id}`,
        canonicalReference: primary.originalReference || best.candidateRow.originalReference,
        status: 'partial',
        confidence: best.score,
        transactions: [primary, best.candidateRow],
        sourcesPresent: [primary.sourceType, best.candidateRow.sourceType],
        missingSources: [],
        exposureAmount: primary.amountAbs,
        operationalRisk: 'medium',
        payoutImpact: primary.amountAbs,
        matchReason: 'Partial match needs review',
        issues: best.failedDimensions,
        topCandidates: scored.slice(0, 3),
        failedRules: best.failedDimensions
      })
    } else {
      usedIds.add(primary.id)
      clusters.push({
        clusterId: `cluster-unm-${primary.id}`,
        canonicalReference: primary.originalReference || primary.id,
        status: 'unmatched',
        confidence: best.score,
        transactions: [primary],
        sourcesPresent: [primary.sourceType],
        missingSources: allKnownSources.filter(s => s !== primary.sourceType),
        exposureAmount: primary.amountAbs,
        operationalRisk: calculateRisk(primary.amountAbs, false),
        payoutImpact: primary.amountAbs,
        matchReason: '',
        issues: best.failedDimensions.length > 0 ? best.failedDimensions : ['Ambiguous candidates'],
        topCandidates: scored.slice(0, 3),
        failedRules: best.failedDimensions
      })
    }
  }

  // Cross match order:
  // Ledger -> Bank
  availableLedger.forEach(l => match1to1(l, availableBank))
  // Ledger -> PSP
  availableLedger.forEach(l => match1to1(l, availablePsp))
  // Ledger -> ERP
  availableLedger.forEach(l => match1to1(l, availableErp))
  // Remaining Bank
  availableBank.forEach(b => match1to1(b, availablePsp))
  
  // Any unmatched leftovers
  uniqueOperational.forEach(r => {
    if (!usedIds.has(r.id)) {
      clusters.push({
        clusterId: `cluster-unm-lo-${r.id}`,
        canonicalReference: r.originalReference || r.id,
        status: 'unmatched',
        confidence: 0,
        transactions: [r],
        sourcesPresent: [r.sourceType],
        missingSources: allKnownSources.filter(s => s !== r.sourceType),
        exposureAmount: r.amountAbs,
        operationalRisk: calculateRisk(r.amountAbs, false),
        payoutImpact: r.amountAbs,
        matchReason: '',
        issues: ['Orphan record'],
        failedRules: []
      })
      usedIds.add(r.id)
    }
  })

  // Ignored / Validation
  validationAssets.forEach(r => {
    clusters.push({
      clusterId: `cluster-val-${r.id}`,
      canonicalReference: r.originalReference || 'validation',
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
  })
  
  ignoredZero.forEach(r => {
    clusters.push({
      clusterId: `cluster-ign-${r.id}`,
      canonicalReference: r.originalReference || 'zero',
      status: 'ignored',
      confidence: 100,
      transactions: [r],
      sourcesPresent: [r.sourceType],
      missingSources: [],
      exposureAmount: 0,
      operationalRisk: 'low',
      payoutImpact: 0,
      matchReason: 'Zero amount ignored',
      issues: []
    })
  })

  // Disbursable
  const grossSettled = operational.filter((r) => r.type === 'settlement').reduce((s, r) => s + r.amountAbs, 0)
  const fees = operational.filter((r) => r.type === 'fee').reduce((s, r) => s + r.amountAbs, 0)
  const refunds = operational.filter((r) => r.type === 'refund').reduce((s, r) => s + r.amountAbs, 0)
  const chargebacks = operational.filter((r) => r.type === 'chargeback').reduce((s, r) => s + r.amountAbs, 0)
  const reserves = operational.filter((r) => r.type === 'reserve').reduce((s, r) => s + r.amountAbs, 0)
  
  const unresolvedExposure = clusters
    .filter(c => ['unmatched', 'partial', 'eligibility_hold'].includes(c.status) && c.operationalRisk === 'high')
    .reduce((s, c) => s + c.exposureAmount, 0)

  const payoutable = Math.max(0, grossSettled - fees - refunds - chargebacks - reserves - unresolvedExposure)

  // Metrics
  const mMatched = clusters.filter(c => c.status === 'matched').length
  const mPartial = clusters.filter(c => c.status === 'partial').length
  const mTiming = clusters.filter(c => c.status === 'timing_drift').length
  const mUnmatched = clusters.filter(c => c.status === 'unmatched').length
  const mDuplicates = clusters.filter(c => c.status === 'duplicate').length
  const mHolds = clusters.filter(c => c.status === 'reserve_hold' || c.status === 'eligibility_hold').length
  
  const reconcilableCount = mMatched + mPartial + mTiming + mUnmatched + mDuplicates + mHolds
  const matchRate = reconcilableCount > 0 ? ((mMatched + mPartial + mTiming) / reconcilableCount) * 100 : 0

  clusters.sort((a, b) => {
    const order: MatchStatus[] = ['eligibility_hold', 'unmatched', 'duplicate', 'timing_drift', 'partial', 'matched', 'invalid', 'ignored']
    return order.indexOf(a.status) - order.indexOf(b.status)
  })

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
      validationAssets: validationAssets.length
    }
  }
}


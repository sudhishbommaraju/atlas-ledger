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
  return Math.abs(Math.round((da - db) / 86400000))
}

function calculateRisk(exposure: number, isChargebackOrRefund: boolean): OperationalRisk {
  if (isChargebackOrRefund || exposure > 10000) return 'high'
  if (exposure > 1000) return 'medium'
  return 'low'
}

function parseAndNormalizeDate(d: string): string {
  if (!d) return ''
  const trimmed = d.trim()
  
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.split('T')[0]
  }

  const dd_mm_yyyy_match = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (dd_mm_yyyy_match) {
    const day = dd_mm_yyyy_match[1].padStart(2, '0')
    const month = dd_mm_yyyy_match[2].padStart(2, '0')
    const year = dd_mm_yyyy_match[3]
    return `${year}-${month}-${day}`
  }

  const mm_dd_yyyy_match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mm_dd_yyyy_match) {
    const month = mm_dd_yyyy_match[1].padStart(2, '0')
    const day = mm_dd_yyyy_match[2].padStart(2, '0')
    const year = mm_dd_yyyy_match[3]
    return `${year}-${month}-${day}`
  }

  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }

  return trimmed
}

function canonicalReference(value?: string): string {
  let v = String(value ?? "").trim().toUpperCase()
  v = v.replace(/[\s\-_.,;:'"]/g, "")
  v = v.replace(/^(REF|TXN|PAYOUT|PAY|PO)/, "")
  return v
}

function canonicalPayee(value?: string): string {
  let v = String(value ?? "").trim().toLowerCase()
  v = v.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
  v = v.replace(/\b(inc|llc|ltd|corp|corporation|co|company)\b/g, "")
  v = v.replace(/\s+/g, "")
  return v
}

function extractSemantics(desc: string): string[] {
  const v = desc.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
  const tokens = v.split(/\s+/)
  const keywords = ['payout', 'settlement', 'debit', 'credit', 'transfer', 'ach', 'wire', 'fee', 'refund', 'reserve', 'chargeback']
  return tokens.filter(t => keywords.includes(t))
}

function mapToCanonical(r: ParsedRecord): CanonicalTransaction {
  const normalizedDate = parseAndNormalizeDate(r.date)
  const amountSigned = r.amount
  const amountAbs = Math.abs(r.amount)
  
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
    currency: (r.currency || 'USD').toUpperCase().trim(),
    payee,
    normalizedPayee: canonicalPayee(payee),
    description: r.description || '',
    normalizedDescription: (r.description || '').toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").replace(/\s+/g, " "),
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
  let semanticScore = 0
  const failedRules: string[] = []

  if (primary.currency === candidate.currency) {
    currencyScore = 10
  } else {
    failedRules.push('currency mismatch')
  }

  const amtDiff = Math.abs(primary.amountAbs - candidate.amountAbs)
  const softTolerance = Math.max(1.00, primary.amountAbs * 0.001)
  if (amtDiff <= 0.01) {
    amtScore = 35
  } else if (amtDiff <= softTolerance) {
    amtScore = 25
  } else {
    failedRules.push('amount mismatch')
  }

  const drift = daysBetween(primary.normalizedDate, candidate.normalizedDate)
  if (drift === 0) {
    dateScore = 15
  } else if (drift <= 1) {
    dateScore = 12
  } else if (drift <= 3) {
    dateScore = 10
  } else if (drift <= 10) {
    dateScore = 4
  } else {
    failedRules.push('date outside extended tolerance (>10 days)')
  }

  const pRef = primary.normalizedReference || ''
  const cRef = candidate.normalizedReference || ''
  
  if (pRef && cRef && pRef === cRef) {
    refScore = 40
  } else if (pRef && cRef && (pRef.includes(cRef) || cRef.includes(pRef)) && Math.min(pRef.length, cRef.length) >= 4) {
    refScore = 25
  } else if (pRef && cRef && (pRef.includes(cRef) || cRef.includes(pRef))) {
    refScore = 10
  } else {
    failedRules.push('reference mismatch')
  }

  const pPay = primary.normalizedPayee || ''
  const cPay = candidate.normalizedPayee || ''
  if (pPay && cPay && pPay === cPay) {
    payeeScore = 10
  } else if (pPay && cPay && (pPay.includes(cPay) || cPay.includes(pPay))) {
    payeeScore = 6
  }

  const pSem = extractSemantics(primary.description)
  const cSem = extractSemantics(candidate.description)
  if (pSem.length > 0 && cSem.length > 0 && pSem.some(s => cSem.includes(s))) {
    semanticScore = 5
  }

  score = Math.min(100, refScore + amtScore + currencyScore + dateScore + payeeScore + semanticScore)

  return {
    candidateId: candidate.id,
    score,
    breakdown: { total: score, reference: refScore, amount: amtScore, date: dateScore, payee: payeeScore, semantics: semanticScore, batch: 0 },
    failedDimensions: failedRules,
    candidateRow: candidate
  }
}

function isCompatibleSourcePair(typeA: SourceType, typeB: SourceType): boolean {
  if (typeA === typeB) return false
  const pair = [typeA, typeB].sort().join('-')
  return ['bank-ledger', 'erp-ledger', 'ledger-psp', 'bank-psp', 'erp-psp'].includes(pair)
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
  
  // 2. Duplicate Detection
  const bySourceType = new Map<SourceType, CanonicalTransaction[]>()
  for (const r of operational) {
    if (!bySourceType.has(r.sourceType)) bySourceType.set(r.sourceType, [])
    bySourceType.get(r.sourceType)!.push(r)
  }

  const uniqueOperational: CanonicalTransaction[] = []

  for (const [sourceType, records] of bySourceType) {
    const visited = new Set<string>()
    for (let i = 0; i < records.length; i++) {
      if (visited.has(records[i].id)) continue
      
      const p = records[i]
      const dups = [p]
      
      for (let j = i + 1; j < records.length; j++) {
        if (visited.has(records[j].id)) continue
        const c = records[j]
        
        if (p.currency === c.currency && p.amountAbs === c.amountAbs && p.normalizedDate === c.normalizedDate) {
          const sameRef = p.normalizedReference && p.normalizedReference === c.normalizedReference;
          const samePayeeAndSimilarDesc = p.normalizedPayee && p.normalizedPayee === c.normalizedPayee && p.normalizedDescription === c.normalizedDescription;

          if (sameRef || samePayeeAndSimilarDesc) {
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
          matchReason: 'Duplicate records within the same source type',
          issues: ['Same amount, date, and reference/payee in one source']
        })
        uniqueOperational.push(p)
      } else {
        uniqueOperational.push(p)
      }
    }
  }

  // 3. Multi-source Candidate Matching
  const matchedTxnIds = new Set<string>()
  
  // Prioritize ledgers matching first, then PSP matching
  const matchingOrder = ['ledger', 'psp', 'erp', 'bank', 'unknown']
  uniqueOperational.sort((a, b) => matchingOrder.indexOf(a.sourceType) - matchingOrder.indexOf(b.sourceType))

  for (const primary of uniqueOperational) {
    if (matchedTxnIds.has(primary.id)) continue
    
    const candidatePool = uniqueOperational.filter(c => 
      !matchedTxnIds.has(c.id) && 
      isCompatibleSourcePair(primary.sourceType, c.sourceType)
    )

    const viableCandidates = []
    for (const c of candidatePool) {
      if (primary.currency !== c.currency) continue
      
      const amtDiff = Math.abs(primary.amountAbs - c.amountAbs)
      const softTolerance = Math.max(1.00, primary.amountAbs * 0.001)
      const drift = daysBetween(primary.normalizedDate, c.normalizedDate)
      
      const pRef = primary.normalizedReference || ''
      const cRef = c.normalizedReference || ''
      const refMatchesStrongly = pRef && cRef && (pRef === cRef || pRef.includes(cRef) || cRef.includes(pRef) && Math.min(pRef.length, cRef.length) >= 4)

      if ((amtDiff <= softTolerance && drift <= 10) || refMatchesStrongly) {
         viableCandidates.push(c)
      }
    }

    const scoredCandidates = viableCandidates
      .map(c => scoreCandidate(primary, c))
      .sort((a, b) => b.score - a.score)
      
    // Group by source type to get the best match per compatible source type
    const bestBySourceType = new Map<SourceType, CandidateScore>()
    for (const c of scoredCandidates) {
      if (!bestBySourceType.has(c.candidateRow.sourceType)) {
        bestBySourceType.set(c.candidateRow.sourceType, c)
      }
    }

    const matchedTxns: CanonicalTransaction[] = [primary]
    let lowestMatchedScore = 100
    let hasPartial = false
    const usedCandidates: CandidateScore[] = []

    for (const best of bestBySourceType.values()) {
      if (best.score >= 55) {
        matchedTxns.push(best.candidateRow)
        matchedTxnIds.add(best.candidateRow.id)
        usedCandidates.push(best)
        if (best.score < lowestMatchedScore) lowestMatchedScore = best.score
        if (best.score < 80) hasPartial = true
      }
    }

    let status: MatchStatus = 'unmatched'
    let failedRules: string[] = []
    let matchReason = ''
    let issues: string[] = []

    if (matchedTxns.length > 1) {
      status = hasPartial ? 'partial' : 'matched'
      matchReason = hasPartial ? 'Partial match requires manual verification' : 'Strong multi-source reconciliation match'
      matchedTxnIds.add(primary.id)
    } else {
      status = 'unmatched'
      if (scoredCandidates.length > 0) {
        failedRules = scoredCandidates[0].failedDimensions
        issues = failedRules
      } else {
        failedRules = ['no candidate found']
        issues = ['No suitable candidate found from compatible sources']
      }
    }

    const sourcesPresentSet = new Set(matchedTxns.map(t => t.sourceType))
    let expectedPair: SourceType | null = null
    if (primary.sourceType === 'ledger') expectedPair = 'bank'
    else if (primary.sourceType === 'psp') expectedPair = 'bank'

    const missingSources = expectedPair && !sourcesPresentSet.has(expectedPair) ? [expectedPair] : []

    clusters.push({
      clusterId: `cluster-${primary.id}`,
      canonicalReference: primary.originalReference || primary.id,
      status,
      confidence: matchedTxns.length > 1 ? lowestMatchedScore : (scoredCandidates[0]?.score || 0),
      transactions: matchedTxns,
      sourcesPresent: Array.from(sourcesPresentSet),
      missingSources,
      exposureAmount: primary.amountAbs,
      operationalRisk: status === 'matched' ? 'low' : calculateRisk(primary.amountAbs, false),
      payoutImpact: status === 'matched' ? 0 : primary.amountAbs,
      matchReason,
      issues,
      topCandidates: usedCandidates.length > 0 ? usedCandidates : scoredCandidates.slice(0, 3),
      failedRules
    })
  }

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

  let baseTxns = operational.filter(r => r.sourceType === 'ledger')
  if (baseTxns.length === 0) baseTxns = operational.filter(r => r.sourceType === 'psp')
  if (baseTxns.length === 0) baseTxns = operational.filter(r => r.sourceType === 'bank')
  if (baseTxns.length === 0) baseTxns = operational

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

  const debugReport = {
    operationalSources: Array.from(new Set(operational.map(r => `${r.sourceFile} (${r.sourceType})`))),
    validationAssets: Array.from(new Set(validationAssets.map(r => r.source))),
    totalOperationalRows: operational.length + ignoredZero.length,
    totalReconcilableRows: reconcilableCount,
    matchedCount: mMatched,
    partialCount: mPartial,
    exceptionCount: mUnmatched,
    duplicateCount: mDuplicates,
    ignoredCount: ignoredZero.length,
    matchRate: matchRate,
    firstTenUnmatchedWithCandidates: clusters
      .filter(c => c.status === 'unmatched')
      .slice(0, 10)
      .map(c => ({
        displayId: c.canonicalReference,
        sourceType: c.transactions[0]?.sourceType,
        originalReference: c.transactions[0]?.originalReference,
        normalizedReference: c.transactions[0]?.normalizedReference,
        amountAbs: c.transactions[0]?.amountAbs,
        currency: c.transactions[0]?.currency,
        normalizedDate: c.transactions[0]?.normalizedDate,
        topCandidates: c.topCandidates?.map(cand => ({
          sourceType: cand.candidateRow.sourceType,
          originalReference: cand.candidateRow.originalReference,
          normalizedReference: cand.candidateRow.normalizedReference,
          amountAbs: cand.candidateRow.amountAbs,
          currency: cand.candidateRow.currency,
          normalizedDate: cand.candidateRow.normalizedDate,
          score: cand.score,
          scoreBreakdown: cand.breakdown,
          failedReasons: cand.failedDimensions
        })) || []
      }))
  }

  console.log("=== ATLAS RECONCILIATION ENGINE DEBUG REPORT ===")
  console.dir(debugReport, { depth: null, colors: true })
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

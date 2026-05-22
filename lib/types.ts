export type SourceType = 'ledger' | 'bank' | 'psp' | 'erp' | 'validation' | 'unknown'

export type RecordType =
  | 'settlement'
  | 'fee'
  | 'refund'
  | 'chargeback'
  | 'reserve'
  | 'payout'
  | 'unknown'

export type MatchStatus =
  | 'matched'
  | 'partial'
  | 'timing_drift'
  | 'duplicate'
  | 'unmatched'
  | 'reserve_hold'
  | 'eligibility_hold'
  | 'invalid'
  | 'ignored'

export type OperationalRisk = 'low' | 'medium' | 'high'

export type ParsedRecord = {
  id: string
  source: string
  sourceType?: SourceType
  reference: string
  settlementBatchId?: string
  description: string
  amount: number
  currency: string
  date: string
  type: RecordType
  raw: Record<string, string>
  valid: boolean
  normalizationWarnings: string[]
}

export type ExcludedSheet = {
  sheetName: string
  reason: string
}

export type ParserWarning = {
  sourceName: string
  rowNumber?: number
  message: string
}

export type CanonicalTransaction = {
  id: string
  sourceFile: string
  sourceType: SourceType
  sourceSheet: string
  sourceRowNumber: number
  originalReference: string
  normalizedReference: string
  transactionDate: string
  normalizedDate: string
  amountOriginal: number
  amountSigned: number
  amountAbs: number
  currency: string
  payee: string
  normalizedPayee: string
  description: string
  normalizedDescription: string
  settlementBatchId?: string
  type: RecordType
  rawRow: Record<string, string>
  normalizationWarnings: string[]
}

export type ScoreBreakdown = {
  total: number
  reference: number
  amount: number
  date: number
  payee: number
  semantics: number
  batch: number
}

export type CandidateScore = {
  candidateId: string
  score: number
  breakdown: ScoreBreakdown
  failedDimensions: string[]
  candidateRow: CanonicalTransaction
}

export type ReconciliationCluster = {
  clusterId: string
  canonicalReference: string
  status: MatchStatus
  confidence: number
  transactions: CanonicalTransaction[]
  sourcesPresent: string[]
  missingSources: string[]
  exposureAmount: number
  operationalRisk: OperationalRisk
  payoutImpact: number
  matchReason: string
  issues: string[]
  topCandidates?: CandidateScore[]
  failedRules?: string[]
}

export type DisbursableBreakdown = {
  grossSettled: number
  fees: number
  refunds: number
  chargebacks: number
  reserves: number
  unresolvedExposure: number
  payoutable: number
  currency: string
}

export type CanonicalResults = {
  runId: string
  generatedAt: string
  clusters: ReconciliationCluster[]
  disbursableBreakdown: DisbursableBreakdown
  parserWarnings: ParserWarning[]
  excludedSheets: ExcludedSheet[]
  matchRate: number
  metrics: {
    matched: number
    partial: number
    timingDrift: number
    unmatched: number
    duplicates: number
    reserveHolds: number
    exceptions: number
    ignored: number
    validationAssets: number
  }
}

// Legacy UI types for file upload state
export type FileStatus = 'pending' | 'parsing' | 'parsed' | 'warning' | 'failed'

export type UploadedFile = {
  id: string
  name: string
  extension: string
  size: number
  status: FileStatus
  recordCount: number
  records: ParsedRecord[]
  warnings: string[]
  error?: string
  archiveName?: string
  sourceType?: SourceType
}

export type ParseResult = {
  records: ParsedRecord[]
  warnings: string[]
  excludedSheets: ExcludedSheet[]
  error?: string
}

export type ExtractedFileResult = ParseResult & {
  filename: string
  archiveName?: string
  sizeBytes: number
  sourceType: SourceType
}


export type RecordType =
  | 'settlement'
  | 'fee'
  | 'refund'
  | 'chargeback'
  | 'reserve'
  | 'payout'
  | 'unknown'

export type ParsedRecord = {
  id: string
  source: string
  reference: string
  description: string
  amount: number
  currency: string
  date: string
  type: RecordType
  raw: Record<string, string>
  valid: boolean
  normalizationWarnings: string[]
}

export type MatchStatus =
  | 'matched'
  | 'partial'
  | 'unmatched'
  | 'duplicate'
  | 'timing_drift'
  | 'eligibility_hold'
  | 'invalid'

export type MatchResult = {
  record: ParsedRecord
  status: MatchStatus
  confidence: number
  matchedRecord?: ParsedRecord
  issue?: string
  matchReason?: string
  recommendedAction?: string
}

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
}

export type DisbursableFunds = {
  grossSettled: number
  fees: number
  refunds: number
  chargebacks: number
  reserves: number
  unresolved: number
  available: number
  currency: string
}

export type ParseResult = {
  records: ParsedRecord[]
  warnings: string[]
  error?: string
}

export type ParserWarning = {
  sourceName: string;
  rowNumber?: number;
  message: string;
};

export type ReconciliationException = {
  reference: string;
  sourceName: string;
  type: "unmatched" | "duplicate" | "timing_drift" | "reserve_hold" | "invalid";
  severity: "low" | "medium" | "high";
  message: string;
};

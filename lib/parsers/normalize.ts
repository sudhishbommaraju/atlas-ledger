import { ParsedRecord, RecordType } from '../types'

const REF_KEYS = ['reference', 'ref', 'transaction_id', 'txn_id', 'txn_ref', 'id', 'payment_id', 'psp_ref', 'order_id', 'trace_id']
const AMT_KEYS = ['amount', 'net_amount', 'settled_amount', 'gross_amount', 'value', 'debit', 'credit', 'transaction_amount', 'net']
const DESC_KEYS = ['description', 'memo', 'narration', 'details', 'note', 'remarks', 'text', 'label']
const DATE_KEYS = ['date', 'settlement_date', 'transaction_date', 'value_date', 'posting_date', 'created_at', 'timestamp', 'txn_date']
const CCY_KEYS = ['currency', 'ccy', 'iso_currency', 'currency_code']
const TYPE_KEYS = ['type', 'transaction_type', 'txn_type', 'record_type', 'entry_type', 'category']

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim()
    }
  }
  return ''
}

function detectType(row: Record<string, string>, raw_type: string, amount: number): RecordType {
  const t = raw_type.toLowerCase()
  if (/fee|charge|service.fee|platform.fee|processing.fee/.test(t)) return 'fee'
  if (/refund|reversal|return/.test(t)) return 'refund'
  if (/chargeback|dispute|cb/.test(t)) return 'chargeback'
  if (/reserve|hold|rolling.reserve/.test(t)) return 'reserve'
  if (/payout|disbursement|transfer.out/.test(t)) return 'payout'
  if (/settle|settlement|cleared|credit/.test(t)) return 'settlement'
  // infer from amount sign and description
  const desc = pick(row, DESC_KEYS).toLowerCase()
  if (/refund/.test(desc) && amount < 0) return 'refund'
  if (/chargeback/.test(desc)) return 'chargeback'
  if (/fee/.test(desc) && amount < 0) return 'fee'
  if (/reserve/.test(desc) && amount < 0) return 'reserve'
  if (amount > 0) return 'settlement'
  return 'unknown'
}

function makeId(source: string, reference: string, amount: number, index: number): string {
  const str = `${source}|${reference}|${amount}|${index}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

export function normalizeRecord(row: Record<string, string>, filename: string, index: number): ParsedRecord {
  const reference = pick(row, REF_KEYS) || `ROW-${index + 1}`
  const amountStr = pick(row, AMT_KEYS)
  const amount = amountStr ? parseFloat(amountStr.replace(/[^0-9.\-]/g, '')) || 0 : 0
  const description = pick(row, DESC_KEYS) || pick(row, TYPE_KEYS) || ''
  const date = pick(row, DATE_KEYS) || ''
  const currency = pick(row, CCY_KEYS) || 'USD'
  const rawType = pick(row, TYPE_KEYS)
  const type = detectType(row, rawType, amount)

  return {
    id: makeId(filename, reference, amount, index),
    source: filename,
    reference,
    description,
    amount,
    currency,
    date,
    type,
    raw: row,
  }
}

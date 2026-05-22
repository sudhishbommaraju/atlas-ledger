import { ParsedRecord, RecordType } from '../types'

export const REF_KEYS = [
  "transaction_id", "transactionid", "txn_id", "txn", "id",
  "reference", "ref", "payment_id", "settlement_id", "external_id",
  "merchant_reference", "merchantreference", "payment_reference",
  "paymentreference", "balance_transaction", "balancetransaction",
  "statement_reference", "statementreference", "booking_reference",
  "bookingreference"
]

export const AMT_KEYS = [
  "amount", "gross_amount", "grossamount", "net_amount", "netamount",
  "settlement_amount", "settlementamount", "debit", "credit", "value",
  "payout_amount", "payoutamount", "gross", "net", "paid_amount", "paidamount",
  "reserve_hold", "reserveamount", "reserve"
]

export const DESC_KEYS = [
  "description", "memo", "details", "narrative", "counterparty",
  "merchant", "payee", "booking_text", "bookingtext"
]
const DATE_KEYS = ['date', 'settlement_date', 'transaction_date', 'value_date', 'posting_date', 'created_at', 'timestamp', 'txn_date']
const CCY_KEYS = ['currency', 'ccy', 'iso_currency', 'currency_code']
const TYPE_KEYS = ['type', 'transaction_type', 'txn_type', 'record_type', 'entry_type', 'category']

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    // some normalized keys might not perfectly match if spaces weren't replaced, but we lowercase them in xlsx.ts
    // Let's also check if any key includes the target key to be safe, but exact match is better.
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim()
    }
    // Check if any key *includes* the target (e.g. "Net Amount (EUR)")
    const matchingKey = Object.keys(row).find(rowKey => rowKey.includes(k));
    if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== null && String(row[matchingKey]).trim() !== '') {
        return String(row[matchingKey]).trim()
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

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

function getMappedValue(
  row: Record<string, string>,
  candidates: string[]
): { value: unknown; detectedColumn?: string } {
  const normalizedCandidates = candidates.map(normalizeHeader);

  for (const [key, value] of Object.entries(row)) {
    if (normalizedCandidates.includes(normalizeHeader(key))) {
      return { value, detectedColumn: key };
    }
    // Fallback partial match if exact fails
    if (normalizedCandidates.some(cand => normalizeHeader(key).includes(cand))) {
      return { value, detectedColumn: key };
    }
  }

  return { value: undefined };
}

type AmountParseResult = {
  amount: number | null;
  detectedColumn?: string;
  explicitZero: boolean;
};

function parseMappedAmount(row: Record<string, string>): AmountParseResult {
  const match = getMappedValue(row, AMT_KEYS);

  if (match.value !== undefined && String(match.value).trim() !== "") {
    const amountStr = String(match.value);
    const amount = parseFloat(amountStr.replace(/[^0-9.\-]/g, ''));

    if (!isNaN(amount)) {
      return {
        amount,
        detectedColumn: match.detectedColumn,
        explicitZero: amount === 0,
      };
    }
  }

  return {
    amount: null,
    explicitZero: false,
  };
}

export function normalizeRecord(row: Record<string, string>, filename: string, index: number): ParsedRecord {
  const referenceMatch = getMappedValue(row, REF_KEYS)
  const reference = referenceMatch.value ? String(referenceMatch.value).trim() : ''
  const amountResult = parseMappedAmount(row);
  
  const warnings: string[] = [];
  
  if (!reference) {
    warnings.push("Reference column not detected or empty");
  }
  if (amountResult.amount === null) {
    warnings.push("Amount column not detected or amount invalid");
  }

  const valid = !!reference && amountResult.amount !== null;
  const amount = amountResult.amount ?? 0;

  const descriptionMatch = getMappedValue(row, DESC_KEYS) || getMappedValue(row, TYPE_KEYS);
  const description = descriptionMatch.value ? String(descriptionMatch.value) : '';

  const dateMatch = getMappedValue(row, DATE_KEYS);
  const date = dateMatch.value ? String(dateMatch.value) : '';

  const currencyMatch = getMappedValue(row, CCY_KEYS);
  const currency = currencyMatch.value ? String(currencyMatch.value) : 'USD';

  const rawTypeMatch = getMappedValue(row, TYPE_KEYS);
  const rawType = rawTypeMatch.value ? String(rawTypeMatch.value) : '';

  const type = detectType(row, rawType, amount)

  return {
    id: makeId(filename, reference || `ROW-${index}`, amount, index),
    source: filename,
    reference,
    description,
    amount,
    currency,
    date,
    type,
    raw: row,
    valid,
    normalizationWarnings: warnings,
  }
}

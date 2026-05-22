import { SourceType } from '../types'

export function inferSourceType(filename: string, headers: string[] = []): SourceType {
  const name = filename.toLowerCase()
  
  // 1. Validation Artifacts
  if (
    name.includes('ground_truth') ||
    name.includes('expected_') ||
    name.includes('validation_') ||
    name.includes('_test') ||
    name.endsWith('.schema.json')
  ) {
    return 'validation'
  }

  // 2. Filename heuristics
  if (name.includes('ledger')) return 'ledger'
  if (name.includes('bank')) return 'bank'
  if (name.includes('stripe') || name.includes('psp') || name.includes('adyen') || name.includes('paypal')) return 'psp'
  if (name.includes('erp') || name.includes('netsuite') || name.includes('sap') || name.includes('oracle')) return 'erp'

  // 3. Schema hints
  const h = headers.join(' ').toLowerCase()
  if (h.includes('bank_txn_id')) return 'bank'
  if (h.includes('stripe_id') || (h.includes('gross_amount') && h.includes('net_amount'))) return 'psp'
  if (h.includes('erp_entry_id') || (h.includes('gl_account') && h.includes('posting_date'))) return 'erp'
  if (h.includes('transaction_id') || h.includes('payout_batch_id')) return 'ledger'

  return 'unknown'
}

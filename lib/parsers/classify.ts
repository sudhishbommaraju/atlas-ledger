import { SourceType } from '../types'

/**
 * Returns true if the filename is a validation/test artifact that should NOT
 * be treated as an operational source.
 *
 * Rules (all applied to the lowercased basename without path):
 *   - starts with  ground_truth
 *   - starts with  expected_
 *   - starts with  validation_
 *   - ends with    _schema.json  OR  .schema.json
 *
 * Intentionally NOT matched:
 *   - _test inside a filename like atlas_backend_test_workbook.xlsx
 *   - workbook, dataset, reconciliation, etc.
 */
export function isValidationFile(filename: string): boolean {
  const name = filename.toLowerCase().replace(/\\/g, '/').split('/').pop() ?? filename.toLowerCase()
  return (
    name.startsWith('ground_truth') ||
    name.startsWith('expected_') ||
    name.startsWith('validation_') ||
    name.endsWith('_schema.json') ||
    name.endsWith('.schema.json')
  )
}

export function inferSourceType(filename: string, headers: string[] = []): SourceType {
  const name = filename.toLowerCase()

  // 1. Validation Artifacts — strict prefix/suffix matching only
  if (isValidationFile(filename)) {
    return 'validation'
  }

  // 2. Filename heuristics
  if (name.includes('ledger')) return 'ledger'
  if (name.includes('bank')) return 'bank'
  if (name.includes('stripe') || name.includes('psp') || name.includes('adyen') || name.includes('paypal') || name.includes('refund') || name.includes('chargeback') || name.includes('reserve')) return 'psp'
  if (name.includes('erp') || name.includes('netsuite') || name.includes('sap') || name.includes('oracle')) return 'erp'

  // 3. Schema hints from column headers
  const h = headers.join(' ').toLowerCase()
  if (h.includes('bank_txn_id')) return 'bank'
  if (h.includes('stripe_id') || (h.includes('gross_amount') && h.includes('net_amount'))) return 'psp'
  if (h.includes('erp_entry_id') || (h.includes('gl_account') && h.includes('posting_date'))) return 'erp'
  if (h.includes('transaction_id') || h.includes('payout_batch_id')) return 'ledger'

  return 'unknown'
}

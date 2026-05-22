import { SourceType } from '../types'

export function inferSourceType(filename: string): SourceType {
  const name = filename.toLowerCase()
  if (name.includes('ledger')) return 'ledger'
  if (name.includes('bank')) return 'bank'
  if (name.includes('stripe') || name.includes('psp') || name.includes('adyen') || name.includes('paypal')) return 'psp'
  if (name.includes('erp') || name.includes('netsuite') || name.includes('sap') || name.includes('oracle')) return 'erp'
  return 'unknown'
}

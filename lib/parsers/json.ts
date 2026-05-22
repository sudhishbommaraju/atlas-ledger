import { ParsedRecord, ParseResult } from '../types'
import { normalizeRecord } from './normalize'

export function parseJson(content: string, filename: string): ParseResult {
  const warnings: string[] = []

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    return { records: [], warnings: [], excludedSheets: [], error: 'Invalid JSON: could not parse file.' }
  }

  let rows: Record<string, unknown>[] = []

  if (Array.isArray(parsed)) {
    rows = parsed as Record<string, unknown>[]
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    const dataKey = ['data', 'records', 'transactions', 'items', 'entries', 'rows'].find(
      (k) => Array.isArray(obj[k])
    )
    if (dataKey) {
      rows = obj[dataKey] as Record<string, unknown>[]
    } else {
      warnings.push('JSON root is an object but no known array key found (data/records/transactions). Treating as single record.')
      rows = [obj as Record<string, unknown>]
    }
  }

  const records: ParsedRecord[] = []
  rows.forEach((row, i) => {
    const stringified: Record<string, string> = {}
    Object.entries(row).forEach(([k, v]) => {
      stringified[k.trim().toLowerCase()] = v !== null && v !== undefined ? String(v) : ''
    })
    try {
      records.push(normalizeRecord(stringified, filename, i))
    } catch {
      warnings.push(`Item ${i}: could not normalize — skipped`)
    }
  })

  return { records, warnings, excludedSheets: [] }
}

import Papa from 'papaparse'
import { ParsedRecord, ParseResult } from '../types'
import { normalizeRecord } from './normalize'

export function parseCsv(content: string, filename: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (h) => h.trim().toLowerCase(),
  })

  const warnings: string[] = []
  if (result.errors.length > 0) {
    result.errors.slice(0, 5).forEach((e) => warnings.push(`Row ${e.row}: ${e.message}`))
  }

  const records: ParsedRecord[] = []
  result.data.forEach((row, i) => {
    try {
      const rec = normalizeRecord(row, filename, i)
      records.push(rec)
    } catch {
      warnings.push(`Row ${i + 2}: could not normalize — skipped`)
    }
  })

  if (records.length === 0 && result.data.length > 0) {
    warnings.push('No records could be extracted. Check column names.')
  }

  return { records, warnings }
}

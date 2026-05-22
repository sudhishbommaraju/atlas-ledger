import * as XLSX from 'xlsx'
import { ParsedRecord, ParseResult } from '../types'
import { normalizeRecord } from './normalize'

export function parseXlsx(buffer: Buffer, filename: string): ParseResult {
  const warnings: string[] = []
  const records: ParsedRecord[] = []

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return { records: [], warnings: ['Workbook contains no sheets.'] }
    }
    if (workbook.SheetNames.length > 1) {
      warnings.push(`Only the first sheet ("${sheetName}") was parsed. ${workbook.SheetNames.length - 1} other sheet(s) ignored.`)
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: '',
      raw: false,
    })

    rows.forEach((row, i) => {
      const normalized: Record<string, string> = {}
      Object.entries(row).forEach(([k, v]) => {
        normalized[k.trim().toLowerCase()] = String(v ?? '')
      })
      try {
        records.push(normalizeRecord(normalized, filename, i))
      } catch {
        warnings.push(`Row ${i + 2}: could not normalize — skipped`)
      }
    })

    if (records.length === 0 && rows.length > 0) {
      warnings.push('No records could be extracted. Check column names in the sheet.')
    }
  } catch (err) {
    return { records: [], warnings: [], error: `XLSX parse error: ${(err as Error).message}` }
  }

  return { records, warnings }
}

import * as XLSX from 'xlsx'
import { ParsedRecord, ParseResult } from '../types'
import { normalizeRecord } from './normalize'

export function parseXlsx(buffer: Buffer, filename: string): ParseResult {
  const warnings: string[] = []
  const records: ParsedRecord[] = []

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    
    if (workbook.SheetNames.length === 0) {
      return { records: [], warnings: ['Workbook contains no sheets.'] }
    }
    
    console.log("WORKBOOK SHEETS:", workbook.SheetNames);
    console.log("PARSED SHEETS COUNT:", workbook.SheetNames.length);
    
    // Step 5 - FORCE HARD FAILURE
    if (workbook.SheetNames.length <= 1 && filename === 'atlas_backend_test_workbook.xlsx') {
      throw new Error("Workbook parser failed: only one sheet parsed");
    }

    workbook.SheetNames.forEach(sheetName => {
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
          // Pass sheetName instead of filename so the UI groups by sheet correctly!
          records.push(normalizeRecord(normalized, sheetName, i))
        } catch {
          warnings.push(`Sheet "${sheetName}" Row ${i + 2}: could not normalize — skipped`)
        }
      })
    })

    if (records.length === 0) {
      warnings.push('No records could be extracted from any sheet. Check column names.')
    }
  } catch (err) {
    return { records: [], warnings: [], error: `XLSX parse error: ${(err as Error).message}` }
  }

  return { records, warnings }
}

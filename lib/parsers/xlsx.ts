import * as XLSX from 'xlsx'
import { ParsedRecord, ParseResult } from '../types'
import { normalizeRecord, AMT_KEYS } from './normalize'

function isMetadataSheet(sheetName: string) {
  const value = sheetName.toLowerCase().trim();
  return [
    "validation summary",
    "expected output",
    "readme",
    "summary",
    "instructions",
    "notes",
    "qa",
    "test results",
  ].some((name) => value.includes(name));
}

export function parseXlsx(buffer: Buffer, filename: string): ParseResult {
  const warnings: string[] = []
  const records: ParsedRecord[] = []

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    
    if (workbook.SheetNames.length === 0) {
      return { records: [], warnings: ['Workbook contains no sheets.'] }
    }
    
    // Step 5 - FORCE HARD FAILURE
    if (workbook.SheetNames.length <= 1 && filename === 'atlas_backend_test_workbook.xlsx') {
      throw new Error("Workbook parser failed: only one sheet parsed");
    }

    workbook.SheetNames.forEach(sheetName => {
      if (isMetadataSheet(sheetName)) {
        warnings.push(`Sheet "${sheetName}" marked as metadata only (skipped)`);
        return;
      }

      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
        defval: '',
        raw: false,
      })
      
      if (rows.length === 0) return;

      rows.forEach((row, i) => {
        const normalized: Record<string, string> = {}
        Object.entries(row).forEach(([k, v]) => {
          normalized[k.trim().toLowerCase()] = String(v ?? '')
        })
        
        // Pass sheetName instead of filename so the UI groups by sheet correctly!
        const record = normalizeRecord(normalized, sheetName, i);
        if (!record.valid) {
          record.normalizationWarnings.forEach(w => warnings.push(`Sheet "${sheetName}" Row ${i + 2}: ${w}`));
        }
        records.push(record);
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

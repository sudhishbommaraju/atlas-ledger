import * as XLSX from 'xlsx'
import { ParsedRecord, ParseResult, ExcludedSheet } from '../types'
import { normalizeRecord } from './normalize'

const METADATA_SHEETS = [
  "validation summary",
  "expected output",
  "summary",
  "readme",
  "instructions",
  "notes",
  "qa",
  "test results",
];

function isMetadataSheet(sheetName: string) {
  const value = sheetName.toLowerCase().trim();
  return METADATA_SHEETS.some((name) => value.includes(name));
}

export function parseXlsx(buffer: Buffer, filename: string): ParseResult {
  const warnings: string[] = []
  const records: ParsedRecord[] = []
  const excludedSheets: ExcludedSheet[] = []

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    
    if (workbook.SheetNames.length === 0) {
      return { records: [], warnings: ['Workbook contains no sheets.'], excludedSheets }
    }
    
    workbook.SheetNames.forEach(sheetName => {
      if (isMetadataSheet(sheetName)) {
        excludedSheets.push({
          sheetName,
          reason: "Identified as metadata sheet and explicitly excluded"
        });
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
    return { records: [], warnings: [], excludedSheets: [], error: `XLSX parse error: ${(err as Error).message}` }
  }

  return { records, warnings, excludedSheets }
}

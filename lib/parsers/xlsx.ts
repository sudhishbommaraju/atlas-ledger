import * as XLSX from 'xlsx'
import { ParsedRecord, ExtractedFileResult, ExcludedSheet } from '../types'
import { normalizeRecord } from './normalize'
import { inferSourceType } from './classify'

const METADATA_SHEETS = [
  "validation summary",
  "expected output",
  "summary",
  "readme",
  "instructions",
  "notes",
  "qa",
  "test results",
]

function isMetadataSheet(sheetName: string) {
  const value = sheetName.toLowerCase().trim()
  return METADATA_SHEETS.some((name) => value.includes(name))
}

/**
 * Parse an XLSX workbook.
 *
 * Returns ONE ExtractedFileResult per operational sheet so that the UI can
 * display each sheet separately under "Source Health" with its own row count
 * and source type.  Metadata / excluded sheets are collected globally and
 * attached to every result for UI display.
 */
export function parseXlsx(buffer: Buffer, filename: string): ExtractedFileResult[] {
  const globalExcludedSheets: ExcludedSheet[] = []
  const results: ExtractedFileResult[] = []

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })

    if (workbook.SheetNames.length === 0) {
      return [{
        filename,
        sizeBytes: buffer.length,
        sourceType: inferSourceType(filename),
        records: [],
        warnings: ['Workbook contains no sheets.'],
        excludedSheets: [],
      }]
    }

    for (const sheetName of workbook.SheetNames) {
      if (isMetadataSheet(sheetName)) {
        globalExcludedSheets.push({
          sheetName,
          reason: 'Identified as metadata sheet and explicitly excluded',
        })
        continue
      }

      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
        defval: '',
        raw: false,
      })

      if (rows.length === 0) {
        globalExcludedSheets.push({
          sheetName,
          reason: 'Sheet is empty — skipped',
        })
        continue
      }

      // Infer source type from both the workbook filename and the sheet name.
      // Sheet name takes priority if it gives a non-unknown result, otherwise
      // fall back to the workbook filename heuristic.
      const headers = Object.keys(rows[0]).map((k) => k.toLowerCase())
      const sheetSourceType = inferSourceType(sheetName, headers)
      const fileSourceType = inferSourceType(filename, headers)
      const sourceType = sheetSourceType !== 'unknown' ? sheetSourceType : fileSourceType

      const warnings: string[] = []
      const records: ParsedRecord[] = []

      rows.forEach((row, i) => {
        const normalized: Record<string, string> = {}
        Object.entries(row).forEach(([k, v]) => {
          normalized[k.trim().toLowerCase()] = String(v ?? '')
        })

        const record = normalizeRecord(normalized, `${filename} / ${sheetName}`, i)
        record.sourceType = sourceType
        if (!record.valid) {
          record.normalizationWarnings.forEach((w) =>
            warnings.push(`Sheet "${sheetName}" Row ${i + 2}: ${w}`)
          )
        }
        records.push(record)
      })

      if (records.length === 0) {
        warnings.push(`Sheet "${sheetName}": No records could be extracted. Check column names.`)
      }

      results.push({
        // Display as  "workbook.xlsx / SheetName"
        filename: `${filename} / ${sheetName}`,
        sizeBytes: buffer.length,
        sourceType,
        records,
        warnings,
        excludedSheets: [],
      })
    }

    // Attach the global excluded sheets list to the first result so the UI
    // can surface them.  If all sheets were excluded / empty return a single
    // warning entry.
    if (results.length === 0) {
      return [{
        filename,
        sizeBytes: buffer.length,
        sourceType: inferSourceType(filename),
        records: [],
        warnings: ['No operational records could be extracted from any sheet. Check column names.'],
        excludedSheets: globalExcludedSheets,
      }]
    }

    results[0].excludedSheets = globalExcludedSheets

  } catch (err) {
    return [{
      filename,
      sizeBytes: buffer.length,
      sourceType: inferSourceType(filename),
      records: [],
      warnings: [],
      excludedSheets: [],
      error: `XLSX parse error: ${(err as Error).message}`,
    }]
  }

  return results
}

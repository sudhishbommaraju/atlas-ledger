import fs from 'fs'
import path from 'path'
import { parseXlsx } from './lib/parsers/xlsx'
import { buildCanonicalResults } from './lib/engine'

const buffer = fs.readFileSync(path.join('atlas-ledger', 'frontend', 'test_data', 'atlas_backend_test_workbook.xlsx'))

// parseXlsx now returns ExtractedFileResult[] — one entry per sheet
const sheetResults = parseXlsx(buffer, 'atlas_backend_test_workbook.xlsx')

const allRecords = sheetResults.flatMap(r => r.records)
const allWarnings = sheetResults.flatMap(r => r.warnings)
const allExcludedSheets = sheetResults.flatMap(r => r.excludedSheets)

console.log('Sheets parsed:', sheetResults.length)
console.log('Total Records Parsed:', allRecords.length)
console.log('Warnings:', allWarnings)

const sources = new Set(allRecords.map(r => r.source))
console.log('Sources:', Array.from(sources))

const parserWarnings = allWarnings.map(w => ({ sourceName: 'atlas_backend_test_workbook.xlsx', message: w }))

const canonical = buildCanonicalResults(allRecords, parserWarnings, allExcludedSheets, 'test')

console.log(`\nReconciliation Summary:`)
console.log(`Matches: ${canonical.metrics.matched}`)
console.log(`Partials: ${canonical.metrics.partial}`)
console.log(`Timing Drifts: ${canonical.metrics.timingDrift}`)
console.log(`Duplicates: ${canonical.metrics.duplicates}`)
console.log(`Unmatched: ${canonical.metrics.unmatched}`)
console.log(`Exceptions: ${canonical.metrics.exceptions}`)

console.log(`\nMatch Rate: ${canonical.matchRate.toFixed(2)}%`)

console.log(`\nDisbursable Funds:`, canonical.disbursableBreakdown)

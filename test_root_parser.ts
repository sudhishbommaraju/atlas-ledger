import fs from 'fs'
import path from 'path'
import { parseXlsx } from './lib/parsers/xlsx'
import { buildCanonicalResults } from './lib/engine'

const buffer = fs.readFileSync(path.join('atlas-ledger', 'frontend', 'test_data', 'atlas_backend_test_workbook.xlsx'))
const result = parseXlsx(buffer, 'atlas_backend_test_workbook.xlsx')

console.log('Total Records Parsed:', result.records.length)
console.log('Warnings:', result.warnings)

const sources = new Set(result.records.map(r => r.source))
console.log('Sources:', Array.from(sources))

const parserWarnings = result.warnings.map(w => ({ sourceName: 'atlas_backend_test_workbook.xlsx', message: w }))

const canonical = buildCanonicalResults(result.records, parserWarnings, result.excludedSheets || [], 'test')

console.log(`\nReconciliation Summary:`)
console.log(`Matches: ${canonical.metrics.matched}`)
console.log(`Partials: ${canonical.metrics.partial}`)
console.log(`Timing Drifts: ${canonical.metrics.timingDrift}`)
console.log(`Duplicates: ${canonical.metrics.duplicates}`)
console.log(`Unmatched: ${canonical.metrics.unmatched}`)
console.log(`Exceptions: ${canonical.metrics.exceptions}`)

console.log(`\nMatch Rate: ${canonical.matchRate.toFixed(2)}%`)

console.log(`\nDisbursable Funds:`, canonical.disbursableBreakdown)

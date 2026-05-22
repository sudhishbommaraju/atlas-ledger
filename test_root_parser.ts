import fs from 'fs'
import path from 'path'
import { parseXlsx } from './lib/parsers/xlsx'
import { runReconciliation, calcDisbursable } from './lib/engine'

const buffer = fs.readFileSync(path.join('atlas-ledger', 'frontend', 'test_data', 'atlas_backend_test_workbook.xlsx'))
const result = parseXlsx(buffer, 'atlas_backend_test_workbook.xlsx')

console.log('Total Records Parsed:', result.records.length)
console.log('Warnings:', result.warnings)

const sources = new Set(result.records.map(r => r.source))
console.log('Sources:', Array.from(sources))

const matchResults = runReconciliation(result.records)
const duplicateCount = matchResults.filter(r => r.status === 'duplicate').length;
const matchCount = matchResults.filter(r => r.status === 'matched').length;
const partialCount = matchResults.filter(r => r.status === 'partial').length;
const unmatchedCount = matchResults.filter(r => r.status === 'unmatched').length;
const timingDriftCount = matchResults.filter(r => r.status === 'timing_drift').length;

console.log(`\nReconciliation Summary:`)
console.log(`Matches: ${matchCount}`)
console.log(`Partials: ${partialCount}`)
console.log(`Timing Drifts: ${timingDriftCount}`)
console.log(`Duplicates: ${duplicateCount}`)
console.log(`Unmatched: ${unmatchedCount}`)

const disbursable = calcDisbursable(result.records, matchResults);
console.log(`\nDisbursable Funds:`, disbursable)

import fs from 'fs'
import path from 'path'
import { parseXlsx } from './lib/parsers/xlsx'

const buffer = fs.readFileSync(path.join('atlas-ledger', 'frontend', 'test_data', 'atlas_backend_test_workbook.xlsx'))
const result = parseXlsx(buffer, 'atlas_backend_test_workbook.xlsx')

console.log('Total Records:', result.records.length)
console.log('Warnings:', result.warnings)

const sources = new Set(result.records.map(r => r.source))
console.log('Sources:', Array.from(sources))

import fs from 'fs'
import { parseCsv } from './lib/parsers/csv'

const ledgerContent = fs.readFileSync('c:/Users/srira/OneDrive/Desktop/Atlas/extracted_dataset/internal_ledger.csv', 'utf8')
const bankContent = fs.readFileSync('c:/Users/srira/OneDrive/Desktop/Atlas/extracted_dataset/bank_statement.csv', 'utf8')
const stripeContent = fs.readFileSync('c:/Users/srira/OneDrive/Desktop/Atlas/extracted_dataset/stripe_payouts.csv', 'utf8')
const erpContent = fs.readFileSync('c:/Users/srira/OneDrive/Desktop/Atlas/extracted_dataset/erp_export.csv', 'utf8')

console.log('--- Ledger ---')
console.log('Headers:', ledgerContent.split('\n')[0])
console.log('Row 1:', ledgerContent.split('\n')[1])
console.log('Row 2:', ledgerContent.split('\n')[2])

console.log('\n--- Bank ---')
console.log('Headers:', bankContent.split('\n')[0])
console.log('Row 1:', bankContent.split('\n')[1])
console.log('Row 2:', bankContent.split('\n')[2])

console.log('\n--- Stripe ---')
console.log('Headers:', stripeContent.split('\n')[0])
console.log('Row 1:', stripeContent.split('\n')[1])
console.log('Row 2:', stripeContent.split('\n')[2])

console.log('\n--- ERP ---')
console.log('Headers:', erpContent.split('\n')[0])
console.log('Row 1:', erpContent.split('\n')[1])
console.log('Row 2:', erpContent.split('\n')[2])

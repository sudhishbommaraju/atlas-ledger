import fs from 'fs';
import path from 'path';
import { parseWorkbook } from './src/lib/reconciliation/parser';
import { reconcileTransactions } from './src/lib/reconciliation/engine';

const testDir = path.resolve('test_data');
const csvFiles = [
  'internal_ledger.csv',
  'stripe_settlements.csv',
  'adyen_settlements.csv',
  'bank_statement.csv',
  'erp_export.csv',
  'refunds.csv',
  'reserves.csv',
  'chargebacks.csv'
];

async function runTest() {
  console.log("=== Testing Multiple CSVs ===");
  let allCsvTransactions = [];
  for (const file of csvFiles) {
    const buffer = fs.readFileSync(path.join(testDir, file));
    const parsed = parseWorkbook(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer, file);
    allCsvTransactions.push(...parsed.transactions);
  }
  
  const csvRecon = reconcileTransactions(allCsvTransactions);
  console.log("CSV Reconciliation Summary:", csvRecon.summary);

  console.log("\n=== Testing Single XLSX ===");
  const xlsxBuffer = fs.readFileSync(path.join(testDir, 'atlas_backend_test_workbook.xlsx'));
  const parsedXlsx = parseWorkbook(xlsxBuffer.buffer.slice(xlsxBuffer.byteOffset, xlsxBuffer.byteOffset + xlsxBuffer.byteLength) as ArrayBuffer, 'atlas_backend_test_workbook.xlsx');
  
  const xlsxRecon = reconcileTransactions(parsedXlsx.transactions);
  console.log("XLSX Reconciliation Summary:", xlsxRecon.summary);
}

runTest();


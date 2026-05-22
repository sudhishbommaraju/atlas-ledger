import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const numRecords = 120;
const today = new Date();

function randomDate(offsetDays) {
  const d = new Date(today);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
}

const ledger = [];
const stripe = [];
const adyen = [];
const bank = [];
const erp = [];
const refunds = [];
const reserves = [];
const chargebacks = [];

for (let i = 1; i <= numRecords; i++) {
  const id = `TXN-${String(i).padStart(5, '0')}`;
  const amount = parseFloat((Math.random() * 1000 + 10).toFixed(2));
  const fee = parseFloat((amount * 0.029 + 0.3).toFixed(2));
  const netAmount = parseFloat((amount - fee).toFixed(2));
  const date = randomDate(Math.floor(Math.random() * 30));
  const dateStr = date;
  const isStripe = i % 2 === 0;

  // Ledger (all 120)
  ledger.push({
    transaction_id: id,
    amount: amount,
    currency: 'USD',
    date: dateStr,
    description: `Purchase ${id}`,
    status: 'completed',
  });

  // ERP (all 120)
  erp.push({
    external_id: id,
    net_amount: amount, // The engine matches on exact amount, let's keep amount consistent
    currency: 'USD',
    effective_date: dateStr,
    memo: `Sale ${id}`,
  });

  // PSPs (split between Stripe and Adyen)
  if (isStripe) {
    stripe.push({
      payment_id: id,
      amount: amount,
      currency: 'USD',
      date: dateStr,
      description: `Stripe charge ${id}`,
      fee: fee,
      status: 'paid',
    });
  } else {
    adyen.push({
      payment_id: id,
      amount: amount,
      currency: 'USD',
      date: dateStr,
      description: `Adyen charge ${id}`,
      fee: fee,
      status: 'settled',
    });
  }

  // Bank (Matches all 120, maybe some timing drift)
  const drift = i % 10 === 0 ? 2 : 0; // Every 10th record has a 2 day drift
  bank.push({
    bank_reference: id,
    credit: amount,
    debit: '',
    currency: 'USD',
    posted_at: randomDate(Math.floor(Math.random() * 30) - drift), 
    narrative: `Bank deposit for ${id}`,
  });

  // Refunds (10 records)
  if (i > 100 && i <= 110) {
    refunds.push({
      reference: id,
      amount: -amount, // refunds are negative or engine uses absolute value
      currency: 'USD',
      date: dateStr,
      description: `Refund for ${id}`,
    });
  }

  // Reserves (5 records)
  if (i > 110 && i <= 115) {
    reserves.push({
      reference: id,
      reserve_hold: amount,
      currency: 'USD',
      date: dateStr,
      description: `Reserve hold for ${id}`,
    });
  }

  // Chargebacks (5 records)
  if (i > 115 && i <= 120) {
    chargebacks.push({
      reference: id,
      amount: -amount,
      currency: 'USD',
      date: dateStr,
      description: `Chargeback for ${id}`,
    });
  }
}

const outDir = path.resolve('test_data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Convert JSON to CSV using XLSX
const sheets = {
  'internal_ledger': ledger,
  'stripe_settlements': stripe,
  'adyen_settlements': adyen,
  'bank_statement': bank,
  'erp_export': erp,
  'refunds': refunds,
  'reserves': reserves,
  'chargebacks': chargebacks,
};

const wb = XLSX.utils.book_new();

for (const [name, data] of Object.entries(sheets)) {
  const ws = XLSX.utils.json_to_sheet(data);
  // Add to workbook
  XLSX.utils.book_append_sheet(wb, ws, name);
  
  // Write CSV
  const csv = XLSX.utils.sheet_to_csv(ws);
  fs.writeFileSync(path.join(outDir, `${name}.csv`), csv);
}

// Write XLSX
XLSX.writeFile(wb, path.join(outDir, 'atlas_backend_test_workbook.xlsx'));

console.log(`Generated 8 CSV files and 1 XLSX file in ${outDir}`);

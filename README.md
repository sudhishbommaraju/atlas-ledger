# Atlas Ledger

Payout reconciliation and settlement operations platform.

## Features

- Upload settlement files: CSV, XLSX, JSON, TXT, MT940, PDF, DOCX
- Deterministic reconciliation engine: exact match, partial match, unmatched, duplicate, timing drift, eligibility hold
- Disbursable funds waterfall: gross settled minus fees, refunds, chargebacks, reserves, and unresolved exceptions
- Per-row exception detail drawer with raw fields and recommended actions
- CSV report export

## Pages

- `/reconciliation` — Upload files and run reconciliation
- `/disbursable-funds` — Net funds breakdown
- `/exceptions` — All non-matched records
- `/reports` — Download reconciliation report

## Local dev

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

No environment variables required.

## Deploy to Vercel

Connect the GitHub repo to Vercel — no configuration needed. Or use the CLI:

```bash
npx vercel --prod
```

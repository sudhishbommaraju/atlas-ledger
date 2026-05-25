import fs from 'fs'
import { parseZip } from './lib/parsers/zip'
import { buildCanonicalResults } from './lib/engine'

async function diagnose() {
  const zipBuffer = fs.readFileSync('c:/Users/srira/OneDrive/Desktop/Atlas/atlas_reconciliation_dataset.zip')
  const files = await parseZip(zipBuffer, 'atlas_reconciliation_dataset.zip')

  console.log(`Parsed ${files.length} files from zip:`)
  const allRecords = []
  for (const f of files) {
    console.log(`- ${f.filename}: ${f.records.length} records, sourceType: ${f.sourceType}, error: ${f.error || 'none'}`)
    allRecords.push(...f.records)
  }

  const results = buildCanonicalResults(allRecords, [], [], 'diag-run')

  console.log(`\nReconciliation Results:`)
  console.log(`- Match Rate: ${results.matchRate.toFixed(2)}%`)
  console.log(`- Matched: ${results.metrics.matched}`)
  console.log(`- Partial: ${results.metrics.partial}`)
  console.log(`- Timing Drift: ${results.metrics.timingDrift}`)
  console.log(`- Unmatched (from metrics): ${results.metrics.unmatched}`)
  console.log(`- Exceptions (from metrics): ${results.metrics.exceptions}`)
  console.log(`- Duplicate: ${results.metrics.duplicates}`)
  console.log(`- Ignored: ${results.metrics.ignored}`)
  console.log(`- Validation Assets: ${results.metrics.validationAssets}`)
}

diagnose().catch(console.error)

import fs from 'fs'
import { parseZip } from './lib/parsers/zip'

function parseAndNormalizeDate(d: string): string {
  if (!d) return ''
  const trimmed = d.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.split('T')[0]
  }
  const dd_mm_yyyy_match = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (dd_mm_yyyy_match) {
    const day = dd_mm_yyyy_match[1].padStart(2, '0')
    const month = dd_mm_yyyy_match[2].padStart(2, '0')
    const year = dd_mm_yyyy_match[3]
    return `${year}-${month}-${day}`
  }
  const mm_dd_yyyy_match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mm_dd_yyyy_match) {
    const month = mm_dd_yyyy_match[1].padStart(2, '0')
    const day = mm_dd_yyyy_match[2].padStart(2, '0')
    const year = mm_dd_yyyy_match[3]
    return `${year}-${month}-${day}`
  }
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }
  return trimmed
}

function canonicalReference(value?: string) {
  let v = String(value ?? "").trim().toLowerCase()
  v = v.replace(/[\s\-_]/g, "")
  v = v.replace(/^(ref|txn|po|payout)/, "")
  return v
}

function canonicalPayee(value?: string) {
  let v = String(value ?? "").trim().toLowerCase()
  v = v.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
  v = v.replace(/\b(inc|llc|ltd|corp|co|company)\b/g, "")
  v = v.replace(/\s+/g, "")
  return v
}

async function run() {
  const zipBuffer = fs.readFileSync('c:/Users/srira/OneDrive/Desktop/Atlas/atlas_reconciliation_dataset.zip')
  const files = await parseZip(zipBuffer, 'atlas_reconciliation_dataset.zip')

  const allRecords = []
  for (const f of files) {
    if (f.sourceType !== 'validation') {
      allRecords.push(...f.records)
    }
  }

  const canonical = allRecords.map(r => {
    const raw = r.raw
    let reference = raw.reference || raw.ref || ''
    if (!reference) {
      reference = r.reference
    }

    let amt = r.amount
    if (raw.net_amount !== undefined) {
      amt = parseFloat(raw.net_amount.replace(/[^0-9.\-]/g, ''))
    } else if (raw.amount !== undefined) {
      amt = parseFloat(raw.amount.replace(/[^0-9.\-]/g, ''))
    }
    
    const payee = raw.payee || raw.merchant || raw.vendor_name || raw.vendorname || ''

    return {
      id: r.id,
      sourceFile: r.source,
      sourceType: r.sourceType || 'unknown',
      reference,
      normalizedReference: canonicalReference(reference),
      date: r.date,
      normalizedDate: parseAndNormalizeDate(r.date),
      amount: amt,
      amountAbs: Math.abs(amt),
      currency: (r.currency || 'USD').toUpperCase(),
      payee,
      normalizedPayee: canonicalPayee(payee)
    }
  })

  // Duplicate detection (Same Source)
  const bySource = new Map<string, typeof canonical>()
  for (const c of canonical) {
    if (!bySource.has(c.sourceFile)) bySource.set(c.sourceFile, [])
    bySource.get(c.sourceFile)!.push(c)
  }

  const uniqueOperational = []
  let duplicateCount = 0

  for (const [source, records] of bySource) {
    const visited = new Set<string>()
    for (let i = 0; i < records.length; i++) {
      if (visited.has(records[i].id)) continue
      
      const p = records[i]
      const dups = [p]
      
      for (let j = i + 1; j < records.length; j++) {
        if (visited.has(records[j].id)) continue
        const c = records[j]
        
        if (p.currency === c.currency && p.amountAbs === c.amountAbs && p.normalizedDate === c.normalizedDate) {
          if (
            (p.normalizedReference && p.normalizedReference === c.normalizedReference) ||
            (p.normalizedPayee && p.normalizedPayee === c.normalizedPayee)
          ) {
            dups.push(c)
            visited.add(c.id)
          }
        }
      }
      
      visited.add(p.id)
      if (dups.length > 1) {
        duplicateCount += (dups.length - 1)
      }
      uniqueOperational.push(p) // Keep the first occurrence
    }
  }

  console.log(`Deduplication:`)
  console.log(`- Total original records: ${canonical.length}`)
  console.log(`- Unique operational records: ${uniqueOperational.length}`)
  console.log(`- Duplicates found: ${duplicateCount}`)
}

run().catch(console.error)

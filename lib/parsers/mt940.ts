import { ParsedRecord, ParseResult } from '../types'

function makeId(source: string, ref: string, amount: number, index: number): string {
  const str = `${source}|${ref}|${amount}|${index}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

function parseMt940(content: string, filename: string): ParseResult {
  const warnings: string[] = []
  const records: ParsedRecord[] = []

  // :61: value date, entry date, D/C mark, amount, transaction type, reference
  // Format: :61:VDEDCAMOUNNTYPREF
  const statementLineRe = /:61:(\d{6})(\d{0,4})([CD])(\d+[,\.]\d{0,2})([A-Z]{4})([^\n:]*)/g
  const infoRe = /:86:([\s\S]*?)(?=:\d{2}[A-Z]?:|$)/g

  const infoBlocks: string[] = []
  let m
  while ((m = infoRe.exec(content)) !== null) {
    infoBlocks.push(m[1].replace(/\s+/g, ' ').trim())
  }

  let idx = 0
  while ((m = statementLineRe.exec(content)) !== null) {
    const [, valDate, , dcMark, amtStr, , refRaw] = m
    const rawAmount = parseFloat(amtStr.replace(',', '.'))
    const amount = dcMark === 'D' ? -rawAmount : rawAmount
    const reference = refRaw.trim() || `MT940-${idx + 1}`
    const description = infoBlocks[idx] || ''
    const dateStr = valDate.length === 6 ? `20${valDate.slice(0, 2)}-${valDate.slice(2, 4)}-${valDate.slice(4, 6)}` : ''

    records.push({
      id: makeId(filename, reference, amount, idx),
      source: filename,
      reference,
      description,
      amount,
      currency: 'EUR',
      date: dateStr,
      type: amount > 0 ? 'settlement' : 'fee',
      raw: { raw_line: m[0], description },
      valid: true,
      normalizationWarnings: [],
    })
    idx++
  }

  if (records.length === 0) {
    // Try generic TXT line parsing as fallback
    return parseTxt(content, filename)
  }

  return { records, warnings }
}

function parseTxt(content: string, filename: string): ParseResult {
  const warnings: string[] = []
  const records: ParsedRecord[] = []

  // Match lines like: 2024-01-15  TXN-12345  Settlement  1234.56
  const lineRe = /(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{8})\s+([\w\-#]+)\s+(.*?)\s+([-+]?\d[\d,\.]*\d)\s*([A-Z]{3})?/

  const lines = content.split('\n')
  let matched = 0
  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return

    const m = lineRe.exec(trimmed)
    if (m) {
      const [, dateRaw, reference, description, amtStr, ccy] = m
      const amount = parseFloat(amtStr.replace(/,/g, ''))
      records.push({
        id: makeId(filename, reference, amount, i),
        source: filename,
        reference,
        description: description.trim(),
        amount,
        currency: ccy || 'USD',
        date: dateRaw,
        type: amount >= 0 ? 'settlement' : 'fee',
        raw: { raw_line: trimmed },
        valid: true,
        normalizationWarnings: [],
      })
      matched++
    }
  })

  if (matched === 0) {
    warnings.push('Could not detect structured rows. File treated as text evidence.')
    return {
      records: [],
      warnings: ['TXT file could not be parsed as structured data. Uploaded as document evidence.'],
    }
  }

  return { records, warnings }
}

export function parseMt940OrTxt(content: string, filename: string): ParseResult {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'mt940' || content.includes(':60F:') || content.includes(':61:')) {
    return parseMt940(content, filename)
  }
  return parseTxt(content, filename)
}

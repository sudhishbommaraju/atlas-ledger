import { ExtractedFileResult } from '../types'
import { parseCsv } from './csv'
import { parseXlsx } from './xlsx'
import { parseJson } from './json'
import { parseMt940OrTxt } from './mt940'
import { parseFallback } from './fallback'
import { parseZip } from './zip'
import { inferSourceType } from './classify'
import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE_MB } from '../constants'

export function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : ''
}

export function validateFile(filename: string, sizeBytes: number): string | null {
  const ext = getExtension(filename)
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type "${ext}". Accepted: ${SUPPORTED_EXTENSIONS.join(', ')}`
  }
  if (sizeBytes > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`
  }
  return null
}

export async function parseFile(buffer: Buffer, filename: string): Promise<ExtractedFileResult[]> {
  const ext = getExtension(filename)

  if (ext === '.zip') {
    return parseZip(buffer, filename)
  }

  let parsed
  try {
    switch (ext) {
      case '.csv':
        parsed = parseCsv(buffer.toString('utf-8'), filename)
        break
      case '.xlsx':
        parsed = parseXlsx(buffer, filename)
        break
      case '.json':
        parsed = parseJson(buffer.toString('utf-8'), filename)
        break
      case '.txt':
      case '.mt940':
        parsed = parseMt940OrTxt(buffer.toString('utf-8'), filename)
        break
      case '.pdf':
      case '.docx':
        parsed = parseFallback(filename)
        break
      default:
        parsed = { records: [], warnings: [], excludedSheets: [], error: `No parser available for extension "${ext}".` }
    }
  } catch (err) {
    parsed = {
      records: [],
      warnings: [],
      excludedSheets: [],
      error: `Parse error: ${(err as Error).message}`,
    }
  }

  const sourceType = inferSourceType(filename)
  parsed.records.forEach(r => {
    r.sourceType = sourceType
  })

  return [{
    ...parsed,
    filename,
    sizeBytes: buffer.length,
    sourceType
  }]
}

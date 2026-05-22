import { ParseResult } from '../types'
import { parseCsv } from './csv'
import { parseXlsx } from './xlsx'
import { parseJson } from './json'
import { parseMt940OrTxt } from './mt940'
import { parseFallback } from './fallback'

export const SUPPORTED_EXTENSIONS = ['.csv', '.xlsx', '.json', '.txt', '.mt940', '.pdf', '.docx']
export const MAX_FILE_SIZE_MB = 50

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

export async function parseFile(buffer: Buffer, filename: string): Promise<ParseResult> {
  const ext = getExtension(filename)

  try {
    switch (ext) {
      case '.csv':
        return parseCsv(buffer.toString('utf-8'), filename)
      case '.xlsx':
        return parseXlsx(buffer, filename)
      case '.json':
        return parseJson(buffer.toString('utf-8'), filename)
      case '.txt':
      case '.mt940':
        return parseMt940OrTxt(buffer.toString('utf-8'), filename)
      case '.pdf':
      case '.docx':
        return parseFallback(filename)
      default:
        return { records: [], warnings: [], error: `No parser available for extension "${ext}".` }
    }
  } catch (err) {
    return {
      records: [],
      warnings: [],
      error: `Parse error: ${(err as Error).message}`,
    }
  }
}

import AdmZip from 'adm-zip'
import { ExtractedFileResult, ParseResult } from '../types'
import { parseCsv } from './csv'
import { parseXlsx } from './xlsx'
import { parseJson } from './json'
import { parseMt940OrTxt } from './mt940'
import { parseFallback } from './fallback'
import { getExtension } from './index'
import { MAX_FILE_SIZE_MB, SUPPORTED_EXTENSIONS } from '../constants'
import { inferSourceType } from './classify'

export async function parseZip(buffer: Buffer, archiveFilename: string): Promise<ExtractedFileResult[]> {
  const results: ExtractedFileResult[] = []

  try {
    const zip = new AdmZip(buffer)
    const zipEntries = zip.getEntries()

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue

      const filename = entry.entryName.split('/').pop() || entry.entryName
      if (filename.startsWith('__MACOSX') || filename.startsWith('.')) continue

      const ext = getExtension(filename)
      if (ext === '.zip') {
        results.push({
          filename,
          archiveName: archiveFilename,
          sizeBytes: entry.header.size,
          sourceType: 'unknown',
          records: [],
          warnings: [],
          excludedSheets: [],
          error: 'Nested ZIP archives are not supported for security reasons.',
        })
        continue
      }

      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        continue // silently skip unsupported types
      }

      if (entry.header.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        results.push({
          filename,
          archiveName: archiveFilename,
          sizeBytes: entry.header.size,
          sourceType: inferSourceType(filename),
          records: [],
          warnings: [],
          excludedSheets: [],
          error: `File exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
        })
        continue
      }

      // Zip-bomb guard
      if (entry.header.compressedSize > 0) {
        const ratio = entry.header.size / entry.header.compressedSize
        if (ratio > 100 && entry.header.size > 10 * 1024 * 1024) {
          results.push({
            filename,
            archiveName: archiveFilename,
            sizeBytes: entry.header.size,
            sourceType: 'unknown',
            records: [],
            warnings: [],
            excludedSheets: [],
            error: 'File rejected due to suspiciously high compression ratio (potential zip bomb).',
          })
          continue
        }
      }

      const entryBuffer = zip.readFile(entry)
      if (!entryBuffer) {
        results.push({
          filename,
          archiveName: archiveFilename,
          sizeBytes: entry.header.size,
          sourceType: 'unknown',
          records: [],
          warnings: [],
          excludedSheets: [],
          error: 'Failed to extract file.',
        })
        continue
      }

      // ── XLSX: returns one result per sheet ──────────────────────────────────
      if (ext === '.xlsx') {
        const sheetResults = parseXlsx(entryBuffer, filename)
        for (const r of sheetResults) {
          results.push({ ...r, archiveName: archiveFilename })
        }
        continue
      }

      // ── All other formats: single ParseResult ───────────────────────────────
      let parsed: ParseResult
      switch (ext) {
        case '.csv':
          parsed = parseCsv(entryBuffer.toString('utf-8'), filename)
          break
        case '.json':
          parsed = parseJson(entryBuffer.toString('utf-8'), filename)
          break
        case '.txt':
        case '.mt940':
          parsed = parseMt940OrTxt(entryBuffer.toString('utf-8'), filename)
          break
        case '.pdf':
        case '.docx':
          parsed = parseFallback(filename)
          break
        default:
          parsed = {
            records: [],
            warnings: [],
            excludedSheets: [],
            error: `No parser available for extension "${ext}".`,
          }
      }

      const sourceType = inferSourceType(filename)
      parsed.records.forEach((r) => {
        r.sourceType = sourceType
      })

      results.push({
        ...parsed,
        filename,
        archiveName: archiveFilename,
        sizeBytes: entry.header.size,
        sourceType,
      })
    }
  } catch (err) {
    results.push({
      filename: archiveFilename,
      sizeBytes: buffer.length,
      sourceType: 'unknown',
      records: [],
      warnings: [],
      excludedSheets: [],
      error: `ZIP Error: ${(err as Error).message}`,
    })
  }

  return results
}

import { ParseResult } from '../types'

export function parseFallback(filename: string): ParseResult {
  return {
    records: [],
    warnings: [
      `Document "${filename}" uploaded as evidence. Automatic parsing is not available for this file format. The file has been logged for manual review.`,
    ],
    excludedSheets: [],
  }
}

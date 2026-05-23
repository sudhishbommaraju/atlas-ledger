'use client'

import { create } from 'zustand'
import { CanonicalResults, FileStatus, ParsedRecord, UploadedFile, ExcludedSheet } from '@/lib/types'
import { buildCanonicalResults } from '@/lib/engine'

type ReconState = {
  files: UploadedFile[]
  results: CanonicalResults | null
  excludedSheets: ExcludedSheet[]
  hasRun: boolean

  addFile: (file: UploadedFile) => void
  updateFileStatus: (id: string, status: FileStatus, records?: ParsedRecord[], warnings?: string[], error?: string, excludedSheets?: ExcludedSheet[]) => void
  removeFile: (id: string) => void
  addExcludedSheets: (sheets: ExcludedSheet[]) => void
  runReconciliation: () => void
  reset: () => void
}

/** Files that are NOT validation assets */
function operationalFiles(files: UploadedFile[]): UploadedFile[] {
  return files.filter((f) => f.sourceType !== 'validation')
}

/** Files that ARE validation assets */
function validationFiles(files: UploadedFile[]): UploadedFile[] {
  return files.filter((f) => f.sourceType === 'validation')
}

/**
 * Run Reconciliation is enabled when:
 *  - At least 2 operational sources have finished parsing (parsed or warning)
 *  - At least one of those sources has records (rowCount > 0)
 *  - No fatal in-progress states remain (pending/parsing)
 */
function canRun(files: UploadedFile[]): boolean {
  const ops = operationalFiles(files)
  const ready = ops.filter((f) => f.status === 'parsed' || f.status === 'warning')
  const parsing = ops.filter((f) => f.status === 'pending' || f.status === 'parsing')
  if (parsing.length > 0) return false             // still uploading
  if (ready.length < 2) return false               // need at least 2 sources
  if (!ready.some((f) => f.recordCount > 0)) return false  // need at least 1 non-empty source
  return true
}

/** Human-readable reason why Run Reconciliation is disabled (used by button console.warn) */
export function canRunReason(files: UploadedFile[]): string {
  const ops = operationalFiles(files)
  const parsing = ops.filter((f) => f.status === 'pending' || f.status === 'parsing')
  if (parsing.length > 0) return `Still parsing ${parsing.length} file(s)`
  const ready = ops.filter((f) => f.status === 'parsed' || f.status === 'warning')
  if (ready.length < 2) return `Need at least 2 operational sources (have ${ready.length})`
  if (!ready.some((f) => f.recordCount > 0)) return 'All operational sources have 0 rows'
  return 'Unknown reason'
}

export const useReconStore = create<ReconState>((set, get) => ({
  files: [],
  results: null,
  excludedSheets: [],
  hasRun: false,

  addFile: (file) => set((s) => ({ files: [...s.files, file] })),

  updateFileStatus: (id, status, records = [], warnings = [], error, excludedSheets = []) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === id
          ? { ...f, status, records, warnings, recordCount: records.length, error }
          : f
      ),
      excludedSheets: [...s.excludedSheets, ...excludedSheets],
    })),

  removeFile: (id) =>
    set((s) => ({
      files: s.files.filter((f) => f.id !== id),
      results: null,
      hasRun: false,
      excludedSheets: s.files.length === 1 ? [] : s.excludedSheets,
    })),

  addExcludedSheets: (sheets) =>
    set((s) => ({
      excludedSheets: [...s.excludedSheets, ...sheets],
    })),

  runReconciliation: () => {
    const { files, excludedSheets } = get()

    const canRunNow = canRun(files)
    if (!canRunNow) {
      console.warn('[Atlas] Run Reconciliation blocked:', canRunReason(files))
      return
    }

    // Only pass operational records to the engine.
    // The engine handles validation-typed records separately via sourceType.
    const allRecords = files.flatMap((f) => f.records)
    const parserWarnings = files.flatMap((f) =>
      f.warnings.map((msg) => ({ sourceName: f.name, message: msg }))
    )

    const results = buildCanonicalResults(
      allRecords,
      parserWarnings,
      excludedSheets,
      `run-${Date.now()}`
    )

    set({ results, hasRun: true })
  },

  reset: () => set({ files: [], results: null, excludedSheets: [], hasRun: false }),
}))

// Re-export helpers so the demo page can use them directly
export { operationalFiles, validationFiles, canRun }

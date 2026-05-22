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
  runReconciliation: () => void
  reset: () => void
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
      // Just a simple hack: if all files removed, reset sheets.
      excludedSheets: s.files.length === 1 ? [] : s.excludedSheets
    })),

  runReconciliation: () => {
    const { files, excludedSheets } = get()
    const allRecords = files.flatMap((f) => f.records)
    const parserWarnings = files.flatMap((f) => 
      f.warnings.map(msg => ({ sourceName: f.name, message: msg }))
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

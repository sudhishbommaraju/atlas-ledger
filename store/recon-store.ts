'use client'

import { create } from 'zustand'
import { DisbursableFunds, FileStatus, MatchResult, ParsedRecord, UploadedFile } from '@/lib/types'
import { runReconciliation, calcDisbursable } from '@/lib/engine'

type ReconState = {
  files: UploadedFile[]
  matchResults: MatchResult[]
  disbursable: DisbursableFunds | null
  hasRun: boolean

  addFile: (file: UploadedFile) => void
  updateFileStatus: (id: string, status: FileStatus, records?: ParsedRecord[], warnings?: string[], error?: string) => void
  removeFile: (id: string) => void
  runReconciliation: () => void
  reset: () => void
}

const emptyDisbursable: DisbursableFunds = {
  grossSettled: 0, fees: 0, refunds: 0, chargebacks: 0, reserves: 0, unresolved: 0, available: 0, currency: 'USD'
}

export const useReconStore = create<ReconState>((set, get) => ({
  files: [],
  matchResults: [],
  disbursable: null,
  hasRun: false,

  addFile: (file) => set((s) => ({ files: [...s.files, file] })),

  updateFileStatus: (id, status, records = [], warnings = [], error) =>
    set((s) => ({
      files: s.files.map((f) =>
        f.id === id
          ? { ...f, status, records, warnings, recordCount: records.length, error }
          : f
      ),
    })),

  removeFile: (id) =>
    set((s) => ({
      files: s.files.filter((f) => f.id !== id),
      matchResults: [],
      disbursable: null,
      hasRun: false,
    })),

  runReconciliation: () => {
    const { files } = get()
    const allRecords = files.flatMap((f) => f.records)
    const matchResults = runReconciliation(allRecords)
    const disbursable = allRecords.length > 0 ? calcDisbursable(allRecords, matchResults) : emptyDisbursable
    set({ matchResults, disbursable, hasRun: true })
  },

  reset: () => set({ files: [], matchResults: [], disbursable: null, hasRun: false }),
}))

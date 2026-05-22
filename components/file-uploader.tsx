'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { useReconStore } from '@/store/recon-store'
import { MAX_FILE_SIZE_MB } from '@/lib/parsers/index'
import { ExcludedSheet, FileStatus, ParsedRecord, UploadedFile } from '@/lib/types'

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

type UpdateFileFn = (
  id: string,
  status: FileStatus,
  records?: ParsedRecord[],
  warnings?: string[],
  error?: string,
  excludedSheets?: ExcludedSheet[]
) => void

async function uploadAndParse(file: File, fileId: string, updateFileStatus: UpdateFileFn) {
  updateFileStatus(fileId, 'parsing')

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/parse', { method: 'POST', body: formData })
    const data = await res.json()

    if (data.error) {
      updateFileStatus(fileId, 'failed', [], [], data.error, data.excludedSheets || [])
    } else if (data.records.length === 0) {
      updateFileStatus(fileId, 'warning', [], data.warnings || [], data.warnings?.[0] || 'No records parsed', data.excludedSheets || [])
    } else if (data.warnings?.length > 0) {
      updateFileStatus(fileId, 'warning', data.records, data.warnings, undefined, data.excludedSheets || [])
    } else {
      updateFileStatus(fileId, 'parsed', data.records, [], undefined, data.excludedSheets || [])
    }
  } catch {
    updateFileStatus(fileId, 'failed', [], [], 'Network error: could not reach parse API', [])
  }
}

export default function FileUploader() {
  const { addFile, updateFileStatus } = useReconStore()

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      rejected.forEach(({ file, errors }) => {
        const ext = file.name.split('.').pop()?.toLowerCase()
        const id = makeId()
        const errorMsg = errors[0]?.message || `Rejected: .${ext}`
        const uploadedFile: UploadedFile = {
          id,
          name: file.name,
          extension: ext ? `.${ext}` : '',
          size: file.size,
          status: 'failed',
          recordCount: 0,
          records: [],
          warnings: [],
          error: errorMsg,
        }
        addFile(uploadedFile)
      })

      accepted.forEach((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        const id = makeId()
        const uploadedFile: UploadedFile = {
          id,
          name: file.name,
          extension: `.${ext}`,
          size: file.size,
          status: 'pending',
          recordCount: 0,
          records: [],
          warnings: [],
        }
        addFile(uploadedFile)
        uploadAndParse(file, id, updateFileStatus)
      })
    },
    [addFile, updateFileStatus]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
      'text/plain': ['.txt', '.mt940'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    multiple: true,
    noClick: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer select-none rounded-lg border border-dashed p-4 text-center transition-all duration-150 ${
        isDragActive ? 'border-green-500/50 bg-green-500/5' : 'border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className={`text-sm font-medium ${isDragActive ? 'text-green-400' : 'text-neutral-300'}`}>
        {isDragActive ? 'Drop files here' : 'Drop files to ingest'}
      </div>
      <div className="mt-1 text-xs text-neutral-500 font-mono">
        CSV, XLSX, MT940 ({MAX_FILE_SIZE_MB}MB max)
      </div>
    </div>
  )
}

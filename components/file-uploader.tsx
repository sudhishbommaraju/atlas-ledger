'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { useReconStore } from '@/store/recon-store'
import { MAX_FILE_SIZE_MB } from '@/lib/constants'
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

async function uploadAndParse(
  file: File, 
  fileId: string, 
  updateFileStatus: UpdateFileFn,
  removeFile: (id: string) => void,
  addFile: (f: UploadedFile) => void,
  addExcludedSheets: (sheets: ExcludedSheet[]) => void
) {
  updateFileStatus(fileId, 'parsing')

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/parse', { method: 'POST', body: formData })
    const data = await res.json()

    if (data.error) {
      updateFileStatus(fileId, 'failed', [], [], data.error)
    } else if (data.files) {
      removeFile(fileId) // Remove the pending placeholder
      
      data.files.forEach((extractedFile: any) => {
        const newId = makeId()
        let status: FileStatus = 'parsed'
        if (extractedFile.error) status = 'failed'
        else if (extractedFile.records?.length === 0) status = 'warning'
        else if (extractedFile.warnings?.length > 0) status = 'warning'

        addFile({
          id: newId,
          name: extractedFile.filename,
          archiveName: extractedFile.archiveName,
          extension: extractedFile.filename.split('.').pop() ? `.${extractedFile.filename.split('.').pop()}` : '',
          size: extractedFile.sizeBytes || 0,
          status,
          recordCount: extractedFile.records?.length || 0,
          records: extractedFile.records || [],
          warnings: extractedFile.warnings || [],
          sourceType: extractedFile.sourceType,
          error: extractedFile.error || (extractedFile.records?.length === 0 ? 'No records parsed' : undefined),
        })

        if (extractedFile.excludedSheets?.length > 0) {
          addExcludedSheets(extractedFile.excludedSheets)
        }
      })
    }
  } catch {
    updateFileStatus(fileId, 'failed', [], [], 'Network error: could not reach parse API')
  }
}

export default function FileUploader() {
  const { addFile, updateFileStatus, removeFile, addExcludedSheets } = useReconStore()

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
        uploadAndParse(file, id, updateFileStatus, removeFile, addFile, addExcludedSheets)
      })
    },
    [addFile, updateFileStatus, removeFile, addExcludedSheets]
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
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
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
        CSV, XLSX, MT940, ZIP ({MAX_FILE_SIZE_MB}MB max)
      </div>
    </div>
  )
}

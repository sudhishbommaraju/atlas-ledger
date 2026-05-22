'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { useReconStore } from '@/store/recon-store'
import { MAX_FILE_SIZE_MB } from '@/lib/parsers/index'
import { FileStatus, ParsedRecord, UploadedFile } from '@/lib/types'

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

type UpdateFileFn = (
  id: string,
  status: FileStatus,
  records?: ParsedRecord[],
  warnings?: string[],
  error?: string
) => void

async function uploadAndParse(file: File, fileId: string, updateFileStatus: UpdateFileFn) {
  updateFileStatus(fileId, 'parsing')

  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/parse', { method: 'POST', body: formData })
    const data = await res.json()

    if (data.error) {
      updateFileStatus(fileId, 'failed', [], [], data.error)
    } else if (data.records.length === 0) {
      updateFileStatus(fileId, 'warning', [], data.warnings || [], data.warnings?.[0] || 'No records parsed')
    } else if (data.warnings?.length > 0) {
      updateFileStatus(fileId, 'warning', data.records, data.warnings)
    } else {
      updateFileStatus(fileId, 'parsed', data.records, [])
    }
  } catch {
    updateFileStatus(fileId, 'failed', [], [], 'Network error: could not reach parse API')
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
      style={{
        border: `1px dashed ${isDragActive ? 'var(--accent)' : 'var(--border-default)'}`,
        borderRadius: 6,
        padding: 24,
        textAlign: 'center',
        background: isDragActive ? 'rgba(74, 127, 193, 0.05)' : 'var(--bg-elevated)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      <input {...getInputProps()} />
      <div style={{ fontSize: 13, color: isDragActive ? 'var(--accent)' : 'var(--text-secondary)' }}>
        {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
        CSV · XLSX · JSON · TXT · MT940 · PDF · DOCX &nbsp;·&nbsp; up to {MAX_FILE_SIZE_MB}MB each
      </div>
    </div>
  )
}

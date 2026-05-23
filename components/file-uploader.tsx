'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { motion } from 'framer-motion'
import { useReconStore } from '@/store/recon-store'
import { MAX_FILE_SIZE_MB } from '@/lib/constants'
import { ExcludedSheet, FileStatus, ParsedRecord, UploadedFile, ExtractedFileResult } from '@/lib/types'

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
      
      data.files.forEach((extractedFile: ExtractedFileResult) => {
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
  const { addFile, updateFileStatus, removeFile, addExcludedSheets, files } = useReconStore()

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

  const sources = ["Stripe", "Adyen", "Bank", "ERP", "Ledger"]
  const isEmpty = files.length === 0

  return (
    <div {...getRootProps()} className="w-full lg:min-w-[420px]">
      <motion.div
        animate={{
          scale: isDragActive ? 1.02 : 1,
          borderColor: isDragActive ? "#1D4ED8" : "rgba(29, 78, 216, 0.3)",
          backgroundColor: isDragActive ? "#DBEAFE" : "#FFFFFF",
          boxShadow: isDragActive ? "0 0 0 4px rgba(219, 234, 254, 0.5)" : "0 8px 30px rgba(15,23,42,0.06)"
        }}
        whileHover={!isDragActive ? {
          borderColor: "#1D4ED8",
          boxShadow: "0 0 20px rgba(29, 78, 216, 0.15)"
        } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative cursor-pointer select-none overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center flex flex-col items-center justify-center min-h-[240px] w-full`}
      >
        {isEmpty && (
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#DBEAFE] rounded-2xl -z-10 blur-3xl opacity-30 pointer-events-none"
          />
        )}
        
        <input {...getInputProps()} />
        
        <svg className={`h-12 w-12 mb-4 transition-colors duration-300 ${isDragActive ? "text-[#1D4ED8]" : "text-[#1D4ED8]/70"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        
        <h3 className="text-xl font-semibold text-[#0B1220] mb-2">
          {isDragActive ? 'Drop files now' : 'Drop settlement files'}
        </h3>
        
        <p className="text-sm text-[#5B6472] mb-1">
          CSV, XLSX, JSON, MT940, ZIP
        </p>
        <p className="text-xs text-[#5B6472]/70 mb-6 font-medium">
          Drag files or click to upload
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mt-auto">
          {sources.map(source => (
            <span key={source} className="inline-flex items-center rounded-full bg-[#F1EDE5] px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#5B6472] uppercase border border-[rgba(11,18,32,0.05)]">
              {source}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}


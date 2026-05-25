'use client'

import { useReconStore } from '@/store/recon-store'
import { FileStatus } from '@/lib/types'

const STATUS_CONFIG: Record<FileStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#888',    bg: '#1c1c1c' },
  parsing:  { label: 'Parsing…', color: '#4a7fc1', bg: '#0f1a2a' },
  parsed:   { label: 'Parsed',   color: '#86efac', bg: '#052e16' },
  warning:  { label: 'Warning',  color: '#fde68a', bg: '#1c1400' },
  failed:   { label: 'Failed',   color: '#fca5a5', bg: '#2a0000' },
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export default function SourceList() {
  const { files, removeFile } = useReconStore()

  if (files.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '12px 0' }}>
        No files uploaded yet.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {files.map((file) => {
        const cfg = STATUS_CONFIG[file.status]
        return (
          <div
            key={file.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '8px 10px',
              background: 'var(--bg-elevated)',
              borderRadius: 4,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--text-primary)',
                    maxWidth: 200,
                  }}
                  title={file.name}
                >
                  {file.name}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    padding: '1px 6px',
                    borderRadius: 10,
                    color: cfg.color,
                    background: cfg.bg,
                    flexShrink: 0,
                  }}
                >
                  {cfg.label}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {formatSize(file.size)}
                {file.status === 'parsed' && ` · ${file.recordCount} records`}
                {file.status === 'warning' && file.recordCount > 0 && ` · ${file.recordCount} records`}
              </div>
              {file.error && (
                <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 3 }}>{file.error}</div>
              )}
              {file.warnings.length > 0 && file.status === 'warning' && (
                <div style={{ fontSize: 11, color: '#fde68a', marginTop: 3 }}>
                  {file.warnings[0]}
                  {file.warnings.length > 1 && ` (+${file.warnings.length - 1} more)`}
                </div>
              )}
            </div>
            <button
              onClick={() => removeFile(file.id)}
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                padding: '0 4px',
                fontSize: 14,
                lineHeight: 1,
                flexShrink: 0,
              }}
              title="Remove"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}

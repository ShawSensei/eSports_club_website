'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { uploadImage, deleteImage } from '@/app/admin/actions/cloudinary'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  folder?: string
  label?: string
}

export function ImageUpload({ value, onChange, folder = 'esports', label = 'Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [dragging, setDragging]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)

    if (value?.includes('cloudinary.com')) await deleteImage(value)

    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadImage(fd, folder)
    setUploading(false)

    if ('error' in result) { setError(result.error) }
    else                   { onChange(result.url) }
  }

  async function handleRemove() {
    if (value?.includes('cloudinary.com')) await deleteImage(value)
    onChange(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      {value ? (
        <>
          <div className="relative h-40 w-full overflow-hidden rounded-lg border border-[var(--border)]">
            <Image src={value} alt={label} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition ${
            dragging
              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
              : 'border-[var(--border)] hover:border-[var(--accent-primary)]/60 hover:bg-[var(--bg-elevated)]'
          } ${uploading ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
              <span className="text-xs text-[var(--text-muted)]">Uploading to Cloudinary…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center px-4">
              <svg className="mb-1 h-8 w-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-[var(--text-secondary)]">Click or drag to upload</span>
              <span className="text-xs text-[var(--text-muted)]">JPEG · PNG · WebP — max 5 MB</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

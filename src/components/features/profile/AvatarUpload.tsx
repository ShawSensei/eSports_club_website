'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadAvatar } from '@/app/(protected)/profile/actions'

interface AvatarUploadProps {
  currentUrl: string | null
  displayName: string | null
  username: string
}

export function AvatarUpload({ currentUrl, displayName, username }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setError(null)

    const fd = new FormData()
    fd.append('avatar', file)
    startTransition(async () => {
      const result = await uploadAvatar(fd)
      if ('error' in result) {
        setError(result.error)
        setPreview(null)
      }
    })
  }

  const src = preview ?? currentUrl
  const initials = (displayName ?? username).slice(0, 2).toUpperCase()

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="relative block h-24 w-24 overflow-hidden rounded-full ring-2 ring-[var(--border)] transition hover:ring-[var(--accent-primary)] focus:outline-none focus:ring-[var(--accent-primary)] disabled:opacity-60"
        title="Change avatar"
      >
        {src ? (
          <Image src={src} alt={username} fill className="object-cover" sizes="96px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[var(--bg-elevated)] text-2xl font-bold text-[var(--accent-primary)]">
            {initials}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

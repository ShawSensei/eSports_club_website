'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { togglePublish, togglePin, deletePost } from './actions'

interface NewsRowActionsProps {
  id: string
  isPublished: boolean
  isPinned: boolean
}

export function NewsRowActions({ id, isPublished, isPinned }: NewsRowActionsProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/news/${id}`} className="text-xs text-[var(--accent-primary)] hover:underline">Edit</Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => { await togglePublish(id, isPublished) })}
        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => { await togglePin(id, isPinned) })}
        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
      >
        {isPinned ? 'Unpin' : 'Pin'}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm('Delete this post? This cannot be undone.')) {
            startTransition(async () => { await deletePost(id) })
          }
        }}
        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { MarkdownEditor } from '@/components/features/news/MarkdownEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { createPost, updatePost } from './actions'

interface Game { id: string; name: string }

interface PostData {
  id: string
  title: string
  category: string
  game_id: string | null
  excerpt: string | null
  body: string
  tags: string[]
  cover_url: string | null
}

interface PostFormProps {
  games: Game[]
  post?: PostData
}

const CATEGORIES = ['news', 'announcement', 'patch', 'strategy', 'event'] as const

export function PostForm({ games, post }: PostFormProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(post?.cover_url ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    fd.set('cover_url', coverUrl ?? '')
    startTransition(async () => {
      const result = post
        ? await updatePost(post.id, fd)
        : await createPost(fd)
      if (result && 'error' in result) {
        setError(result.error)
      } else if (result && 'success' in result) {
        setSaved(true)
      }
    })
  }

  const inputClass = 'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Title *</label>
          <input name="title" required defaultValue={post?.title} maxLength={200} className={inputClass} placeholder="Post title" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Category *</label>
          <select name="category" required defaultValue={post?.category ?? 'news'} className={inputClass}>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Game</label>
          <select name="game_id" defaultValue={post?.game_id ?? ''} className={inputClass}>
            <option value="">— None —</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Excerpt</label>
          <textarea name="excerpt" rows={2} defaultValue={post?.excerpt ?? ''} maxLength={300} className={`${inputClass} resize-none`} placeholder="Short summary shown in cards..." />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Tags</label>
          <input name="tags" defaultValue={post?.tags?.join(', ')} className={inputClass} placeholder="valorant, patch, ranked (comma separated)" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Cover Image</label>
          <ImageUpload
            value={coverUrl}
            onChange={setCoverUrl}
            folder="esports/news"
            label="Cover image"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Body *</label>
        <MarkdownEditor name="body" defaultValue={post?.body} placeholder="Write your post in Markdown..." rows={20} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-400">Saved successfully.</p>}

      <div className="flex items-center gap-4 border-t border-[var(--border)] pt-4">
        <Button type="submit" loading={isPending}>{post ? 'Save Changes' : 'Create Post'}</Button>
        <span className="text-xs text-[var(--text-muted)]">Saved as draft. Publish from the news list.</span>
      </div>
    </form>
  )
}

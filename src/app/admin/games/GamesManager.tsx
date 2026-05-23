'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { addGame, updateGame, toggleGameSupport } from './actions'

interface Game {
  id: string
  name: string
  slug: string
  current_patch: string | null
  is_supported: boolean
  sort_order: number
  logo_url?: string | null
  cover_url?: string | null
}

interface GamesManagerProps {
  games: Game[]
}

export function GamesManager({ games }: GamesManagerProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [logoUrls, setLogoUrls] = useState<Record<string, string | null>>({})
  const [coverUrls, setCoverUrls] = useState<Record<string, string | null>>({})
  const [newLogoUrl, setNewLogoUrl] = useState<string | null>(null)
  const [newCoverUrl, setNewCoverUrl] = useState<string | null>(null)

  function getLogoUrl(game: Game): string | null {
    return editId === game.id && game.id in logoUrls ? logoUrls[game.id] : (game.logo_url ?? null)
  }

  function getCoverUrl(game: Game): string | null {
    return editId === game.id && game.id in coverUrls ? coverUrls[game.id] : (game.cover_url ?? null)
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('logo_url', newLogoUrl ?? '')
    fd.set('cover_url', newCoverUrl ?? '')
    startTransition(async () => {
      const result = await addGame(fd)
      if ('error' in result) { setError(result.error) } else { setShowAdd(false); setNewLogoUrl(null); setNewCoverUrl(null) }
    })
  }

  function handleUpdate(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    if (id in logoUrls) fd.set('logo_url', logoUrls[id] ?? '')
    if (id in coverUrls) fd.set('cover_url', coverUrls[id] ?? '')
    startTransition(async () => {
      const result = await updateGame(id, fd)
      if ('error' in result) { setError(result.error) } else { setEditId(null) }
    })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleGameSupport(id, current)
    })
  }

  const inputClass = 'rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none'

  return (
    <div className="space-y-4">
      <div className="divide-y divide-[var(--border)]">
        {games.map(game => (
          <div key={game.id} className="py-3">
            {editId === game.id ? (
              <form onSubmit={e => handleUpdate(game.id, e)} className="space-y-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Name</label>
                    <input name="name" defaultValue={game.name} required className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Patch</label>
                    <input name="current_patch" defaultValue={game.current_patch ?? ''} maxLength={32} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Order</label>
                    <input name="sort_order" type="number" defaultValue={game.sort_order} className={`${inputClass} w-20`} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Logo Image</label>
                    <ImageUpload
                      value={getLogoUrl(game)}
                      onChange={url => setLogoUrls(prev => ({ ...prev, [game.id]: url }))}
                      folder="esports/games"
                      label={`${game.name} logo`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[var(--text-muted)]">Cover / Banner Image</label>
                    <ImageUpload
                      value={getCoverUrl(game)}
                      onChange={url => setCoverUrls(prev => ({ ...prev, [game.id]: url }))}
                      folder="esports/games"
                      label={`${game.name} cover`}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={isPending}>Save</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditId(null)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4">
                {game.logo_url && (
                  <div className="relative h-8 w-8 overflow-hidden rounded">
                    <Image src={game.logo_url} alt={game.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <span className="font-medium text-[var(--text-primary)]">{game.name}</span>
                  {game.current_patch && (
                    <span className="ml-2 text-xs text-[var(--text-muted)]">v{game.current_patch}</span>
                  )}
                  <span className="ml-2 text-xs text-[var(--text-muted)]">/{game.slug}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(game.id, game.is_supported)}
                    disabled={isPending}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      game.is_supported
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    {game.is_supported ? 'Active' : 'Inactive'}
                  </button>
                  <Button variant="outline" size="sm" onClick={() => setEditId(game.id)}>Edit</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {showAdd ? (
        <form onSubmit={handleAdd} className="border-t border-[var(--border)] pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Add New Game</h3>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Name *</label>
              <input name="name" required className={inputClass} placeholder="Valorant" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Slug *</label>
              <input name="slug" required className={inputClass} placeholder="valorant" pattern="[a-z0-9-]+" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Current Patch</label>
              <input name="current_patch" className={inputClass} placeholder="9.08" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Sort Order</label>
              <input name="sort_order" type="number" defaultValue={0} className={`${inputClass} w-20`} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Logo Image</label>
              <ImageUpload value={newLogoUrl} onChange={setNewLogoUrl} folder="esports/games" label="Game logo" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Cover / Banner Image</label>
              <ImageUpload value={newCoverUrl} onChange={setNewCoverUrl} folder="esports/games" label="Game cover" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={isPending}>Add Game</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAdd(false); setNewLogoUrl(null); setNewCoverUrl(null) }}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="border-t border-[var(--border)] pt-4">
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>+ Add Game</Button>
        </div>
      )}
    </div>
  )
}

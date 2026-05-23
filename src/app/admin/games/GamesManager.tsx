'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { addGame, updateGame, toggleGameSupport } from './actions'

interface Game {
  id: string
  name: string
  slug: string
  current_patch: string | null
  is_supported: boolean
  sort_order: number
}

interface GamesManagerProps {
  games: Game[]
}

export function GamesManager({ games }: GamesManagerProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addGame(fd)
      if ('error' in result) { setError(result.error) } else { setShowAdd(false) }
    })
  }

  function handleUpdate(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
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
              <form onSubmit={e => handleUpdate(game.id, e)} className="flex flex-wrap items-end gap-3">
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
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={isPending}>Save</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditId(null)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4">
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
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={isPending}>Add Game</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
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

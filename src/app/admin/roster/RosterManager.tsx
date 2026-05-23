'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { addRosterMember, removeRosterMember, updateRosterMember } from './actions'

interface RosterRow {
  id: string
  in_game_role: string | null
  jersey_number: number | null
  is_captain: boolean
  is_active: boolean
  joined_at: string
  player: { id: string; username: string; display_name: string | null } | null
  game: { id: string; name: string } | null
}

interface Game { id: string; name: string }
interface Profile { id: string; username: string; display_name: string | null }

interface RosterManagerProps {
  roster: RosterRow[]
  games: Game[]
  profiles: Profile[]
}

export function RosterManager({ roster, games, profiles }: RosterManagerProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const inputClass = 'rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none'

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addRosterMember(fd)
      if ('error' in result) { setError(result.error) } else { setShowAdd(false) }
    })
  }

  function handleUpdate(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateRosterMember(id, fd)
      if ('error' in result) { setError(result.error) } else { setEditId(null) }
    })
  }

  function handleRemove(id: string) {
    if (!confirm('Remove this player from the roster?')) return
    startTransition(async () => {
      await removeRosterMember(id)
    })
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-[var(--border)]">
        {roster.length === 0 && (
          <p className="py-4 text-sm text-[var(--text-muted)]">No roster members yet.</p>
        )}
        {roster.map(row => (
          <div key={row.id} className="py-3">
            {editId === row.id ? (
              <form onSubmit={e => handleUpdate(row.id, e)} className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Role</label>
                  <input name="in_game_role" defaultValue={row.in_game_role ?? ''} maxLength={64} className={inputClass} placeholder="Duelist" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Jersey #</label>
                  <input name="jersey_number" type="number" defaultValue={row.jersey_number ?? ''} className={`${inputClass} w-20`} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" name="is_captain" value="true" defaultChecked={row.is_captain} className="accent-[var(--accent-primary)]" />
                    Captain
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" name="is_active" value="true" defaultChecked={row.is_active} className="accent-[var(--accent-primary)]" />
                    Active
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={isPending}>Save</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditId(null)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="font-medium text-[var(--text-primary)]">
                    {row.player?.display_name ?? row.player?.username ?? '?'}
                  </span>
                  {row.is_captain && <span className="ml-2 text-xs text-yellow-400">Captain</span>}
                  {!row.is_active && <span className="ml-2 text-xs text-[var(--text-muted)]">(inactive)</span>}
                  <span className="ml-3 text-xs text-[var(--text-muted)]">{row.game?.name} · {row.in_game_role ?? 'No role'}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditId(row.id)}>Edit</Button>
                  <Button variant="danger" size="sm" loading={isPending} onClick={() => handleRemove(row.id)}>Remove</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {showAdd ? (
        <form onSubmit={handleAdd} className="border-t border-[var(--border)] pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Add Roster Member</h3>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Player *</label>
              <select name="user_id" required className={inputClass}>
                <option value="">Select player...</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.display_name ?? p.username}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Game *</label>
              <select name="game_id" required className={inputClass}>
                <option value="">Select game...</option>
                {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Role</label>
              <input name="in_game_role" maxLength={64} className={inputClass} placeholder="Duelist" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Jersey #</label>
              <input name="jersey_number" type="number" className={`${inputClass} w-20`} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={isPending}>Add Player</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="border-t border-[var(--border)] pt-4">
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>+ Add Player</Button>
        </div>
      )}
    </div>
  )
}

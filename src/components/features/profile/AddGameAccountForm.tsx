'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { upsertGameAccount } from '@/app/(protected)/profile/actions'

interface Game {
  id: string
  name: string
}

interface AddGameAccountFormProps {
  availableGames: Game[]
}

export function AddGameAccountForm({ availableGames }: AddGameAccountFormProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await upsertGameAccount(fd)
      if ('error' in result) {
        setError(result.error)
      } else {
        setOpen(false)
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  if (availableGames.length === 0) return null

  return (
    <div>
      {!open ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          + Link Game Account
        </Button>
      ) : (
        <Card>
          <h3 className="mb-3 font-semibold text-[var(--text-primary)]">Link Game Account</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Game</label>
              <select
                name="game_id"
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              >
                <option value="">Select a game...</option>
                {availableGames.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">In-Game Name</label>
              <input
                name="in_game_name"
                maxLength={64}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Current Rank</label>
              <input
                name="current_rank"
                maxLength={64}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Peak Rank</label>
              <input
                name="peak_rank"
                maxLength={64}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={isPending}>Link Account</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setError(null) }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

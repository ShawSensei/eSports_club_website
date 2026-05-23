'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { upsertGameAccount, removeGameAccount } from '@/app/(protected)/profile/actions'

interface GameAccount {
  id: string
  game_id: string
  in_game_name: string | null
  current_rank: string | null
  peak_rank: string | null
}

interface Game {
  id: string
  name: string
  logo_url: string | null
}

interface GameAccountCardProps {
  account: GameAccount
  game: Game
  isOwner: boolean
}

export function GameAccountCard({ account, game, isOwner }: GameAccountCardProps) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('game_id', account.game_id)
    startTransition(async () => {
      const result = await upsertGameAccount(fd)
      if ('error' in result) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      await removeGameAccount(account.game_id)
    })
  }

  return (
    <Card className="relative">
      <div className="mb-3 flex items-center gap-3">
        {game.logo_url ? (
          <Image src={game.logo_url} alt={game.name} width={32} height={32} className="rounded object-contain" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--bg-elevated)] text-xs font-bold text-[var(--accent-primary)]">
            {game.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <h3 className="font-semibold text-[var(--text-primary)]">{game.name}</h3>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-2">
          <div>
            <label className="mb-0.5 block text-xs text-[var(--text-muted)]">In-Game Name</label>
            <input
              name="in_game_name"
              defaultValue={account.in_game_name ?? ''}
              maxLength={64}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-xs text-[var(--text-muted)]">Current Rank</label>
            <input
              name="current_rank"
              defaultValue={account.current_rank ?? ''}
              maxLength={64}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-xs text-[var(--text-muted)]">Peak Rank</label>
            <input
              name="peak_rank"
              defaultValue={account.peak_rank ?? ''}
              maxLength={64}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" loading={isPending}>Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(false); setError(null) }}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-1.5 text-sm">
          <StatRow label="IGN" value={account.in_game_name} />
          <StatRow label="Current Rank" value={account.current_rank} />
          <StatRow label="Peak Rank" value={account.peak_rank} />
          {isOwner && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="danger" size="sm" loading={isPending} onClick={handleRemove}>Remove</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

function StatRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-medium text-[var(--text-primary)]">{value ?? '—'}</span>
    </div>
  )
}

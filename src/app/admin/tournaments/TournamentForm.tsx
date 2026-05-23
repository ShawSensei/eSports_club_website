'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { createTournament, updateTournament } from './actions'

interface Game { id: string; name: string }

interface TournamentData {
  id: string
  game_id: string
  name: string
  description: string | null
  format: string
  max_teams: number | null
  prize_pool: string | null
  rules_url: string | null
  stream_url: string | null
  start_date: string | null
  end_date: string | null
  cover_url: string | null
}

interface TournamentFormProps {
  games: Game[]
  tournament?: TournamentData
}

const FORMATS = ['single_elimination', 'double_elimination', 'round_robin', 'swiss'] as const

export function TournamentForm({ games, tournament }: TournamentFormProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(tournament?.cover_url ?? null)
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
      const result = tournament
        ? await updateTournament(tournament.id, fd)
        : await createTournament(fd)
      if (result && 'error' in result) {
        setError(result.error)
      } else if (result && 'success' in result) {
        setSaved(true)
      }
    })
  }

  const inputClass = 'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Game *</label>
        <select name="game_id" required defaultValue={tournament?.game_id ?? ''} className={inputClass}>
          <option value="">Select game...</option>
          {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Tournament Name *</label>
        <input name="name" required defaultValue={tournament?.name} maxLength={200} className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Description</label>
        <textarea name="description" rows={3} defaultValue={tournament?.description ?? ''} maxLength={2000} className={`${inputClass} resize-none`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Format *</label>
          <select name="format" required defaultValue={tournament?.format ?? 'single_elimination'} className={inputClass}>
            {FORMATS.map(f => (
              <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Max Teams</label>
          <input name="max_teams" type="number" min={2} max={256} defaultValue={tournament?.max_teams ?? ''} className={inputClass} placeholder="Leave blank for unlimited" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Start Date</label>
          <input name="start_date" type="datetime-local" defaultValue={tournament?.start_date?.slice(0, 16) ?? ''} className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">End Date</label>
          <input name="end_date" type="datetime-local" defaultValue={tournament?.end_date?.slice(0, 16) ?? ''} className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Prize Pool</label>
          <input name="prize_pool" defaultValue={tournament?.prize_pool ?? ''} maxLength={100} className={inputClass} placeholder="$500 cash" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Stream URL</label>
          <input name="stream_url" type="url" defaultValue={tournament?.stream_url ?? ''} className={inputClass} placeholder="https://twitch.tv/..." />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Rules URL</label>
          <input name="rules_url" type="url" defaultValue={tournament?.rules_url ?? ''} className={inputClass} placeholder="https://docs.google.com/..." />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Cover Image</label>
        <ImageUpload
          value={coverUrl}
          onChange={setCoverUrl}
          folder="esports/tournaments"
          label="Tournament cover"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-green-400">Saved successfully.</p>}

      <div className="border-t border-[var(--border)] pt-4">
        <Button type="submit" loading={isPending}>{tournament ? 'Save Changes' : 'Create Tournament'}</Button>
      </div>
    </form>
  )
}

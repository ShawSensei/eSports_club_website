'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { updateMatchScore } from '../actions'

interface MatchData {
  id: string
  round: number
  match_number: number
  team1_score: number | null
  team2_score: number | null
  winner_id: string | null
  status: string
  team1: { id: string; team_name: string } | null
  team2: { id: string; team_name: string } | null
}

interface MatchScoreFormProps {
  match: MatchData
  tournamentId: string
}

export function MatchScoreForm({ match, tournamentId }: MatchScoreFormProps) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateMatchScore(match.id, tournamentId, fd)
      if ('error' in result) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  const team1Name = match.team1?.team_name ?? 'TBD'
  const team2Name = match.team2?.team_name ?? 'TBD'
  const isCompleted = match.status === 'completed'

  return (
    <div className="rounded-lg border border-[var(--border)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">Match {match.match_number}</span>
        {isCompleted && <span className="text-xs text-green-400">Completed</span>}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">{team1Name}</label>
              <input
                name="team1_score"
                type="number"
                min={0}
                defaultValue={match.team1_score ?? 0}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">{team2Name}</label>
              <input
                name="team2_score"
                type="number"
                min={0}
                defaultValue={match.team2_score ?? 0}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">Winner</label>
            <select
              name="winner_id"
              defaultValue={match.winner_id ?? ''}
              className="w-full rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            >
              <option value="">— No winner yet —</option>
              {match.team1 && <option value={match.team1.id}>{team1Name}</option>}
              {match.team2 && <option value={match.team2.id}>{team2Name}</option>}
            </select>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={isPending}>Save Score</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className={match.winner_id === match.team1?.id ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
              {team1Name}
            </span>
            <span className="text-[var(--text-muted)]">
              {isCompleted ? `${match.team1_score} — ${match.team2_score}` : 'vs'}
            </span>
            <span className={match.winner_id === match.team2?.id ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
              {team2Name}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            {isCompleted ? 'Edit Score' : 'Enter Score'}
          </Button>
        </div>
      )}
    </div>
  )
}

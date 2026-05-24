'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { generateBracket } from '../actions'

interface GenerateBracketProps {
  tournamentId: string
  approvedTeamCount: number
  hasMatches: boolean
}

export function GenerateBracket({ tournamentId, approvedTeamCount, hasMatches }: GenerateBracketProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)

  function handleGenerate() {
    if (hasMatches && !confirm) {
      setConfirm(true)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await generateBracket(tournamentId)
      if ('error' in result) {
        setError(result.error)
        setConfirm(false)
      }
    })
  }

  if (approvedTeamCount < 2) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Need at least 2 approved teams to generate a bracket.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {approvedTeamCount} approved team{approvedTeamCount !== 1 ? 's' : ''}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {hasMatches
              ? 'Regenerating will delete all existing matches and scores.'
              : 'Standard seeding will be applied (1v8, 4v5, 2v7, 3v6…)'}
          </p>
        </div>

        {confirm && hasMatches ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              loading={isPending}
              onClick={handleGenerate}
            >
              Confirm — Overwrite Bracket
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" loading={isPending} onClick={handleGenerate}>
            {hasMatches ? 'Regenerate Bracket' : 'Generate Bracket'}
          </Button>
        )}
      </div>

      {error && <p className="text-xs" style={{ color: 'var(--accent-danger)' }}>{error}</p>}
    </div>
  )
}

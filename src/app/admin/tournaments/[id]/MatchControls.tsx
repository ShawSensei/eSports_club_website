'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { setMatchStatus, updateVodUrl } from '../actions'

type MatchStatus = 'scheduled' | 'live' | 'completed' | 'forfeit'

interface MatchControlsProps {
  matchId: string
  tournamentId: string
  currentStatus: MatchStatus
  vodUrl: string | null
  hasBothTeams: boolean
}

export function MatchControls({ matchId, tournamentId, currentStatus, vodUrl, hasBothTeams }: MatchControlsProps) {
  const [isPending, startTransition] = useTransition()
  const [editingVod, setEditingVod]  = useState(false)
  const [vodInput, setVodInput]      = useState(vodUrl ?? '')
  const [error, setError]            = useState<string | null>(null)

  function setStatus(status: MatchStatus) {
    setError(null)
    startTransition(async () => {
      const r = await setMatchStatus(matchId, tournamentId, status)
      if ('error' in r) setError(r.error)
    })
  }

  function saveVod() {
    setError(null)
    startTransition(async () => {
      const r = await updateVodUrl(matchId, tournamentId, vodInput.trim() || null)
      if ('error' in r) setError(r.error)
      else setEditingVod(false)
    })
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {/* Status transitions */}
      {currentStatus === 'scheduled' && hasBothTeams && (
        <Button size="sm" variant="outline" loading={isPending} onClick={() => setStatus('live')}>
          <span style={{ color: 'var(--accent-fire)' }}>● </span> Set Live
        </Button>
      )}
      {currentStatus === 'live' && (
        <Button size="sm" variant="outline" loading={isPending} onClick={() => setStatus('scheduled')}>
          Unset Live
        </Button>
      )}
      {currentStatus === 'scheduled' && (
        <Button size="sm" variant="ghost" loading={isPending} onClick={() => setStatus('forfeit')}>
          Forfeit
        </Button>
      )}

      {/* VOD URL */}
      {(currentStatus === 'completed' || currentStatus === 'forfeit') && (
        editingVod ? (
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={vodInput}
              onChange={e => setVodInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="rounded border bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
              style={{ borderColor: 'var(--border)', width: 220 }}
            />
            <Button size="sm" loading={isPending} onClick={saveVod}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingVod(false)}>✕</Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setEditingVod(true)}>
            {vodUrl ? 'Edit VOD' : '+ Add VOD'}
          </Button>
        )
      )}

      {error && <span className="text-xs" style={{ color: 'var(--accent-danger)' }}>{error}</span>}
    </div>
  )
}

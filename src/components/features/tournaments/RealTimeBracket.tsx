'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BracketView, type BracketMatch } from './BracketView'

interface RealTimeBracketProps {
  tournamentId: string
  initialMatches: BracketMatch[]
}

export function RealTimeBracket({ tournamentId, initialMatches }: RealTimeBracketProps) {
  const [matches, setMatches] = useState<BracketMatch[]>(initialMatches)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`bracket-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        (payload) => {
          const updated = payload.new as Record<string, unknown>
          setMatches(prev =>
            prev.map(m =>
              m.id === updated.id
                ? {
                    ...m,
                    team1_score: updated.team1_score as number | null,
                    team2_score: updated.team2_score as number | null,
                    winner_id:   updated.winner_id   as string | null,
                    status:      updated.status      as string,
                    vod_url:     updated.vod_url     as string | null,
                  }
                : m
            )
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tournamentId])

  return <BracketView matches={matches} />
}

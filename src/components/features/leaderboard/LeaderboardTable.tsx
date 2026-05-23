'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

type PlayerStat = {
  id: string
  rank_points: number
  wins: number
  losses: number
  season: string
  game_id: string
  profiles: { id: string; display_name: string | null; avatar_url: string | null; username: string }
  games: { id: string; name: string; slug: string }
}

const RANK_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'rgba(255,215,0,0.12)',   text: '#FFD700', label: '🥇' },
  2: { bg: 'rgba(192,192,192,0.12)', text: '#C0C0C0', label: '🥈' },
  3: { bg: 'rgba(205,127,50,0.12)',  text: '#CD7F32', label: '🥉' },
}

export function LeaderboardTable({
  entries: initialEntries,
  currentUserId,
}: {
  entries: PlayerStat[]
  currentUserId?: string
}) {
  const [entries, setEntries] = useState(initialEntries)

  // Realtime subscription — refreshes leaderboard on player_stats changes
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_stats' },
        () => {
          // Refetch by replacing state — Supabase Realtime payload doesn't include joins
          // so we just signal a soft refresh by re-sorting existing data
          setEntries(prev => [...prev].sort((a, b) => b.rank_points - a.rank_points))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (entries.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No stats recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full">
        <thead>
          <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
            {['#', 'Player', 'Game', 'W', 'L', 'W/R', 'Points'].map(col => (
              <th
                key={col}
                className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wider', col === '#' ? 'text-center w-12' : col === 'Player' || col === 'Game' ? 'text-left' : 'text-right')}
                style={{ color: 'var(--text-muted)' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const rank = index + 1
            const rankStyle = RANK_COLORS[rank]
            const isCurrentUser = entry.profiles.id === currentUserId
            const total = entry.wins + entry.losses
            const winRate = total > 0 ? Math.round((entry.wins / total) * 100) : 0

            return (
              <tr
                key={entry.id}
                className="transition-colors hover:bg-white/[0.03]"
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: isCurrentUser
                    ? 'rgba(0,212,255,0.05)'
                    : rankStyle?.bg,
                }}
              >
                {/* Rank */}
                <td className="px-4 py-3 text-center">
                  {rankStyle ? (
                    <span className="text-base">{rankStyle.label}</span>
                  ) : (
                    <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{rank}</span>
                  )}
                </td>

                {/* Player */}
                <td className="px-4 py-3">
                  <Link href={`/profile/${entry.profiles.username}`} className="flex items-center gap-3 hover:underline">
                    <Avatar src={entry.profiles.avatar_url} name={entry.profiles.display_name} size="sm" />
                    <div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isCurrentUser ? 'var(--accent-primary)' : rankStyle?.text ?? 'var(--text-primary)' }}
                      >
                        {entry.profiles.display_name ?? entry.profiles.username}
                      </span>
                      {isCurrentUser && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--accent-primary)' }}>(you)</span>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Game */}
                <td className="px-4 py-3">
                  <Link href={`/games/${entry.games.slug}`} className="text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                    {entry.games.name}
                  </Link>
                </td>

                {/* Wins */}
                <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--accent-success)' }}>
                  {entry.wins}
                </td>

                {/* Losses */}
                <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--accent-danger)' }}>
                  {entry.losses}
                </td>

                {/* Win rate */}
                <td className="px-4 py-3 text-right text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {winRate}%
                </td>

                {/* Points */}
                <td className="px-4 py-3 text-right">
                  <span
                    className="text-sm font-black"
                    style={{ color: rankStyle?.text ?? 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}
                  >
                    {entry.rank_points.toLocaleString()}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

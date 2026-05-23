'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

type Game = { id: string; name: string; slug: string }

export function LeaderboardFilters({
  games,
  seasons,
  activeGame,
  activeSeason,
}: {
  games: Game[]
  seasons: string[]
  activeGame: string
  activeSeason: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Game filter */}
      <select
        value={activeGame}
        onChange={e => update('game', e.target.value === 'all' ? '' : e.target.value)}
        className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      >
        <option value="all">All Games</option>
        {games.map(g => (
          <option key={g.id} value={g.slug}>{g.name}</option>
        ))}
      </select>

      {/* Season filter */}
      {seasons.length > 0 && (
        <select
          value={activeSeason}
          onChange={e => update('season', e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: activeSeason ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          <option value="">All Seasons</option>
          {seasons.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </div>
  )
}

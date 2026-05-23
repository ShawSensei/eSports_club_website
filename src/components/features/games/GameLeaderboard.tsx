import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'

type LeaderboardEntry = {
  id: string
  rank_points: number
  wins: number
  losses: number
  season: string
  profiles: { display_name: string | null; avatar_url: string | null; username: string }
}

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
}

export function GameLeaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No stats recorded for this game yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', width: '3rem' }}>#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Player</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>W</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>L</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>W/R</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const rank = index + 1
            const total = entry.wins + entry.losses
            const winRate = total > 0 ? Math.round((entry.wins / total) * 100) : 0

            return (
              <tr
                key={entry.id}
                style={{ borderBottom: '1px solid var(--border)', background: rank <= 3 ? 'rgba(255,255,255,0.02)' : undefined }}
                className="transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <span
                    className="text-sm font-black"
                    style={{ color: RANK_COLORS[rank] ?? 'var(--text-muted)' }}
                  >
                    {rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/profile/${entry.profiles.username}`} className="flex items-center gap-3 hover:underline">
                    <Avatar src={entry.profiles.avatar_url} name={entry.profiles.display_name} size="sm" />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {entry.profiles.display_name ?? entry.profiles.username}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-sm" style={{ color: 'var(--accent-success)' }}>{entry.wins}</td>
                <td className="px-4 py-3 text-right text-sm" style={{ color: 'var(--accent-danger)' }}>{entry.losses}</td>
                <td className="px-4 py-3 text-right text-sm" style={{ color: 'var(--text-secondary)' }}>{winRate}%</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
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

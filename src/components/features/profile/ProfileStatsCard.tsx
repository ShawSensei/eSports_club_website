import Image from 'next/image'
import { Card } from '@/components/ui/Card'

interface ProfileStatsCardProps {
  gameName: string
  gameLogoUrl: string | null
  wins: number
  losses: number
  draws: number
  rankPoints: number
  season: string
}

export function ProfileStatsCard({
  gameName,
  gameLogoUrl,
  wins,
  losses,
  draws,
  rankPoints,
  season,
}: ProfileStatsCardProps) {
  const total = wins + losses + draws
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {gameLogoUrl ? (
            <Image src={gameLogoUrl} alt={gameName} width={24} height={24} className="rounded object-contain" />
          ) : null}
          <span className="font-semibold text-[var(--text-primary)]">{gameName}</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{season}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Wins" value={wins} color="text-green-400" />
        <StatBox label="Losses" value={losses} color="text-red-400" />
        <StatBox label="Draws" value={draws} color="text-[var(--text-muted)]" />
        <StatBox label="Win Rate" value={`${winRate}%`} color="text-[var(--accent-primary)]" />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-sm">
        <span className="text-[var(--text-muted)]">Rank Points</span>
        <span className="font-bold text-[var(--accent-secondary)]">{rankPoints.toLocaleString()}</span>
      </div>
    </Card>
  )
}

function StatBox({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-elevated)] px-3 py-2 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="mt-0.5 text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  )
}

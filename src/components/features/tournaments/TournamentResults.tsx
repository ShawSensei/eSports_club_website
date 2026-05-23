import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type Match = {
  id: string
  round: number
  match_number: number
  team1_score: number | null
  team2_score: number | null
  status: string
  vod_url: string | null
  played_at: string | null
  winner_id: string | null
  team1: { id: string; team_name: string } | null
  team2: { id: string; team_name: string } | null
}

function getRoundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semi-Final'
  if (fromEnd === 2) return 'Quarter-Final'
  return `Round ${round}`
}

export function TournamentResults({ matches }: { matches: Match[] }) {
  const completed = matches.filter(m => m.status === 'completed' || m.status === 'forfeit')

  if (completed.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No results yet.</p>
      </div>
    )
  }

  const rounds = Array.from(new Set(completed.map(m => m.round))).sort((a, b) => b - a)
  const totalRounds = Math.max(...matches.map(m => m.round))

  return (
    <div className="space-y-8">
      {rounds.map(round => (
        <section key={round}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {getRoundLabel(round, totalRounds)}
          </h2>
          <div className="space-y-3">
            {completed
              .filter(m => m.round === round)
              .sort((a, b) => a.match_number - b.match_number)
              .map(match => (
                <div
                  key={match.id}
                  className="flex items-center gap-4 rounded-xl px-5 py-4"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {/* Team 1 */}
                  <div className="flex flex-1 items-center justify-end gap-3">
                    <span
                      className="font-bold text-sm"
                      style={{ color: match.winner_id === match.team1?.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                    >
                      {match.team1?.team_name ?? 'TBD'}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-center">
                    <span className="text-lg font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {match.team1_score ?? 0} – {match.team2_score ?? 0}
                    </span>
                    {match.status === 'forfeit' && (
                      <p className="text-xs" style={{ color: 'var(--accent-warning)' }}>Forfeit</p>
                    )}
                  </div>

                  {/* Team 2 */}
                  <div className="flex flex-1 items-center gap-3">
                    <span
                      className="font-bold text-sm"
                      style={{ color: match.winner_id === match.team2?.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                    >
                      {match.team2?.team_name ?? 'TBD'}
                    </span>
                  </div>

                  {/* VOD */}
                  {match.vod_url && (
                    <a
                      href={match.vod_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--accent-secondary)', border: '1px solid rgba(124,58,237,0.3)' }}
                    >
                      📺 VOD
                    </a>
                  )}
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}

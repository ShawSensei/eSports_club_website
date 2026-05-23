type Team = { id: string; team_name: string }
type Match = {
  id: string
  round: number
  match_number: number
  team1_score: number | null
  team2_score: number | null
  status: string
  winner_id: string | null
  team1: Team | null
  team2: Team | null
}
type TournamentTeam = { id: string; team_name: string; status: string }

export function TournamentBracket({ matches, teams }: { matches: Match[]; teams: TournamentTeam[] }) {
  if (matches.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bracket not yet generated.</p>
      </div>
    )
  }

  // Group by round
  const rounds = matches.reduce<Record<number, Match[]>>((acc, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {})
  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b)

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {roundNumbers.map((round) => (
          <div key={round} className="flex flex-col gap-4">
            {/* Round header */}
            <div className="mb-2 text-center">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {getRoundLabel(round, roundNumbers.length)}
              </span>
            </div>

            {/* Matches in this round */}
            <div
              className="flex flex-col justify-around"
              style={{ gap: `${getMatchGap(round)}px`, minHeight: `${getMinHeight(round, roundNumbers.length)}px` }}
            >
              {rounds[round].sort((a, b) => a.match_number - b.match_number).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MatchCard({ match }: { match: Match }) {
  const isCompleted = match.status === 'completed' || match.status === 'forfeit'
  const isLive = match.status === 'live'

  return (
    <div
      className="w-52 rounded-xl overflow-hidden"
      style={{ border: `1px solid ${isLive ? 'var(--accent-primary)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
    >
      {isLive && (
        <div className="px-3 py-1 text-center text-xs font-bold" style={{ background: 'var(--accent-primary)', color: '#000' }}>
          🔴 LIVE
        </div>
      )}
      <TeamRow
        name={match.team1?.team_name}
        score={match.team1_score}
        isWinner={match.winner_id === match.team1?.id}
        isCompleted={isCompleted}
      />
      <div className="h-px" style={{ background: 'var(--border)' }} />
      <TeamRow
        name={match.team2?.team_name}
        score={match.team2_score}
        isWinner={match.winner_id === match.team2?.id}
        isCompleted={isCompleted}
      />
    </div>
  )
}

function TeamRow({ name, score, isWinner, isCompleted }: {
  name?: string
  score: number | null
  isWinner: boolean
  isCompleted: boolean
}) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2.5"
      style={{ background: isWinner ? 'rgba(0,212,255,0.06)' : undefined }}
    >
      <span
        className="truncate text-sm font-medium max-w-[140px]"
        style={{ color: isWinner ? 'var(--accent-primary)' : name ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {name ?? 'TBD'}
      </span>
      {isCompleted && score !== null && (
        <span
          className="ml-2 flex-shrink-0 text-sm font-bold"
          style={{ color: isWinner ? 'var(--accent-primary)' : 'var(--text-muted)' }}
        >
          {score}
        </span>
      )}
    </div>
  )
}

function getRoundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semi-Final'
  if (fromEnd === 2) return 'Quarter-Final'
  return `Round ${round}`
}

function getMatchGap(round: number): number {
  return Math.pow(2, round - 1) * 8
}

function getMinHeight(round: number, totalRounds: number): number {
  return Math.pow(2, totalRounds - round) * 80
}

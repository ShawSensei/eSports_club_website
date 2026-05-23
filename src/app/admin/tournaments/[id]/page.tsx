import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TournamentForm } from '../TournamentForm'
import { TournamentAdminControls, TeamReviewButtons } from './TournamentAdminControls'
import { MatchScoreForm } from './MatchScoreForm'

type TournamentRow = {
  id: string
  game_id: string
  name: string
  description: string | null
  format: string
  status: 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled'
  max_teams: number | null
  prize_pool: string | null
  rules_url: string | null
  stream_url: string | null
  start_date: string | null
  end_date: string | null
  registration_open: boolean
}

type TeamRow = {
  id: string
  team_name: string
  status: 'pending' | 'approved' | 'rejected' | 'disqualified'
  registered_at: string
  captain: { username: string; display_name: string | null } | null
}

type MatchRow = {
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

type GameRow = { id: string; name: string }

export default async function AdminTournamentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [
    { data: tournament },
    { data: teamsData },
    { data: matchesData },
    { data: gamesData },
  ] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', params.id).single<TournamentRow>(),
    supabase.from('tournament_teams').select('id, team_name, status, registered_at, captain:profiles(username, display_name)').eq('tournament_id', params.id).order('registered_at'),
    supabase.from('matches').select('id, round, match_number, team1_score, team2_score, winner_id, status, team1:tournament_teams!matches_team1_id_fkey(id, team_name), team2:tournament_teams!matches_team2_id_fkey(id, team_name)').eq('tournament_id', params.id).order('round').order('match_number'),
    supabase.from('games').select('id, name').eq('is_supported', true).order('sort_order'),
  ])

  if (!tournament) notFound()

  const teams = (teamsData ?? []) as unknown as TeamRow[]
  const matches = (matchesData ?? []) as unknown as MatchRow[]
  const games = (gamesData ?? []) as GameRow[]

  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b)

  const teamStatusBadge = (s: TeamRow['status']) => {
    if (s === 'approved') return 'registration'
    if (s === 'rejected') return 'cancelled'
    if (s === 'pending') return 'upcoming'
    return 'default'
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{tournament.name}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{games.find(g => g.id === tournament.game_id)?.name}</p>
        </div>
        <Badge variant={tournament.status}>{tournament.status}</Badge>
      </div>

      {/* Controls */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Controls</h2>
        <TournamentAdminControls
          id={tournament.id}
          status={tournament.status}
          registrationOpen={tournament.registration_open}
        />
      </Card>

      {/* Edit form */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Details</h2>
        <TournamentForm games={games} tournament={tournament} />
      </Card>

      {/* Team registrations */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Registered Teams ({teams.length})
          </h2>
        </div>
        {teams.length === 0 ? (
          <p className="p-4 text-sm text-[var(--text-muted)]">No teams registered yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {teams.map(team => (
              <div key={team.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                <div className="flex-1">
                  <div className="font-medium text-[var(--text-primary)]">{team.team_name}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Captain: {team.captain?.display_name ?? team.captain?.username ?? '—'}
                  </div>
                </div>
                <Badge variant={teamStatusBadge(team.status)}>{team.status}</Badge>
                {team.status === 'pending' && (
                  <TeamReviewButtons teamId={team.id} tournamentId={tournament.id} />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Match scoring */}
      {matches.length > 0 && (
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">Match Scores</h2>
          <div className="space-y-6">
            {rounds.map(round => (
              <div key={round}>
                <h3 className="mb-3 text-xs font-semibold text-[var(--text-muted)]">Round {round}</h3>
                <div className="space-y-3">
                  {matches.filter(m => m.round === round).map(match => (
                    <MatchScoreForm key={match.id} match={match} tournamentId={tournament.id} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

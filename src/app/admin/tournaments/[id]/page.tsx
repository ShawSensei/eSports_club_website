import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TournamentForm } from '../TournamentForm'
import { TournamentAdminControls, TeamReviewButtons } from './TournamentAdminControls'
import { MatchScoreForm } from './MatchScoreForm'
import { GenerateBracket } from './GenerateBracket'
import { MatchControls } from './MatchControls'
import { BracketView } from '@/components/features/tournaments/BracketView'
import { getRoundLabel } from '@/lib/tournament/bracket'

type TournamentRow = {
  id: string; game_id: string; name: string; description: string | null
  format: string
  status: 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled'
  max_teams: number | null; prize_pool: string | null
  rules_url: string | null; stream_url: string | null
  start_date: string | null; end_date: string | null
  cover_url: string | null; registration_open: boolean
}
type TeamRow = {
  id: string; team_name: string
  status: 'pending' | 'approved' | 'rejected' | 'disqualified'
  registered_at: string
  captain: { username: string; display_name: string | null } | null
}
type MatchRow = {
  id: string; round: number; match_number: number
  team1_score: number | null; team2_score: number | null
  winner_id: string | null; status: string; vod_url: string | null
  team1: { id: string; team_name: string } | null
  team2: { id: string; team_name: string } | null
}
type GameRow = { id: string; name: string }

const teamStatusBadge = (s: TeamRow['status']) => {
  if (s === 'approved') return 'registration' as const
  if (s === 'rejected') return 'cancelled' as const
  if (s === 'pending')  return 'upcoming' as const
  return 'default' as const
}

export default async function AdminTournamentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [
    { data: tournament },
    { data: teamsData },
    { data: matchesData },
    { data: gamesData },
  ] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', params.id).single<TournamentRow>(),
    supabase.from('tournament_teams')
      .select('id, team_name, status, registered_at, captain:profiles(username, display_name)')
      .eq('tournament_id', params.id).order('registered_at'),
    supabase.from('matches')
      .select('id, round, match_number, team1_score, team2_score, winner_id, status, vod_url, team1:tournament_teams!matches_team1_id_fkey(id, team_name), team2:tournament_teams!matches_team2_id_fkey(id, team_name)')
      .eq('tournament_id', params.id).order('round').order('match_number'),
    supabase.from('games').select('id, name').eq('is_supported', true).order('sort_order'),
  ])

  if (!tournament) notFound()

  const teams   = (teamsData   ?? []) as unknown as TeamRow[]
  const matches = (matchesData ?? []) as unknown as MatchRow[]
  const games   = (gamesData   ?? []) as GameRow[]

  const approvedTeams = teams.filter(t => t.status === 'approved')
  const pendingTeams  = teams.filter(t => t.status === 'pending')

  const roundNumbers = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b)
  const totalRounds  = roundNumbers.length

  const gameName = games.find(g => g.id === tournament.game_id)?.name ?? ''

  return (
    <div className="max-w-4xl space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant={tournament.status}>{tournament.status}</Badge>
            {gameName && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{gameName}</span>}
            <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>· {tournament.format.replace(/_/g, ' ')}</span>
          </div>
          <h1 className="text-2xl font-black uppercase" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {tournament.name}
          </h1>
        </div>
      </div>

      {/* ── Status controls ── */}
      <Card>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.18em' }}>
          Controls
        </h2>
        <TournamentAdminControls id={tournament.id} status={tournament.status} registrationOpen={tournament.registration_open} />
      </Card>

      {/* ── Bracket generation ── */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.18em' }}>
            Bracket
          </h2>
          {matches.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{matches.length} matches generated</span>
          )}
        </div>

        <GenerateBracket
          tournamentId={tournament.id}
          approvedTeamCount={approvedTeams.length}
          hasMatches={matches.length > 0}
        />

        {/* Bracket preview */}
        {matches.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)', padding: '16px 8px 8px' }}>
            <BracketView matches={matches as any} />
          </div>
        )}
      </Card>

      {/* ── Team registrations ── */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.18em' }}>
            Registered Teams ({teams.length})
          </h2>
          {pendingTeams.length > 0 && (
            <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(255,214,10,0.15)', color: 'var(--accent-yellow)', border: '1px solid rgba(255,214,10,0.3)' }}>
              {pendingTeams.length} pending
            </span>
          )}
        </div>
        {teams.length === 0 ? (
          <p className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>No teams registered yet.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {teams.map(team => (
              <div key={team.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{team.team_name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
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

      {/* ── Match management ── */}
      {matches.length > 0 && (
        <Card>
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.18em' }}>
            Match Management
          </h2>
          <div className="space-y-8">
            {roundNumbers.map((round, ri) => (
              <div key={round}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-purple)' }}>
                    {getRoundLabel(ri, totalRounds)}
                  </span>
                  <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
                </div>
                <div className="space-y-3">
                  {matches
                    .filter(m => m.round === round)
                    .map(match => (
                      <div key={match.id} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                        <MatchScoreForm match={match} tournamentId={tournament.id} />
                        <MatchControls
                          matchId={match.id}
                          tournamentId={tournament.id}
                          currentStatus={match.status as any}
                          vodUrl={match.vod_url}
                          hasBothTeams={!!(match.team1 && match.team2)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Edit details ── */}
      <Card>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.18em' }}>
          Tournament Details
        </h2>
        <TournamentForm games={games} tournament={tournament} />
      </Card>
    </div>
  )
}

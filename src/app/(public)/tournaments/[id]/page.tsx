import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { GameTabs } from '@/components/features/games/GameTabs'
import { TournamentTabs } from '@/components/features/tournaments/TournamentTabs'
import { TournamentBracket } from '@/components/features/tournaments/TournamentBracket'
import { TournamentTeamsList } from '@/components/features/tournaments/TournamentTeamsList'
import { TournamentResults } from '@/components/features/tournaments/TournamentResults'
import { TournamentRegistrationForm } from '@/components/features/tournaments/TournamentRegistrationForm'
import { formatDate } from '@/lib/utils'

type PageParams = { params: { id: string }; searchParams: { tab?: string } }

type TournamentFull = {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  format: string
  status: string
  max_teams: number | null
  prize_pool: string | null
  rules_url: string | null
  stream_url: string | null
  registration_open: boolean
  start_date: string | null
  end_date: string | null
  games: { id: string; name: string; slug: string; logo_url: string | null } | null
}

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

type TournamentTeam = {
  id: string
  team_name: string
  status: string
  registered_at: string
  captain: { display_name: string | null; username: string } | null
  members: { user_id: string; profiles: { display_name: string | null; avatar_url: string | null; username: string } }[]
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('tournaments')
    .select('name')
    .eq('id', params.id)
    .single<{ name: string }>()
  return { title: data?.name ?? 'Tournament' }
}

export default async function TournamentDetailPage({ params, searchParams }: PageParams) {
  const supabase = createClient()
  const tab = searchParams.tab ?? 'overview'

  const { data: { user } } = await supabase.auth.getUser()

  const { data: tData } = await supabase
    .from('tournaments')
    .select('id, name, description, cover_url, format, status, max_teams, prize_pool, rules_url, stream_url, registration_open, start_date, end_date, games(id, name, slug, logo_url)')
    .eq('id', params.id)
    .single()

  const tournament = tData as unknown as TournamentFull | null
  if (!tournament) notFound()

  // Fetch tab-specific data
  let matches: Match[] = []
  let teams: TournamentTeam[] = []

  if (tab === 'bracket' || tab === 'results') {
    const { data } = await supabase
      .from('matches')
      .select('id, round, match_number, team1_score, team2_score, status, vod_url, played_at, winner_id, team1:team1_id(id, team_name), team2:team2_id(id, team_name)')
      .eq('tournament_id', params.id)
      .order('round')
      .order('match_number')
    matches = (data ?? []) as unknown as Match[]
  }

  if (tab === 'teams' || tab === 'bracket') {
    const { data } = await supabase
      .from('tournament_teams')
      .select('id, team_name, status, registered_at, captain:captain_id(display_name, username), members:tournament_team_members(user_id, profiles(display_name, avatar_url, username))')
      .eq('tournament_id', params.id)
      .order('registered_at')
    teams = (data ?? []) as unknown as TournamentTeam[]
  }

  // Check if current user already registered
  let userTeamId: string | null = null
  if (user && tournament.registration_open) {
    const { data: existing } = await supabase
      .from('tournament_teams')
      .select('id')
      .eq('tournament_id', params.id)
      .eq('captain_id', user.id)
      .maybeSingle<{ id: string }>()
    userTeamId = existing?.id ?? null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Cover */}
      {tournament.cover_url && (
        <div className="relative mb-8 h-48 w-full overflow-hidden rounded-2xl sm:h-72">
          <Image src={tournament.cover_url} alt={tournament.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[rgba(10,10,15,0.5)] to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={tournament.status as any}>{tournament.status}</Badge>
          {tournament.games?.logo_url && (
            <Image src={tournament.games.logo_url} alt={tournament.games.name} width={20} height={20} className="rounded object-cover" />
          )}
          {tournament.games && (
            <Link href={`/games/${tournament.games.slug}`} className="text-sm hover:underline" style={{ color: 'var(--accent-primary)' }}>
              {tournament.games.name}
            </Link>
          )}
          <span className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
            · {tournament.format.replace(/_/g, ' ')}
          </span>
        </div>

        <h1 className="mb-4 text-3xl font-black sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          {tournament.name}
        </h1>

        {/* Meta strip */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {tournament.start_date && (
            <span>📅 {formatDate(tournament.start_date)}{tournament.end_date ? ` – ${formatDate(tournament.end_date)}` : ''}</span>
          )}
          {tournament.max_teams && <span>👥 Max {tournament.max_teams} teams</span>}
          {tournament.prize_pool && <span>🏆 {tournament.prize_pool}</span>}
          {tournament.stream_url && (
            <a href={tournament.stream_url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent-primary)' }}>
              📺 Watch stream
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <TournamentTabs activeTab={tab} tournamentId={params.id}>
        {tab === 'overview' && (
          <div className="max-w-3xl">
            {tournament.description ? (
              <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tournament.description}</p>
            ) : (
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>No description provided.</p>
            )}
            {tournament.rules_url && (
              <a
                href={tournament.rules_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                📄 View Rules
              </a>
            )}
            {tournament.registration_open && !userTeamId && user && (
              <div className="mt-8 border-t pt-8" style={{ borderColor: 'var(--border)' }}>
                <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Register Your Team</h2>
                <TournamentRegistrationForm tournamentId={tournament.id} userId={user.id} />
              </div>
            )}
            {tournament.registration_open && userTeamId && (
              <div className="mt-8 rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <p className="font-semibold text-sm" style={{ color: 'var(--accent-success)' }}>✓ You have registered a team — awaiting approval</p>
              </div>
            )}
            {tournament.registration_open && !user && (
              <div className="mt-8 rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Link href="/login" className="hover:underline" style={{ color: 'var(--accent-primary)' }}>Sign in</Link> to register your team.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'bracket' && (
          <TournamentBracket matches={matches} teams={teams} />
        )}

        {tab === 'teams' && (
          <TournamentTeamsList teams={teams} />
        )}

        {tab === 'results' && (
          <TournamentResults matches={matches} />
        )}
      </TournamentTabs>
    </div>
  )
}

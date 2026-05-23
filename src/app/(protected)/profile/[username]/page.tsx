import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProfileHeader } from '@/components/features/profile/ProfileHeader'
import { GameAccountCard } from '@/components/features/profile/GameAccountCard'
import { AddGameAccountForm } from '@/components/features/profile/AddGameAccountForm'
import { ProfileStatsCard } from '@/components/features/profile/ProfileStatsCard'

type Props = { params: { username: string } }

type ProfileRow = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  discord_tag: string | null
  role: 'member' | 'moderator' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

type GameRow = {
  id: string
  name: string
  logo_url: string | null
}

type UserGameRow = {
  id: string
  game_id: string
  in_game_name: string | null
  current_rank: string | null
  peak_rank: string | null
  game: GameRow
}

type PlayerStatRow = {
  id: string
  game_id: string
  wins: number
  losses: number
  draws: number
  rank_points: number
  season: string
  game: GameRow
}

type TournamentTeamRow = {
  id: string
  team_name: string
  status: 'pending' | 'approved' | 'rejected' | 'disqualified'
  registered_at: string
  tournament: {
    id: string
    name: string
    status: 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled'
    start_date: string | null
    game: GameRow
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('display_name, username, bio')
    .eq('username', params.username)
    .single<Pick<ProfileRow, 'display_name' | 'username' | 'bio'>>()

  if (!data) return { title: 'Profile Not Found' }
  const name = data.display_name ?? data.username
  return {
    title: `${name} — Profile`,
    description: data.bio ?? `View ${name}'s profile on our esports club.`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createClient()

  const [{ data: { user } }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('*').eq('username', params.username).single<ProfileRow>(),
  ])

  if (!profile) notFound()

  const isOwner = user?.id === profile.id

  const [userGamesResult, statsResult, allGamesResult, tournamentHistoryResult] = await Promise.all([
    supabase
      .from('user_games')
      .select('id, game_id, in_game_name, current_rank, peak_rank, game:games(id, name, logo_url)')
      .eq('user_id', profile.id),
    supabase
      .from('player_stats')
      .select('id, game_id, wins, losses, draws, rank_points, season, game:games(id, name, logo_url)')
      .eq('user_id', profile.id)
      .order('rank_points', { ascending: false }),
    supabase
      .from('games')
      .select('id, name, logo_url')
      .eq('is_supported', true)
      .order('sort_order'),
    supabase
      .from('tournament_teams')
      .select('id, team_name, status, registered_at, tournament:tournaments(id, name, status, start_date, game:games(id, name, logo_url))')
      .eq('captain_id', profile.id)
      .order('registered_at', { ascending: false })
      .limit(10),
  ])

  const userGames = (userGamesResult.data ?? []) as unknown as UserGameRow[]
  const stats = (statsResult.data ?? []) as unknown as PlayerStatRow[]
  const allGames = (allGamesResult.data ?? []) as GameRow[]
  const tournamentHistory = (tournamentHistoryResult.data ?? []) as unknown as TournamentTeamRow[]

  const linkedGameIds = new Set(userGames.map(ug => ug.game_id))
  const availableToLink = allGames.filter(g => !linkedGameIds.has(g.id))

  const tournamentStatusVariant: Record<TournamentTeamRow['tournament']['status'], 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled'> = {
    upcoming: 'upcoming',
    registration: 'registration',
    ongoing: 'ongoing',
    completed: 'completed',
    cancelled: 'cancelled',
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <ProfileHeader profile={profile} isOwner={isOwner} />
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: game accounts */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Game Accounts</h2>
          <div className="space-y-4">
            {userGames.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">
                {isOwner ? 'Link your game accounts below.' : 'No linked game accounts.'}
              </p>
            )}
            {userGames.map(ug => (
              <GameAccountCard
                key={ug.id}
                account={ug}
                game={ug.game}
                isOwner={isOwner}
              />
            ))}
            {isOwner && <AddGameAccountForm availableGames={availableToLink} />}
          </div>
        </div>

        {/* Right column: stats + tournament history */}
        <div className="lg:col-span-2">
          {/* Stats */}
          {stats.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Stats</h2>
              <div className="space-y-4">
                {stats.map(s => (
                  <ProfileStatsCard
                    key={s.id}
                    gameName={s.game.name}
                    gameLogoUrl={s.game.logo_url}
                    wins={s.wins}
                    losses={s.losses}
                    draws={s.draws}
                    rankPoints={s.rank_points}
                    season={s.season}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Tournament History */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Tournament History</h2>
            {tournamentHistory.length === 0 ? (
              <Card>
                <p className="text-sm text-[var(--text-muted)]">No tournament participation yet.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Tournament</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Game</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Team</th>
                      <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {tournamentHistory.map(team => (
                      <tr key={team.id} className="hover:bg-[var(--bg-elevated)]">
                        <td className="px-4 py-3">
                          <Link
                            href={`/tournaments/${team.tournament.id}`}
                            className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)]"
                          >
                            {team.tournament.name}
                          </Link>
                          {team.tournament.start_date && (
                            <div className="text-xs text-[var(--text-muted)]">
                              {new Date(team.tournament.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{team.tournament.game.name}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{team.team_name}</td>
                        <td className="px-4 py-3">
                          <Badge variant={tournamentStatusVariant[team.tournament.status]}>
                            {team.tournament.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

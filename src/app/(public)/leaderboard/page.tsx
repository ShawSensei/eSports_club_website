import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/features/leaderboard/LeaderboardTable'
import { LeaderboardFilters } from '@/components/features/leaderboard/LeaderboardFilters'

export const metadata: Metadata = { title: 'Leaderboard' }

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

type Game = { id: string; name: string; slug: string }

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { game?: string; season?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const gameSlug = searchParams.game ?? 'all'
  const season = searchParams.season ?? ''

  // Fetch games for filter
  const { data: gamesData } = await supabase
    .from('games')
    .select('id, name, slug')
    .eq('is_supported', true)
    .order('sort_order')
  const games = (gamesData ?? []) as Game[]

  // Fetch all distinct seasons
  const { data: seasonsData } = await supabase
    .from('player_stats')
    .select('season')
    .order('season', { ascending: false })
  const seasons = Array.from(new Set((seasonsData ?? []).map((r: any) => r.season as string)))

  // Build leaderboard query
  let query = supabase
    .from('player_stats')
    .select('id, rank_points, wins, losses, season, game_id, profiles(id, display_name, avatar_url, username), games(id, name, slug)')
    .order('rank_points', { ascending: false })
    .limit(100)

  if (gameSlug !== 'all') {
    const game = games.find(g => g.slug === gameSlug)
    if (game) query = query.eq('game_id', game.id)
  }

  if (season) query = query.eq('season', season)

  const { data } = await query
  const entries = (data ?? []) as unknown as PlayerStat[]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          Leaderboard
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Top ranked players in the club
        </p>
      </div>

      <div className="mb-8">
        <LeaderboardFilters games={games} seasons={seasons} activeGame={gameSlug} activeSeason={season} />
      </div>

      <LeaderboardTable entries={entries} currentUserId={user?.id} />
    </div>
  )
}

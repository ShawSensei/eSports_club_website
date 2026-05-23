import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { GameTabs } from '@/components/features/games/GameTabs'
import { NewsCard, type NewsCardData } from '@/components/features/news/NewsCard'
import { RosterGrid } from '@/components/features/games/RosterGrid'
import { GameLeaderboard } from '@/components/features/games/GameLeaderboard'

type PageParams = { params: { slug: string }; searchParams: { tab?: string } }

type GameRow = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
  current_patch: string | null
}

type RosterMember = {
  id: string
  in_game_name: string
  role: string | null
  is_captain: boolean
  joined_at: string
  profiles: { display_name: string | null; avatar_url: string | null; username: string }
}

type LeaderboardEntry = {
  id: string
  rank_points: number
  wins: number
  losses: number
  season: string
  profiles: { display_name: string | null; avatar_url: string | null; username: string }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('games')
    .select('name')
    .eq('slug', params.slug)
    .single<{ name: string }>()
  return { title: data?.name ?? 'Game' }
}

export default async function GameDetailPage({ params, searchParams }: PageParams) {
  const supabase = createClient()
  const tab = searchParams.tab ?? 'patch'

  const { data: gameData } = await supabase
    .from('games')
    .select('id, name, slug, logo_url, cover_url, current_patch')
    .eq('slug', params.slug)
    .eq('is_supported', true)
    .single()

  const game = gameData as unknown as GameRow | null
  if (!game) notFound()

  // Fetch data for the active tab only
  let patchPosts: NewsCardData[] = []
  let strategyPosts: NewsCardData[] = []
  let roster: RosterMember[] = []
  let leaderboard: LeaderboardEntry[] = []

  if (tab === 'patch') {
    const { data } = await supabase
      .from('news_posts')
      .select('id, title, slug, excerpt, cover_url, category, published_at, is_pinned, views, games(name, slug), profiles(display_name, avatar_url)')
      .eq('is_published', true)
      .eq('game_id', game.id)
      .eq('category', 'patch')
      .order('published_at', { ascending: false })
      .limit(12)
    patchPosts = (data ?? []) as unknown as NewsCardData[]
  }

  if (tab === 'strategy') {
    const { data } = await supabase
      .from('news_posts')
      .select('id, title, slug, excerpt, cover_url, category, published_at, is_pinned, views, games(name, slug), profiles(display_name, avatar_url)')
      .eq('is_published', true)
      .eq('game_id', game.id)
      .eq('category', 'strategy')
      .order('published_at', { ascending: false })
      .limit(12)
    strategyPosts = (data ?? []) as unknown as NewsCardData[]
  }

  if (tab === 'team') {
    const { data } = await supabase
      .from('team_roster')
      .select('id, in_game_name, role, is_captain, joined_at, profiles(display_name, avatar_url, username)')
      .eq('game_id', game.id)
      .eq('is_active', true)
      .order('is_captain', { ascending: false })
    roster = (data ?? []) as unknown as RosterMember[]
  }

  if (tab === 'leaderboard') {
    const { data } = await supabase
      .from('player_stats')
      .select('id, rank_points, wins, losses, season, profiles(display_name, avatar_url, username)')
      .eq('game_id', game.id)
      .order('rank_points', { ascending: false })
      .limit(10)
    leaderboard = (data ?? []) as unknown as LeaderboardEntry[]
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Game header */}
      <div className="mb-10">
        {game.cover_url && (
          <div className="relative mb-8 h-48 w-full overflow-hidden rounded-2xl sm:h-64">
            <Image src={game.cover_url} alt={game.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[rgba(10,10,15,0.4)] to-transparent" />
          </div>
        )}

        <div className="flex items-center gap-5">
          {game.logo_url ? (
            <Image src={game.logo_url} alt={`${game.name} logo`} width={72} height={72} className="rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-2xl text-3xl" style={{ background: 'var(--bg-elevated)' }}>🎮</div>
          )}
          <div>
            <h1 className="text-3xl font-black sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>{game.name}</h1>
            {game.current_patch && (
              <div className="mt-2">
                <Badge variant="patch">Patch {game.current_patch}</Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <GameTabs activeTab={tab} gameSlug={game.slug}>
        {/* Patch Notes */}
        {tab === 'patch' && (
          <TabContent
            posts={patchPosts}
            emptyMessage="No patch notes published yet."
          />
        )}

        {/* Strategies */}
        {tab === 'strategy' && (
          <TabContent
            posts={strategyPosts}
            emptyMessage="No strategy guides published yet."
          />
        )}

        {/* Team */}
        {tab === 'team' && (
          <RosterGrid members={roster} />
        )}

        {/* Leaderboard */}
        {tab === 'leaderboard' && (
          <GameLeaderboard entries={leaderboard} />
        )}
      </GameTabs>
    </div>
  )
}

function TabContent({ posts, emptyMessage }: { posts: NewsCardData[]; emptyMessage: string }) {
  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyMessage}</p>
      </div>
    )
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map(post => <NewsCard key={post.id} post={post} />)}
    </div>
  )
}

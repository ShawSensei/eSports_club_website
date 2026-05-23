import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelativeDate } from '@/lib/utils'
import { HomeClient } from './HomeClient'

export const metadata: Metadata = {
  title: 'Esports Club — Compete. Dominate. Win.',
  description: 'Official Esports Club — news, tournaments, roster, and leaderboards.',
}

type HomeNewsPost = {
  id: string; title: string; slug: string; excerpt: string | null
  cover_url: string | null; category: string; published_at: string | null
  is_pinned: boolean
  games: { name: string; slug: string } | null
  profiles: { display_name: string | null; avatar_url: string | null } | null
}

type HomeTournament = {
  id: string; name: string; status: string; start_date: string | null
  max_teams: number | null; registration_open: boolean
  games: { name: string; logo_url: string | null; slug: string } | null
}

type HomeGame = { id: string; name: string; slug: string; logo_url: string | null; cover_url: string | null }

export default async function HomePage() {
  const supabase = createClient()

  const [newsRes, tournRes, gamesRes, membersRes, activeTRes, gCountRes] = await Promise.all([
    supabase
      .from('news_posts')
      .select('id, title, slug, excerpt, cover_url, category, published_at, is_pinned, games(name, slug), profiles(display_name, avatar_url)')
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(4),
    supabase
      .from('tournaments')
      .select('id, name, status, start_date, max_teams, registration_open, games(name, logo_url, slug)')
      .in('status', ['upcoming', 'registration'])
      .order('start_date', { ascending: true })
      .limit(4),
    supabase
      .from('games')
      .select('id, name, slug, logo_url, cover_url')
      .eq('is_supported', true)
      .order('sort_order')
      .limit(6),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('tournaments').select('id', { count: 'exact', head: true }).in('status', ['ongoing', 'registration']),
    supabase.from('games').select('id', { count: 'exact', head: true }).eq('is_supported', true),
  ])

  const news        = (newsRes.data  ?? []) as unknown as HomeNewsPost[]
  const tournaments = (tournRes.data ?? []) as unknown as HomeTournament[]
  const games       = (gamesRes.data ?? []) as unknown as HomeGame[]

  const stats = [
    { label: 'Members',            value: membersRes.count  ?? 0 },
    { label: 'Active Tournaments', value: activeTRes.count  ?? 0 },
    { label: 'Supported Games',    value: gCountRes.count   ?? 0 },
  ]

  return <HomeClient news={news} tournaments={tournaments} games={games} stats={stats} />
}

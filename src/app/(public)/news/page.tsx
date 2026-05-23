import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { NewsCard, type NewsCardData } from '@/components/features/news/NewsCard'
import { NewsFilters } from '@/components/features/news/NewsFilters'
import { Pagination } from '@/components/features/news/Pagination'
import { SkeletonCard } from '@/components/ui/Skeleton'

export const metadata: Metadata = { title: 'News' }

const PER_PAGE = 12

type SearchParams = {
  page?: string
  category?: string
  game?: string
  q?: string
}

export default async function NewsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const category = searchParams.category ?? ''
  const gameSlug = searchParams.game ?? ''
  const query = searchParams.q ?? ''

  const gamesResult = await supabase
    .from('games')
    .select('id, name, slug')
    .eq('is_supported', true)
    .order('name')
  const games = (gamesResult.data ?? []) as { id: string; name: string; slug: string }[]

  // Resolve game slug → id if filtering by game
  let gameId: string | null = null
  if (gameSlug) {
    const found = games.find(g => g.slug === gameSlug)
    if (found) gameId = found.id
  }

  let dbQuery = supabase
    .from('news_posts')
    .select('id, title, slug, excerpt, cover_url, category, published_at, is_pinned, view_count, games(name, slug), profiles(display_name, avatar_url)', { count: 'exact' })
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  if (category) dbQuery = dbQuery.eq('category', category)
  if (gameId) dbQuery = dbQuery.eq('game_id', gameId)
  if (query) dbQuery = dbQuery.ilike('title', `%${query}%`)

  const { data, count } = await dbQuery
  const posts = (data ?? []) as unknown as NewsCardData[]
  const total = count ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          News
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {total} {total === 1 ? 'post' : 'posts'}{category ? ` in ${category}` : ''}{gameSlug ? ` for ${games.find(g => g.slug === gameSlug)?.name ?? gameSlug}` : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense>
          <NewsFilters games={games} />
        </Suspense>
      </div>

      {/* Grid */}
      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>No posts found</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map(post => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > PER_PAGE && (
        <div className="mt-12">
          <Suspense>
            <Pagination page={page} total={total} perPage={PER_PAGE} />
          </Suspense>
        </div>
      )}
    </div>
  )
}

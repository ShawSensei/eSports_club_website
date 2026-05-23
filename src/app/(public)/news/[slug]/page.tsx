import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { NewsCard, type NewsCardData } from '@/components/features/news/NewsCard'
import { PostBody } from '@/components/features/news/PostBody'
import { ShareButtons } from '@/components/features/news/ShareButtons'
import { formatDate } from '@/lib/utils'

type PageParams = { params: { slug: string } }

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('news_posts')
    .select('title, excerpt, cover_url')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single<{ title: string; excerpt: string | null; cover_url: string | null }>()

  if (!data) return { title: 'Post Not Found' }
  return {
    title: data.title,
    description: data.excerpt ?? undefined,
    openGraph: {
      title: data.title,
      description: data.excerpt ?? undefined,
      images: data.cover_url ? [data.cover_url] : [],
    },
  }
}

type PostDetail = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  cover_url: string | null
  category: string
  published_at: string | null
  view_count: number
  game_id: string | null
  games: { id: string; name: string; slug: string } | null
  profiles: { display_name: string | null; avatar_url: string | null; username: string | null } | null
}

export default async function NewsPostPage({ params }: PageParams) {
  const supabase = createClient()

  const { data } = await supabase
    .from('news_posts')
    .select('id, title, slug, excerpt, body, cover_url, category, published_at, view_count, game_id, games(id, name, slug), profiles(display_name, avatar_url, username)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  const post = data as unknown as PostDetail | null
  if (!post) notFound()

  // Increment view count — fire and forget. Cast bypasses hand-written type limitation.
  void (supabase as any).rpc('increment_post_views', { post_id: post.id })

  // Related posts — same game or same category, excluding this post
  let relatedQuery = supabase
    .from('news_posts')
    .select('id, title, slug, excerpt, cover_url, category, published_at, is_pinned, view_count, games(name, slug), profiles(display_name, avatar_url)')
    .eq('is_published', true)
    .neq('id', post.id)
    .limit(3)

  if (post.game_id) {
    relatedQuery = relatedQuery.eq('game_id', post.game_id)
  } else {
    relatedQuery = relatedQuery.eq('category', post.category)
  }
  relatedQuery = relatedQuery.order('published_at', { ascending: false })

  const { data: relatedData } = await relatedQuery
  const related = (relatedData ?? []) as unknown as NewsCardData[]

  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/news/${post.slug}`

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link href="/news" className="hover:text-white transition-colors">News</Link>
        <span>/</span>
        <Badge variant={post.category as any}>{post.category}</Badge>
      </nav>

      {/* Cover */}
      {post.cover_url && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl sm:h-96">
          <Image src={post.cover_url} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
        </div>
      )}

      {/* Title & meta */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant={post.category as any}>{post.category}</Badge>
          {post.games && (
            <Link href={`/games/${post.games.slug}`} className="text-sm transition-colors hover:underline" style={{ color: 'var(--accent-primary)' }}>
              {post.games.name}
            </Link>
          )}
        </div>

        <h1 className="mb-4 text-3xl font-black leading-tight sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mb-6 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {post.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <Avatar src={post.profiles?.avatar_url} name={post.profiles?.display_name} size="md" />
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {post.profiles?.display_name ?? 'Staff'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {post.published_at ? formatDate(post.published_at) : ''}
                {' · '}
                <span className="inline-flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  {post.view_count.toLocaleString()} views
                </span>
              </p>
            </div>
          </div>
          <ShareButtons title={post.title} url={postUrl} />
        </div>
      </div>

      {/* Body */}
      <PostBody body={post.body} />

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mt-16 border-t pt-12" style={{ borderColor: 'var(--border)' }}>
          <h2 className="mb-6 text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Related Posts</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => <NewsCard key={r.id} post={r} />)}
          </div>
        </section>
      )}
    </article>
  )
}

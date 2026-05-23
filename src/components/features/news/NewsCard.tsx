import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { formatRelativeDate } from '@/lib/utils'

export type NewsCardData = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  category: string
  published_at: string | null
  is_pinned: boolean
  views: number
  games: { name: string; slug: string } | null
  profiles: { display_name: string | null; avatar_url: string | null } | null
}

export function NewsCard({ post }: { post: NewsCardData }) {
  return (
    <Link href={`/news/${post.slug}`} className="group block h-full">
      <Card variant="hover" className="flex h-full flex-col overflow-hidden p-0">
        <div className="relative h-48 w-full overflow-hidden bg-[var(--bg-elevated)]">
          {post.cover_url ? (
            <Image
              src={post.cover_url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl opacity-20">📰</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
          {post.is_pinned && (
            <div className="absolute left-3 top-3">
              <Badge variant="announcement">Pinned</Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={post.category as any}>{post.category}</Badge>
            {post.games && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{post.games.name}</span>
            )}
          </div>

          <h3 className="mb-2 line-clamp-2 flex-1 font-bold leading-snug group-hover:text-[var(--accent-primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={post.profiles?.avatar_url} name={post.profiles?.display_name} size="xs" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {post.profiles?.display_name ?? 'Staff'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                {post.views.toLocaleString()}
              </span>
              <span>{post.published_at ? formatRelativeDate(post.published_at) : ''}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

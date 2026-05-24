import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NewsRowActions } from './NewsRowActions'

type PostRow = {
  id: string
  title: string
  slug: string
  category: 'news' | 'announcement' | 'patch' | 'strategy' | 'event'
  is_published: boolean
  is_pinned: boolean
  views: number
  published_at: string | null
  created_at: string
  author: { username: string; display_name: string | null } | null
}

export default async function AdminNewsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('news_posts')
    .select('id, title, slug, category, is_published, is_pinned, views, published_at, created_at, author:profiles(username, display_name)')
    .order('created_at', { ascending: false })

  const posts = (data ?? []) as unknown as PostRow[]

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">News Manager</h1>
        <Link href="/admin/news/new">
          <Button size="sm">+ New Post</Button>
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
          <div className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
            <span>Date</span>
            <span />
          </div>
        </div>
        {posts.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">No posts yet. <Link href="/admin/news/new" className="text-[var(--accent-primary)] hover:underline">Create one.</Link></p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {posts.map(post => (
              <div key={post.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 text-sm">
                <div>
                  <div className="font-medium text-[var(--text-primary)] line-clamp-1">{post.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {post.author?.display_name ?? post.author?.username ?? '—'}
                    {post.is_pinned && (
                      <span className="ml-2 inline-flex items-center gap-1 align-middle" style={{ color: 'var(--accent-primary)' }} title="Pinned">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="17" x2="12" y2="22" />
                          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={post.category}>{post.category}</Badge>
                <Badge variant={post.is_published ? 'registration' : 'default'}>
                  {post.is_published ? 'Published' : 'Draft'}
                </Badge>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(post.published_at ?? post.created_at).toLocaleDateString()}
                </span>
                <NewsRowActions
                  id={post.id}
                  isPublished={post.is_published}
                  isPinned={post.is_pinned}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

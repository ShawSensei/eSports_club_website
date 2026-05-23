import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { PostForm } from '../PostForm'

type PostRow = {
  id: string
  title: string
  category: string
  game_id: string | null
  excerpt: string | null
  body: string
  tags: string[]
  cover_url: string | null
  is_published: boolean
  is_pinned: boolean
}

type GameRow = { id: string; name: string }

export default async function AdminEditPostPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: post }, { data: gamesData }] = await Promise.all([
    supabase.from('news_posts').select('id, title, category, game_id, excerpt, body, tags, cover_url, is_published, is_pinned').eq('id', params.id).single<PostRow>(),
    supabase.from('games').select('id, name').eq('is_supported', true).order('sort_order'),
  ])

  if (!post) notFound()

  const games = (gamesData ?? []) as GameRow[]

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Edit Post</h1>
      <Card>
        <PostForm games={games} post={post} />
      </Card>
    </div>
  )
}

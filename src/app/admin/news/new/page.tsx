import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { PostForm } from '../PostForm'

type GameRow = { id: string; name: string }

export default async function AdminNewPostPage() {
  const supabase = createClient()
  const { data } = await supabase.from('games').select('id, name').eq('is_supported', true).order('sort_order')
  const games = (data ?? []) as GameRow[]

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">New Post</h1>
      <Card>
        <PostForm games={games} />
      </Card>
    </div>
  )
}

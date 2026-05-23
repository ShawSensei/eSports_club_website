import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { GamesManager } from './GamesManager'

type GameRow = {
  id: string
  name: string
  slug: string
  current_patch: string | null
  is_supported: boolean
  sort_order: number
  logo_url: string | null
}

export default async function AdminGamesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single<{ role: string }>()
  if (profile?.role !== 'admin') redirect('/admin')

  const { data } = await supabase
    .from('games')
    .select('id, name, slug, current_patch, is_supported, sort_order, logo_url')
    .order('sort_order')

  const games = (data ?? []) as GameRow[]

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Games Manager</h1>
      <Card>
        <GamesManager games={games} />
      </Card>
    </div>
  )
}

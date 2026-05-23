import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { TournamentForm } from '../TournamentForm'

type GameRow = { id: string; name: string }

export default async function AdminNewTournamentPage() {
  const supabase = createClient()
  const { data } = await supabase.from('games').select('id, name').eq('is_supported', true).order('sort_order')
  const games = (data ?? []) as GameRow[]

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">New Tournament</h1>
      <Card>
        <TournamentForm games={games} />
      </Card>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { RosterManager } from './RosterManager'

type RosterRow = {
  id: string
  in_game_role: string | null
  jersey_number: number | null
  is_captain: boolean
  is_active: boolean
  joined_at: string
  player: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null
  game: { id: string; name: string } | null
}

type GameRow = { id: string; name: string }
type ProfileRow = { id: string; username: string; display_name: string | null }

export default async function AdminRosterPage() {
  const supabase = createClient()

  const [{ data: rosterData }, { data: gamesData }, { data: profilesData }] = await Promise.all([
    supabase
      .from('team_roster')
      .select('id, in_game_role, jersey_number, is_captain, is_active, joined_at, player:profiles(id, username, display_name, avatar_url), game:games(id, name)')
      .order('joined_at', { ascending: false }),
    supabase.from('games').select('id, name').eq('is_supported', true).order('sort_order'),
    supabase.from('profiles').select('id, username, display_name').eq('is_active', true).order('username'),
  ])

  const roster = (rosterData ?? []) as unknown as RosterRow[]
  const games = (gamesData ?? []) as GameRow[]
  const profiles = (profilesData ?? []) as ProfileRow[]

  return (
    <div className="max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Roster Manager</h1>
      <Card>
        <RosterManager roster={roster} games={games} profiles={profiles} />
      </Card>
    </div>
  )
}

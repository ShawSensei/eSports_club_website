import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { RosterGameFilter } from '@/components/features/roster/RosterGameFilter'

export const metadata: Metadata = { title: 'Roster' }

type Game = { id: string; name: string; slug: string; logo_url: string | null }

type RosterEntry = {
  id: string
  in_game_name: string
  role: string | null
  is_captain: boolean
  game_id: string
  profiles: { display_name: string | null; avatar_url: string | null; username: string }
  games: { id: string; name: string; slug: string; logo_url: string | null }
}

export default async function RosterPage({
  searchParams,
}: {
  searchParams: { game?: string }
}) {
  const supabase = createClient()
  const gameSlug = searchParams.game ?? 'all'

  const { data: gamesData } = await supabase
    .from('games')
    .select('id, name, slug, logo_url')
    .eq('is_supported', true)
    .order('sort_order')
  const games = (gamesData ?? []) as Game[]

  let query = supabase
    .from('team_roster')
    .select('id, in_game_name, role, is_captain, game_id, profiles(display_name, avatar_url, username), games(id, name, slug, logo_url)')
    .eq('is_active', true)
    .order('is_captain', { ascending: false })
    .order('in_game_name')

  if (gameSlug !== 'all') {
    const game = games.find(g => g.slug === gameSlug)
    if (game) query = query.eq('game_id', game.id)
  }

  const { data } = await query
  const roster = (data ?? []) as unknown as RosterEntry[]

  // Group by game
  const grouped = roster.reduce<Record<string, { game: Game; members: RosterEntry[] }>>((acc, entry) => {
    const g = entry.games as Game
    if (!acc[g.id]) acc[g.id] = { game: g, members: [] }
    acc[g.id].members.push(entry)
    return acc
  }, {})

  const groups = Object.values(grouped)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          Our Roster
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Meet the players representing the club
        </p>
      </div>

      {/* Game filter */}
      <div className="mb-10 overflow-x-auto">
        <RosterGameFilter games={games} active={gameSlug} />
      </div>

      {groups.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>No roster members found</p>
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map(({ game, members }) => (
            <section key={game.id}>
              {/* Game header */}
              <div className="mb-6 flex items-center gap-4">
                {game.logo_url ? (
                  <Image src={game.logo_url} alt={game.name} width={40} height={40} className="rounded-xl object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: 'var(--bg-elevated)' }}>🎮</div>
                )}
                <div>
                  <Link href={`/games/${game.slug}`} className="font-bold hover:underline" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {game.name}
                  </Link>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{members.length} player{members.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {members.map(member => (
                  <Link key={member.id} href={`/profile/${member.profiles.username}`} className="group block">
                    <Card variant="hover" className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={member.profiles.avatar_url}
                          name={member.profiles.display_name ?? member.in_game_name}
                          size="lg"
                        />
                        {member.is_captain && (
                          <span
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                            style={{ background: 'var(--accent-warning)', color: '#000' }}
                            title="Captain"
                          >
                            C
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-sm transition-colors group-hover:text-[var(--accent-primary)]" style={{ color: 'var(--text-primary)' }}>
                          {member.in_game_name}
                        </p>
                        {member.profiles.display_name && (
                          <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                            {member.profiles.display_name}
                          </p>
                        )}
                        {member.role && (
                          <span
                            className="mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--accent-primary)' }}
                          >
                            {member.role}
                          </span>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

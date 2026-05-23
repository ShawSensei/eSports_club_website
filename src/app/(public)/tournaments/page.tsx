import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { TournamentStatusTabs } from '@/components/features/tournaments/TournamentStatusTabs'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Tournaments' }

const STATUS_TABS = [
  { value: 'all',          label: 'All' },
  { value: 'upcoming',     label: 'Upcoming' },
  { value: 'registration', label: 'Registration Open' },
  { value: 'ongoing',      label: 'Ongoing' },
  { value: 'completed',    label: 'Completed' },
]

type Tournament = {
  id: string
  name: string
  status: string
  format: string
  cover_url: string | null
  prize_pool: string | null
  max_teams: number | null
  start_date: string | null
  end_date: string | null
  registration_open: boolean
  games: { name: string; slug: string; logo_url: string | null } | null
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const status = searchParams.status ?? 'all'

  let query = supabase
    .from('tournaments')
    .select('id, name, status, format, cover_url, prize_pool, max_teams, start_date, end_date, registration_open, games(name, slug, logo_url)')
    .order('start_date', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query
  const tournaments = (data ?? []) as unknown as Tournament[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          Tournaments
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''}{status !== 'all' ? ` · ${status}` : ''}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="mb-8 overflow-x-auto">
        <TournamentStatusTabs tabs={STATUS_TABS} active={status} />
      </div>

      {tournaments.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>No tournaments found</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Check back soon</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link key={t.id} href={`/tournaments/${t.id}`} className="group block">
              <Card variant="hover" className="flex h-full flex-col overflow-hidden p-0">
                {/* Cover */}
                <div className="relative h-44 w-full overflow-hidden bg-[var(--bg-elevated)]">
                  {t.cover_url ? (
                    <Image src={t.cover_url} alt={t.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl opacity-10">🏆</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    <Badge variant={t.status as any}>{t.status}</Badge>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {/* Game + format */}
                  <div className="mb-3 flex items-center gap-2">
                    {t.games?.logo_url && (
                      <Image src={t.games.logo_url} alt={t.games.name} width={20} height={20} className="rounded object-cover" />
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.games?.name ?? 'Unknown game'}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{t.format.replace(/_/g, ' ')}</span>
                  </div>

                  <h3 className="mb-3 font-bold leading-snug group-hover:text-[var(--accent-primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {t.name}
                  </h3>

                  <div className="mt-auto space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.start_date && (
                      <p>📅 {formatDate(t.start_date)}</p>
                    )}
                    {t.max_teams && (
                      <p>👥 Max {t.max_teams} teams</p>
                    )}
                    {t.prize_pool && (
                      <p>🏆 {t.prize_pool}</p>
                    )}
                  </div>

                  {t.registration_open && (
                    <div
                      className="mt-4 rounded-lg py-2 text-center text-xs font-bold"
                      style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-success)', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                      Registration Open
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

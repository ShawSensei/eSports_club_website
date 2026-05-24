import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { TournamentStatusTabs } from '@/components/features/tournaments/TournamentStatusTabs'
import { formatDate } from '@/lib/utils'
import { AnimatedGrid, AnimatedGridItem } from '@/components/ui/AnimatedGrid'

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
    query = query.eq('status', status as any)
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
        <AnimatedGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <AnimatedGridItem key={t.id}>
            <Link href={`/tournaments/${t.id}`} className="group block">
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
                      <p className="flex items-center gap-1.5">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDate(t.start_date)}
                      </p>
                    )}
                    {t.max_teams && (
                      <p className="flex items-center gap-1.5">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Max {t.max_teams} teams
                      </p>
                    )}
                    {t.prize_pool && (
                      <p className="flex items-center gap-1.5">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                          <path d="M4 22h16"/>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                        </svg>
                        {t.prize_pool}
                      </p>
                    )}
                  </div>

                  {t.registration_open && (
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-lg py-2"
                      style={{ background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.35)' }}>
                      <span style={{
                        display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                        background: 'var(--accent-green)',
                        boxShadow: '0 0 6px rgba(0,232,122,0.75)',
                        animation: 'live-dot 1.5s ease-in-out infinite',
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700,
                        letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-green)',
                      }}>
                        Registration Open
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      )}
    </div>
  )
}

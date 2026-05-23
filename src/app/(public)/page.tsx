import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelativeDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Esports Club — Home',
  description: 'Official Esports Club — news, tournaments, roster, and leaderboards.',
}

type HomeNewsPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  category: string
  published_at: string | null
  is_pinned: boolean
  games: { name: string; slug: string } | null
  profiles: { display_name: string | null; avatar_url: string | null } | null
}

type HomeTournament = {
  id: string
  name: string
  status: string
  start_date: string | null
  max_teams: number | null
  games: { name: string; logo_url: string | null; slug: string } | null
}

export default async function HomePage() {
  const supabase = createClient()

  const [newsResult, tournamentsResult, statsResult] = await Promise.all([
    supabase
      .from('news_posts')
      .select('id, title, slug, excerpt, cover_url, category, published_at, is_pinned, games(name, slug), profiles(display_name, avatar_url)')
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('tournaments')
      .select('id, name, status, start_date, max_teams, games(name, logo_url, slug)')
      .in('status', ['upcoming', 'registration'])
      .order('start_date', { ascending: true })
      .limit(2),
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('tournaments').select('id', { count: 'exact', head: true }).in('status', ['ongoing', 'registration']),
      supabase.from('games').select('id', { count: 'exact', head: true }).eq('is_supported', true),
    ]),
  ])

  const news = (newsResult.data ?? []) as unknown as HomeNewsPost[]
  const tournaments = (tournamentsResult.data ?? []) as unknown as HomeTournament[]
  const [membersRes, activeTourneysRes, gamesRes] = statsResult
  const stats = {
    members: membersRes.count ?? 0,
    activeTournaments: activeTourneysRes.count ?? 0,
    games: gamesRes.count ?? 0,
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-36">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,255,0.15) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', background: 'rgba(0,212,255,0.08)' }}
          >
            Now Recruiting
          </div>
          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-7xl" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-gradient-cyan">COMPETE.</span>{' '}
            <span className="text-gradient-purple">DOMINATE.</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>WIN.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Join an elite esports organisation competing across multiple titles. Train with the best, represent the club, and rise through the ranks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/apply"
              className="glow-cyan inline-flex h-12 items-center gap-2 rounded-xl px-8 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent-primary)', color: '#000' }}
            >
              Join the Club
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              href="/tournaments"
              className="inline-flex h-12 items-center gap-2 rounded-xl border px-8 text-sm font-bold transition-colors hover:border-white/30 hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              View Tournaments
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-[var(--border)]">
          {[
            { label: 'Members', value: stats.members },
            { label: 'Active Tournaments', value: stats.activeTournaments },
            { label: 'Games', value: stats.games },
          ].map(({ label, value }) => (
            <div key={label} className="py-6 text-center">
              <p className="text-3xl font-black sm:text-4xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
                {value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* News Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>Latest News</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Stay up to date with the club</p>
          </div>
          <Link href="/news" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent-primary)' }}>View All →</Link>
        </div>

        {news.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No news posts yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((post) => (
              <Link key={post.id} href={`/news/${post.slug}`} className="group block">
                <Card variant="hover" className="h-full overflow-hidden p-0">
                  {post.cover_url && (
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image src={post.cover_url} alt={post.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={post.category as any}>{post.category}</Badge>
                      {post.is_pinned && <Badge variant="announcement">Pinned</Badge>}
                    </div>
                    <h3 className="mb-2 line-clamp-2 font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{post.excerpt}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <Avatar src={post.profiles?.avatar_url} name={post.profiles?.display_name} size="xs" />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {post.profiles?.display_name ?? 'Staff'} · {post.published_at ? formatRelativeDate(post.published_at) : ''}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Tournaments */}
      <section className="border-t py-16" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>Upcoming Tournaments</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Register your team and compete</p>
            </div>
            <Link href="/tournaments" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent-primary)' }}>All Tournaments →</Link>
          </div>

          {tournaments.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No upcoming tournaments scheduled.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {tournaments.map((t) => (
                <Link key={t.id} href={`/tournaments/${t.id}`} className="group block">
                  <Card variant="hover" className="flex items-center gap-5">
                    {t.games?.logo_url ? (
                      <Image src={t.games.logo_url} alt={t.games.name} width={56} height={56} className="flex-shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: 'var(--bg-elevated)' }}>🎮</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant={t.status as any}>{t.status}</Badge>
                        {t.games && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.games.name}</span>}
                      </div>
                      <p className="truncate font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                      <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {t.start_date
                          ? new Date(t.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'Date TBD'}
                        {t.max_teams && ` · Max ${t.max_teams} teams`}
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: 'var(--accent-primary)' }}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="mx-auto max-w-3xl rounded-2xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.08) 100%)', border: '1px solid var(--border)' }}
        >
          <h2 className="mb-3 text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>Ready to Compete?</h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Apply for membership and join a community of dedicated players pushing each other to the next level.
          </p>
          <Link
            href="/apply"
            className="inline-flex h-12 items-center gap-2 rounded-xl px-8 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent-primary)', color: '#000' }}
          >
            Apply Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>
    </>
  )
}

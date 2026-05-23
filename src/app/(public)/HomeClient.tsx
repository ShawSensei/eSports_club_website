'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { TiltCard } from '@/components/ui/TiltCard'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { formatRelativeDate } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

type HomeNewsPost = {
  id: string; title: string; slug: string; excerpt: string | null
  cover_url: string | null; category: string; published_at: string | null
  is_pinned: boolean
  games: { name: string; slug: string } | null
  profiles: { display_name: string | null; avatar_url: string | null } | null
}
type HomeTournament = {
  id: string; name: string; status: string; start_date: string | null
  max_teams: number | null; registration_open: boolean
  games: { name: string; logo_url: string | null; slug: string } | null
}
type HomeGame = { id: string; name: string; slug: string; logo_url: string | null; cover_url: string | null }

interface HomeClientProps {
  news: HomeNewsPost[]
  tournaments: HomeTournament[]
  games: HomeGame[]
  stats: { label: string; value: number }[]
}

export function HomeClient({ news, tournaments, games, stats }: HomeClientProps) {
  const badgeRef    = useRef<HTMLDivElement>(null)
  const line1Ref    = useRef<HTMLSpanElement>(null)
  const line2Ref    = useRef<HTMLSpanElement>(null)
  const line3Ref    = useRef<HTMLSpanElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctasRef     = useRef<HTMLDivElement>(null)
  const statsRef    = useRef<HTMLDivElement>(null)
  const newsRef     = useRef<HTMLDivElement>(null)
  const tournRef    = useRef<HTMLDivElement>(null)
  const gamesRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Hero: animate each line individually (preserves gradient CSS) ──
      const tl = gsap.timeline({ delay: 0.15 })

      tl.from(badgeRef.current, {
        opacity: 0, scale: 0.85, duration: 0.45, ease: 'back.out(2)',
      })
      // Each headline line slides up from below — NO SplitType (breaks background-clip: text)
      .from([line1Ref.current, line2Ref.current, line3Ref.current], {
        opacity: 0, y: 50, skewY: 2,
        stagger: 0.12, duration: 0.65, ease: 'power3.out',
      }, '-=0.15')
      .from(subtitleRef.current, {
        opacity: 0, y: 20, duration: 0.45, ease: 'power2.out',
      }, '-=0.35')
      .from(ctasRef.current?.querySelectorAll('a') ?? [], {
        opacity: 0, y: 14, stagger: 0.08, duration: 0.4, ease: 'power2.out',
      }, '-=0.25')
      .from(statsRef.current?.querySelectorAll('.stat-item') ?? [], {
        opacity: 0, y: 16, stagger: 0.08, duration: 0.4, ease: 'power2.out',
      }, '-=0.2')

      // ── Scroll reveals ──
      if (newsRef.current) {
        gsap.from(newsRef.current.querySelectorAll('.news-card'), {
          opacity: 0, y: 44, stagger: 0.07, duration: 0.65, ease: 'power2.out',
          scrollTrigger: { trigger: newsRef.current, start: 'top 82%', once: true },
        })
      }

      if (tournRef.current) {
        gsap.from(tournRef.current.querySelectorAll('.tourn-card'), {
          opacity: 0, y: 32, stagger: 0.06, duration: 0.55, ease: 'power2.out',
          scrollTrigger: { trigger: tournRef.current, start: 'top 82%', once: true },
        })
      }

      if (gamesRef.current) {
        gsap.from(gamesRef.current.querySelectorAll('.game-pill'), {
          opacity: 0, x: -16, stagger: 0.04, duration: 0.4, ease: 'power2.out',
          scrollTrigger: { trigger: gamesRef.current, start: 'top 88%', once: true },
        })
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Layered background */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 90% 70% at 15% 50%, rgba(0,212,255,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 85% 20%, rgba(124,58,237,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 50% 80% at 70% 80%, rgba(0,212,255,0.05) 0%, transparent 50%),
            #000
          `,
        }} />

        {/* Dot grid */}
        <div className="bg-dot-grid pointer-events-none absolute inset-0" style={{ opacity: 0.5 }} />

        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />

        {/* ── Content ── */}
        <div className="relative mx-auto w-full max-w-6xl px-8 py-28 sm:px-12 lg:px-16">

          {/* Badge */}
          <div ref={badgeRef} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{ border: '1px solid rgba(0,212,255,0.4)', color: 'var(--accent-primary)', background: 'rgba(0,212,255,0.08)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
              Now Recruiting — Season 2025
            </span>
          </div>

          {/* Headline — each line ref'd separately to preserve gradient CSS */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 9vw, 8.5rem)', fontWeight: 900, lineHeight: 0.92, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '2rem', overflow: 'hidden' }}>
            <span ref={line1Ref} className="text-gradient-cyan block" style={{ display: 'block', paddingBottom: '0.05em' }}>Compete.</span>
            <span ref={line2Ref} className="text-gradient-purple block" style={{ display: 'block', paddingBottom: '0.05em' }}>Dominate.</span>
            <span ref={line3Ref} style={{ display: 'block', color: 'var(--text-primary)' }}>Win.</span>
          </h1>

          <p ref={subtitleRef}
            style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)', maxWidth: '500px', lineHeight: 1.75, marginBottom: '2.75rem' }}>
            Join an elite esports organisation competing across multiple titles.
            Train with the best, represent the club, and rise through the ranks.
          </p>

          <div ref={ctasRef} className="flex flex-wrap items-center gap-4">
            <Link href="/apply"
              className="group inline-flex h-14 items-center gap-3 rounded-xl px-8 text-sm font-black uppercase tracking-widest transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--accent-primary)', color: '#000', fontFamily: 'var(--font-display)', letterSpacing: '0.12em', boxShadow: '0 0 0 rgba(0,212,255,0)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(0,212,255,0.5)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 rgba(0,212,255,0)'}
            >
              Join the Club
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/tournaments"
              className="inline-flex h-14 items-center gap-3 rounded-xl border px-8 text-sm font-black uppercase tracking-widest transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em' }}>
              View Tournaments
            </Link>
          </div>

          {/* Inline stats */}
          <div ref={statsRef} className="mt-16 flex flex-wrap items-start gap-10">
            {stats.map(({ label, value }) => (
              <div key={label} className="stat-item">
                <div className="text-4xl font-black tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
                  <AnimatedCounter value={value} />
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side label */}
        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex" style={{ color: 'rgba(255,255,255,0.08)' }}>
          <div style={{ writingMode: 'vertical-rl', fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.3em', fontWeight: 700 }}>ESPORTS CLUB · 2025</div>
          <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ color: 'rgba(0,212,255,0.4)', fontSize: '0.6rem' }}>●</div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GAMES STRIP
      ═══════════════════════════════════════════ */}
      {games.length > 0 && (
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,212,255,0.025)' }}>
          <div className="mx-auto max-w-6xl px-8 py-5 sm:px-12 lg:px-16">
            <div ref={gamesRef} className="flex flex-wrap items-center gap-2.5">
              <span className="mr-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.18em' }}>
                Titles
              </span>
              {games.map(game => (
                <Link key={game.id} href={`/games/${game.slug}`}
                  className="game-pill group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:border-[var(--accent-primary)] hover:bg-[rgba(0,212,255,0.07)] hover:text-white"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                  {game.logo_url && <Image src={game.logo_url} alt={game.name} width={14} height={14} className="rounded-full object-cover" />}
                  {game.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          NEWS
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20">
        {/* Section background accent */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 80% 50%, rgba(124,58,237,0.04) 0%, transparent 60%)',
        }} />

        <div className="relative mx-auto max-w-6xl px-8 sm:px-12 lg:px-16">
          {/* Section header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.2em' }}>Latest</p>
              <h2 className="text-4xl font-black uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1, color: '#fff' }}>News</h2>
            </div>
            <Link href="/news" className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-white" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}>All News →</Link>
          </div>

          {news.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No news yet.</p>
          ) : (
            <div ref={newsRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Featured card — spans 2 cols + 2 rows */}
              {news[0] && (
                <Link href={`/news/${news[0].slug}`} className="news-card group block sm:col-span-2 lg:row-span-2">
                  <TiltCard className="h-full" intensity={6}>
                    <div className="relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl lg:min-h-[420px]"
                      style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {news[0].cover_url && (
                        <Image src={news[0].cover_url} alt={news[0].title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)' }} />
                      {/* Cyan accent glow at bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)', opacity: 0.6 }} />
                      <div className="relative z-10 p-6">
                        <Badge variant={news[0].category as any} className="mb-3">{news[0].category}</Badge>
                        <h3 className="text-xl font-black uppercase leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>{news[0].title}</h3>
                        {news[0].excerpt && <p className="mt-2 line-clamp-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{news[0].excerpt}</p>}
                        <div className="mt-4 flex items-center gap-2">
                          <Avatar src={news[0].profiles?.avatar_url} name={news[0].profiles?.display_name} size="xs" />
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {news[0].profiles?.display_name ?? 'Staff'} · {news[0].published_at ? formatRelativeDate(news[0].published_at) : ''}
                          </span>
                        </div>
                      </div>
                      {/* Corner brackets */}
                      <div className="absolute left-0 top-0 h-6 w-6 border-l border-t opacity-60 transition-opacity group-hover:opacity-100" style={{ borderColor: 'var(--accent-primary)' }} />
                      <div className="absolute bottom-0 right-0 h-6 w-6 border-b border-r opacity-60 transition-opacity group-hover:opacity-100" style={{ borderColor: 'var(--accent-primary)' }} />
                    </div>
                  </TiltCard>
                </Link>
              )}

              {news.slice(1).map(post => (
                <Link key={post.id} href={`/news/${post.slug}`} className="news-card group block">
                  <TiltCard className="h-full" intensity={10}>
                    <div className="relative flex h-full flex-col overflow-hidden rounded-xl transition-all duration-300"
                      style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', minHeight: 190 }}>
                      {/* Hover glow border */}
                      <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ boxShadow: 'inset 0 0 0 1px rgba(0,212,255,0.3)' }} />
                      {post.cover_url ? (
                        <>
                          <div className="relative h-28 w-full shrink-0 overflow-hidden">
                            <Image src={post.cover_url} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--bg-card))' }} />
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <Badge variant={post.category as any} className="mb-2 self-start">{post.category}</Badge>
                            <h3 className="line-clamp-2 text-sm font-black uppercase leading-snug" style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>{post.title}</h3>
                            <span className="mt-auto pt-3 text-xs" style={{ color: 'var(--text-muted)' }}>{post.published_at ? formatRelativeDate(post.published_at) : ''}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-1 flex-col p-4">
                          <Badge variant={post.category as any} className="mb-2 self-start">{post.category}</Badge>
                          <h3 className="line-clamp-3 text-sm font-black uppercase leading-snug" style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>{post.title}</h3>
                          {post.excerpt && <p className="mt-2 line-clamp-2 text-xs" style={{ color: 'var(--text-muted)' }}>{post.excerpt}</p>}
                          <span className="mt-auto pt-3 text-xs" style={{ color: 'var(--text-muted)' }}>{post.published_at ? formatRelativeDate(post.published_at) : ''}</span>
                        </div>
                      )}
                    </div>
                  </TiltCard>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TOURNAMENTS
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Purple-tinted background */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 70% 80% at 10% 50%, rgba(124,58,237,0.06) 0%, transparent 55%),
            rgba(10,10,10,1)
          `,
        }} />
        <div className="bg-line-grid pointer-events-none absolute inset-0" style={{ opacity: 0.3 }} />

        <div className="relative mx-auto max-w-6xl px-8 sm:px-12 lg:px-16">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: '#a855f7', fontFamily: 'var(--font-display)', letterSpacing: '0.2em' }}>Compete</p>
              <h2 className="text-4xl font-black uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', lineHeight: 1, color: '#fff' }}>Tournaments</h2>
            </div>
            <Link href="/tournaments" className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-white" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}>All →</Link>
          </div>

          {tournaments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No upcoming tournaments.</p>
          ) : (
            <div ref={tournRef} className="grid gap-3 sm:grid-cols-2">
              {tournaments.map(t => (
                <Link key={t.id} href={`/tournaments/${t.id}`} className="tourn-card group block">
                  <TiltCard className="rounded-xl" intensity={8}>
                    <div className="relative flex items-center gap-4 overflow-hidden rounded-xl px-5 py-4 transition-all duration-300"
                      style={{ background: 'rgba(18,10,30,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}>
                      {/* Hover glow */}
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: 'radial-gradient(ellipse at left, rgba(124,58,237,0.08), transparent 70%)', boxShadow: 'inset 0 0 0 1px rgba(124,58,237,0.4)' }} />
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                        style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                        {t.games?.logo_url
                          ? <Image src={t.games.logo_url} alt={t.games.name} width={48} height={48} className="object-cover" />
                          : <span className="text-xl">🏆</span>}
                      </div>
                      <div className="relative min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <Badge variant={t.status as any}>{t.status}</Badge>
                          {t.registration_open && (
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-success)', fontFamily: 'var(--font-display)' }}>REG OPEN</span>
                          )}
                        </div>
                        <p className="truncate font-black uppercase" style={{ fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '-0.01em' }}>{t.name}</p>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {t.start_date ? new Date(t.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                          {t.max_teams && ` · ${t.max_teams} teams max`}
                        </p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="relative shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                        style={{ color: '#a855f7' }}>
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </TiltCard>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-8 py-28 sm:px-12 lg:px-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Line grid */}
        <div className="bg-line-grid pointer-events-none absolute inset-0" style={{ opacity: 0.4 }} />
        {/* Cyan radial glow */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
          style={{ height: 400, background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(0,212,255,0.07) 0%, transparent 65%)' }} />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Bracketed title */}
          <div className="relative mx-auto mb-12 inline-block px-12 py-6">
            <div className="absolute left-0 top-0 h-7 w-7 border-l border-t" style={{ borderColor: 'var(--accent-primary)', opacity: 0.8 }} />
            <div className="absolute right-0 top-0 h-7 w-7 border-r border-t" style={{ borderColor: 'var(--accent-primary)', opacity: 0.8 }} />
            <div className="absolute bottom-0 left-0 h-7 w-7 border-b border-l" style={{ borderColor: 'var(--accent-primary)', opacity: 0.8 }} />
            <div className="absolute bottom-0 right-0 h-7 w-7 border-b border-r" style={{ borderColor: 'var(--accent-primary)', opacity: 0.8 }} />
            <h2 className="glitch text-6xl font-black uppercase sm:text-8xl"
              data-text="Ready?"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Ready?
            </h2>
          </div>

          <p className="mx-auto mb-10 max-w-lg text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Apply for membership and join a community of dedicated players pushing each other to the next level. Season 2025 is open.
          </p>

          <Link href="/apply"
            className="group inline-flex h-14 items-center gap-3 rounded-xl px-10 text-sm font-black uppercase tracking-widest transition-all duration-200 hover:scale-105"
            style={{ background: 'var(--accent-primary)', color: '#000', fontFamily: 'var(--font-display)', letterSpacing: '0.12em' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0,212,255,0.5)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
          >
            Apply Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>
    </>
  )
}

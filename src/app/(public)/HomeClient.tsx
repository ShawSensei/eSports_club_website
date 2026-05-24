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
import { Marquee } from '@/components/ui/Marquee'
import { GamesCarousel } from '@/components/ui/GamesCarousel'
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

const WORDS_1 = ['Frag Out', 'Clutch', 'Ranked', 'Esports', 'Season 2026', 'Compete', 'Dominate', 'Squad Up']
const WORDS_2 = ['Season 2026', 'Register Now', 'Competition', 'Esports Club', 'Pro Players', 'Champions', 'Training', 'Ranked Play']

// Scramble a number element when it enters view
function attachScramble(el: HTMLElement) {
  const finalText = el.textContent ?? ''
  const chars = '0123456789'
  let frame = 0
  const total = 22
  let rafId: number
  const step = () => {
    el.textContent = finalText.split('').map((ch, i) =>
      frame >= total - i * 5 ? ch : chars[Math.floor(Math.random() * 10)]
    ).join('')
    if (frame < total) { frame++; rafId = requestAnimationFrame(step) }
    else el.textContent = finalText
  }
  step()
  return () => cancelAnimationFrame(rafId)
}

export function HomeClient({ news, tournaments, games, stats }: HomeClientProps) {
  // Hero refs
  const heroRef    = useRef<HTMLElement>(null)
  const heroBgRef  = useRef<HTMLDivElement>(null)
  const badgeRef   = useRef<HTMLDivElement>(null)
  const line1Ref   = useRef<HTMLSpanElement>(null)
  const line2Ref   = useRef<HTMLSpanElement>(null)
  const line3Ref   = useRef<HTMLSpanElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctasRef     = useRef<HTMLDivElement>(null)
  const statsRef    = useRef<HTMLDivElement>(null)

  // Section refs
  const newsRef  = useRef<HTMLElement>(null)
  const tournRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const ctaRef   = useRef<HTMLElement>(null)

  useEffect(() => {
    let winScrambleTimer: ReturnType<typeof setInterval> | null = null
    let winRafId: number | null = null

    const ctx = gsap.context(() => {

      // ── Hero parallax: bg layer moves slower than content ──
      if (heroBgRef.current && heroRef.current) {
        gsap.to(heroBgRef.current, {
          y: '18%',
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      // ── Hero: clip-mask slide-up with back-ease stagger ──
      const tl = gsap.timeline({ delay: 0.1 })
      tl.from(badgeRef.current, { opacity: 0, y: 24, scale: 0.88, duration: 0.55, ease: 'back.out(2.5)' })
        .from(
          [line1Ref.current, line2Ref.current, line3Ref.current],
          { y: '112%', duration: 1.05, stagger: 0.1, ease: 'power4.out' },
          '-=0.3'
        )
        .from(subtitleRef.current, { opacity: 0, y: 26, duration: 0.5, ease: 'power2.out' }, '-=0.5')
        .from(ctasRef.current?.children ?? [], {
          opacity: 0, y: 18, scale: 0.9, stagger: 0.08,
          duration: 0.5, ease: 'back.out(2)',
        }, '-=0.35')
        .from(statsRef.current?.querySelectorAll('.stat-item') ?? [], {
          opacity: 0, y: 20, scale: 0.85, stagger: 0.06,
          duration: 0.55, ease: 'back.out(1.8)',
        }, '-=0.25')

      // ── Continuous glitch bursts on "Compete." and "Dominate." ──
      const GLITCH_CHARS = '!<>-_[]{}=+*?#@$%^&'

      function startWinScramble() {
        if (!line3Ref.current) return
        if (winRafId !== null) cancelAnimationFrame(winRafId)
        const total = 18
        let frame = 0
        const step = () => {
          if (!line3Ref.current) return
          line3Ref.current.textContent = 'Win.'.split('').map((ch, i) =>
            frame >= total - i * 4 ? ch : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          ).join('')
          if (frame < total) { frame++; winRafId = requestAnimationFrame(step) }
          else if (line3Ref.current) line3Ref.current.textContent = 'Win.'
        }
        step()
      }

      const glitch1 = gsap.timeline({ repeat: -1, repeatDelay: 3.5, paused: true })
      glitch1
        .to(line1Ref.current, { skewX: 7, x: 5, opacity: 0.62, duration: 0.055, ease: 'none' })
        .to(line1Ref.current, { skewX: -5, x: -4, opacity: 1, duration: 0.045, ease: 'none' })
        .to(line1Ref.current, { skewX: 3, x: 2, opacity: 0.8, duration: 0.04, ease: 'none' })
        .to(line1Ref.current, { skewX: 0, x: 0, opacity: 1, duration: 0.08, ease: 'power2.out' })
        .to(line1Ref.current, { skewX: -4, x: -5, opacity: 0.52, duration: 0.05, ease: 'none' }, '+=0.15')
        .to(line1Ref.current, { skewX: 0, x: 0, opacity: 1, duration: 0.12, ease: 'power2.out' })

      const glitch2 = gsap.timeline({ repeat: -1, repeatDelay: 2.8, paused: true })
      glitch2
        .to(line2Ref.current, { skewX: -6, x: -4, opacity: 0.58, duration: 0.06, ease: 'none' })
        .to(line2Ref.current, { skewX: 4, x: 3, opacity: 0.9, duration: 0.045, ease: 'none' })
        .to(line2Ref.current, { skewX: -2, x: -2, opacity: 0.72, duration: 0.04, ease: 'none' })
        .to(line2Ref.current, { skewX: 0, x: 0, opacity: 1, duration: 0.1, ease: 'power2.out' })
        .to(line2Ref.current, { skewX: 5, x: 4, opacity: 0.48, duration: 0.055, ease: 'none' }, '+=0.12')
        .to(line2Ref.current, { skewX: 0, x: 0, opacity: 1, duration: 0.14, ease: 'power2.out' })

      tl.eventCallback('onComplete', () => {
        glitch1.play()
        glitch2.play()
        winScrambleTimer = setInterval(startWinScramble, 3200)
      })

      // ── Magnetic buttons ──
      document.querySelectorAll<HTMLElement>('.magnetic-btn').forEach(btn => {
        const onMove = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect()
          const dx = e.clientX - (r.left + r.width / 2)
          const dy = e.clientY - (r.top + r.height / 2)
          const dist = Math.hypot(dx, dy)
          const max = 110
          if (dist < max) {
            const s = (max - dist) / max
            gsap.to(btn, { x: dx * s * 0.42, y: dy * s * 0.3, duration: 0.35, ease: 'power2.out' })
          } else {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.55)' })
          }
        }
        const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.55)' })
        window.addEventListener('mousemove', onMove)
        btn.addEventListener('mouseleave', onLeave)
      })

      // ── Section numbers: fade + scramble on enter ──
      gsap.utils.toArray<HTMLElement>('.sec-num').forEach(el => {
        gsap.from(el, {
          opacity: 0, x: -28, duration: 0.6, ease: 'power3.out',
          scrollTrigger: {
            trigger: el, start: 'top 88%', once: true,
            onEnter: () => attachScramble(el),
          },
        })
      })

      // ── News: alternating fly-in ──
      if (newsRef.current) {
        newsRef.current.querySelectorAll<HTMLElement>('.news-card').forEach((card, i) => {
          gsap.from(card, {
            opacity: 0,
            x: i === 0 ? -80 : i % 2 === 0 ? -50 : 50,
            y: i === 0 ? 0 : 28,
            rotation: i === 0 ? 0 : (i % 2 === 0 ? -1.5 : 1.5),
            duration: i === 0 ? 0.9 : 0.7,
            ease: 'power3.out',
            delay: i * 0.04,
            scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
          })
        })
      }

      // ── Tournaments: skew-slide with spring ──
      if (tournRef.current) {
        gsap.from(tournRef.current.querySelectorAll('.tourn-card'), {
          opacity: 0, x: -55, skewX: -4,
          duration: 0.65, ease: 'power3.out',
          stagger: { each: 0.08, from: 'start' },
          scrollTrigger: { trigger: tournRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
        })
      }

      // ── About: left fly-in + right cards stagger ──
      if (aboutRef.current) {
        gsap.from(aboutRef.current.querySelectorAll('.about-el'), {
          opacity: 0, y: 50, duration: 0.8, ease: 'power3.out',
          stagger: { each: 0.12 },
          scrollTrigger: { trigger: aboutRef.current, start: 'top 82%', toggleActions: 'play none none reverse' },
        })
        gsap.from(aboutRef.current.querySelectorAll('.about-card'), {
          opacity: 0, x: 44, duration: 0.65, ease: 'power3.out',
          stagger: { each: 0.1 },
          scrollTrigger: { trigger: aboutRef.current, start: 'top 78%', toggleActions: 'play none none reverse' },
        })
      }

      // ── CTA section: scale up from small ──
      if (ctaRef.current) {
        gsap.from(ctaRef.current.querySelectorAll('.cta-el'), {
          opacity: 0, y: 40, scale: 0.92,
          duration: 0.7, ease: 'back.out(1.6)',
          stagger: { each: 0.09 },
          scrollTrigger: { trigger: ctaRef.current, start: 'top 78%', toggleActions: 'play none none reverse' },
        })
      }

    })

    return () => {
      ctx.revert()
      if (winScrambleTimer !== null) clearInterval(winScrambleTimer)
      if (winRafId !== null) cancelAnimationFrame(winRafId)
    }
  }, [])

  return (
    <>
      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden">

        {/* Parallax bg layer */}
        <div ref={heroBgRef} className="pointer-events-none absolute inset-0 will-change-transform" style={{
          background: `
            radial-gradient(ellipse 80% 65% at 5% 40%, rgba(192,251,80,0.10) 0%, transparent 52%),
            radial-gradient(ellipse 55% 50% at 95% 12%, rgba(150,138,223,0.09) 0%, transparent 52%),
            radial-gradient(ellipse 45% 55% at 70% 90%, rgba(34,211,238,0.05) 0%, transparent 50%),
            radial-gradient(ellipse 30% 40% at 50% 50%, rgba(255,72,32,0.04) 0%, transparent 55%),
            var(--bg)
          `,
        }} />
        <div className="bg-dot-grid pointer-events-none absolute inset-0" style={{ opacity: 0.38 }} />

        {/* Horizontal scan line */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(192,251,80,0.2), transparent)',
            animation: 'scan-line 10s linear infinite', opacity: 0.5,
          }} />
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />

        <div className="relative mx-auto w-full max-w-6xl px-8 pt-16 pb-8 sm:px-12 lg:px-16">

          {/* Badge */}
          <div ref={badgeRef} className="mb-5">
            <span className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5"
              style={{
                border: '1px solid rgba(192,251,80,0.32)',
                color: 'var(--accent)',
                background: 'rgba(192,251,80,0.07)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
              }}>
              <span style={{
                display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 8px rgba(192,251,80,0.8)',
                animation: 'live-dot 1.5s ease-in-out infinite',
              }} />
              Now Recruiting · Season 2026
            </span>
          </div>

          {/* Headline — overflow:hidden wrapper per line = clip-mask reveal */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 0.9, marginBottom: '1.25rem' }}>
            <div style={{ overflow: 'hidden', paddingBottom: '0.06em' }}>
              <span ref={line1Ref} className="text-grad-cyan" style={{
                display: 'block',
                fontSize: 'clamp(3rem, 8.5vw, 7.5rem)',
                letterSpacing: '-0.035em', textTransform: 'uppercase',
              }}>Compete.</span>
            </div>
            <div style={{ overflow: 'hidden', paddingBottom: '0.06em' }}>
              <span ref={line2Ref} className="text-grad-purple" style={{
                display: 'block',
                fontSize: 'clamp(3rem, 8.5vw, 7.5rem)',
                letterSpacing: '-0.035em', textTransform: 'uppercase',
              }}>Dominate.</span>
            </div>
            <div style={{ overflow: 'hidden', paddingBottom: '0.06em' }}>
              <span ref={line3Ref} style={{
                display: 'block',
                fontSize: 'clamp(3rem, 8.5vw, 7.5rem)',
                letterSpacing: '-0.035em', textTransform: 'uppercase',
                color: 'rgba(240,240,255,0.90)',
              }}>Win.</span>
            </div>
          </h1>

          <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: 500, overflow: 'hidden', padding: '0.75rem 1.25rem' }}>
            {/* Scan sweep */}
            <div className="subtitle-scan" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(90deg, transparent 0%, rgba(192,251,80,0.18) 50%, transparent 100%)' }} />
            {/* Corner brackets */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10, borderTop: '1px solid rgba(192,251,80,0.5)', borderLeft: '1px solid rgba(192,251,80,0.5)' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderTop: '1px solid rgba(192,251,80,0.5)', borderRight: '1px solid rgba(192,251,80,0.5)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 10, height: 10, borderBottom: '1px solid rgba(192,251,80,0.5)', borderLeft: '1px solid rgba(192,251,80,0.5)' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderBottom: '1px solid rgba(192,251,80,0.5)', borderRight: '1px solid rgba(192,251,80,0.5)' }} />
            <p ref={subtitleRef} style={{
              color: 'var(--text-sub)',
              fontSize: 'clamp(0.88rem, 1.5vw, 1rem)',
              lineHeight: 1.82,
              position: 'relative',
            }}>
              Join an elite esports organisation competing across multiple titles.
              Train with the best, represent the club, and rise through the ranks.
            </p>
          </div>

          {/* CTAs with magnetic effect */}
          <div ref={ctasRef} className="flex flex-wrap items-center gap-4">
            <Link
              href="/apply"
              className="magnetic-btn group inline-flex h-14 items-center gap-3 rounded-xl px-8 text-sm font-black uppercase tracking-wider transition-colors duration-200"
              style={{
                background: 'linear-gradient(105deg, #c0fb50 30%, rgba(255,255,255,0.45) 50%, #c0fb50 70%)',
                backgroundSize: '250% 100%',
                animation: 'btn-shine 2.6s ease-in-out infinite',
                color: '#000',
                fontFamily: 'var(--font-display)', letterSpacing: '0.1em',
                boxShadow: '0 0 0 rgba(192,251,80,0)',
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(192,251,80,0.5)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 rgba(192,251,80,0)'}
            >
              Join the Club
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              href="/tournaments"
              className="magnetic-btn inline-flex h-14 items-center gap-3 rounded-xl border px-8 text-sm font-black uppercase tracking-wider transition-all duration-200 hover:bg-white/[0.04]"
              style={{
                borderColor: 'rgba(150,138,223,0.35)', color: 'var(--accent-purple)',
                fontFamily: 'var(--font-display)', letterSpacing: '0.1em',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(150,138,223,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
            >
              View Tournaments
            </Link>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="mt-10 flex flex-wrap items-start gap-x-12 gap-y-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
            {stats.map(({ label, value }, i) => (
              <div key={label} className="stat-item flex items-center gap-4">
                {i > 0 && (
                  <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                )}
                <div>
                  <div className="tabular-nums font-black" style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2.2rem, 4.5vw, 3rem)',
                    color: 'var(--accent)', letterSpacing: '-0.03em', lineHeight: 1,
                  }}>
                    <AnimatedCounter value={value} />
                    <span style={{ fontSize: '0.45em', opacity: 0.6 }}>+</span>
                  </div>
                  <div style={{
                    marginTop: '0.4rem', fontFamily: 'var(--font-display)',
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: 'var(--text-sub)',
                  }}>
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical side label */}
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
          style={{ color: 'rgba(240,240,255,0.07)' }}>
          <div style={{ writingMode: 'vertical-rl', fontFamily: 'var(--font-display)', fontSize: '0.52rem', letterSpacing: '0.35em', fontWeight: 700 }}>
            ESPORTS CLUB · 2026
          </div>
          <div style={{ width: 1, height: 56, background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ color: 'rgba(192,251,80,0.35)', fontSize: '0.45rem' }}>●</div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ color: 'rgba(255,255,255,0.18)', animation: 'float 2.8s ease-in-out infinite' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.5rem', letterSpacing: '0.22em', fontWeight: 700 }}>SCROLL</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE 1
      ══════════════════════════════════════════════ */}
      <div style={{
        borderTop: '1px solid rgba(192,251,80,0.08)',
        borderBottom: '1px solid rgba(192,251,80,0.08)',
        background: 'rgba(192,251,80,0.02)',
        padding: '14px 0',
      }}>
        <Marquee
          items={WORDS_1}
          direction="left"
          speed={30}
          className="text-xs uppercase"
          style={{ color: 'rgba(192,251,80,0.25)', letterSpacing: '0.15em' }}
        />
      </div>

      {/* ══════════════════════════════════════════════
          GAMES — Framer Motion drag carousel (spring physics)
      ══════════════════════════════════════════════ */}
      {games.length > 0 && (
        <section style={{ padding: '72px 0 80px', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle bg texture */}
          <div className="bg-dot-grid pointer-events-none absolute inset-0" style={{ opacity: 0.25 }} />
          <div className="pointer-events-none absolute inset-0" style={{
            background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(192,251,80,0.04) 0%, transparent 65%)',
          }} />

          <div className="relative mx-auto max-w-6xl px-0 sm:px-4">
            {/* Section header */}
            <div className="mb-8 flex items-center justify-between px-12">
              <div className="flex items-center gap-5">
                <span className="sec-num hidden text-5xl font-black sm:block"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', opacity: 0.1, lineHeight: 1, letterSpacing: '-0.04em' }}>
                  00
                </span>
                <div>
                  <p style={{ marginBottom: '0.3rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                    Our Titles
                  </p>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--text)', textTransform: 'uppercase' }}>
                    Games
                  </h2>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Drag to explore · Click to visit
              </p>
            </div>

            <GamesCarousel games={games} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          NEWS
      ══════════════════════════════════════════════ */}
      <section ref={newsRef} className="relative overflow-hidden py-24" style={{ background: 'var(--bg)' }}>
        {/* Lime glow bottom-left */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(ellipse 55% 40% at 0% 100%, rgba(192,251,80,0.05) 0%, transparent 60%)',
        }} />

        <div className="relative mx-auto max-w-6xl px-8 sm:px-12 lg:px-16">
          <div className="mb-12 flex items-end justify-between">
            <div className="flex items-start gap-5">
              <span className="sec-num hidden pt-1 text-5xl font-black sm:block"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', opacity: 0.1, lineHeight: 1, letterSpacing: '-0.04em' }}>
                01
              </span>
              <div>
                <p style={{ marginBottom: '0.3rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                  Latest
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--text)', textTransform: 'uppercase' }}>
                  News & Updates
                </h2>
              </div>
            </div>
            <Link href="/news"
              className="hidden shrink-0 text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-white sm:block"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.18em' }}>
              All News →
            </Link>
          </div>

          {news.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No news yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Featured card — 2 cols × 2 rows */}
              {news[0] && (
                <Link href={`/news/${news[0].slug}`} className="news-card news-featured group block sm:col-span-2 lg:row-span-2">
                  <TiltCard className="h-full" intensity={4}>
                    <div className="relative flex h-full min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl lg:min-h-[400px]"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      {news[0].cover_url && (
                        <Image src={news[0].cover_url} alt={news[0].title} fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 rounded-2xl"
                        style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.98) 0%, rgba(6,6,14,0.58) 52%, transparent 100%)' }} />
                      {/* Lime bottom accent */}
                      <div className="absolute inset-x-0 bottom-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(192,251,80,0.6), transparent)', opacity: 0.7 }} />
                      <div className="relative z-10 p-6">
                        <Badge variant={news[0].category as any} className="mb-3">{news[0].category}</Badge>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.05rem, 2.5vw, 1.4rem)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.08, color: 'var(--text)', marginBottom: '0.5rem' }}>
                          {news[0].title}
                        </h3>
                        {news[0].excerpt && (
                          <p className="line-clamp-2 text-sm" style={{ color: 'var(--text-sub)' }}>
                            {news[0].excerpt}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-2">
                          <Avatar src={news[0].profiles?.avatar_url} name={news[0].profiles?.display_name} size="xs" />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {news[0].profiles?.display_name ?? 'Staff'} · {news[0].published_at ? formatRelativeDate(news[0].published_at) : ''}
                          </span>
                        </div>
                      </div>
                      <div className="absolute left-0 top-0 h-5 w-5 border-l border-t opacity-40 transition-opacity group-hover:opacity-100"
                        style={{ borderColor: 'var(--accent)' }} />
                      <div className="absolute bottom-0 right-0 h-5 w-5 border-b border-r opacity-40 transition-opacity group-hover:opacity-100"
                        style={{ borderColor: 'var(--accent)' }} />
                    </div>
                  </TiltCard>
                </Link>
              )}

              {news.slice(1).map((post, i) => (
                <Link key={post.id} href={`/news/${post.slug}`} className="news-card group block">
                  <TiltCard className="h-full" intensity={9}>
                    <div className="relative flex h-full flex-col overflow-hidden rounded-xl"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', minHeight: 176 }}>
                      {/* Hover ring */}
                      <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ boxShadow: 'inset 0 0 0 1px rgba(192,251,80,0.25)' }} />
                      {post.cover_url ? (
                        <>
                          <div className="relative h-24 w-full shrink-0 overflow-hidden">
                            <Image src={post.cover_url} alt={post.title} fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0"
                              style={{ background: 'linear-gradient(to bottom, transparent 25%, var(--bg-card))' }} />
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <Badge variant={post.category as any} className="mb-2 self-start">{post.category}</Badge>
                            <h3 className="line-clamp-2 text-sm font-black uppercase leading-snug"
                              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                              {post.title}
                            </h3>
                            <span className="mt-auto pt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {post.published_at ? formatRelativeDate(post.published_at) : ''}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-1 flex-col p-4">
                          <Badge variant={post.category as any} className="mb-2 self-start">{post.category}</Badge>
                          <h3 className="line-clamp-3 text-sm font-black uppercase leading-snug"
                            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="mt-2 line-clamp-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                              {post.excerpt}
                            </p>
                          )}
                          <span className="mt-auto pt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {post.published_at ? formatRelativeDate(post.published_at) : ''}
                          </span>
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

      {/* ══════════════════════════════════════════════
          MARQUEE 2 — lavender tint, reversed
      ══════════════════════════════════════════════ */}
      <div style={{
        borderTop: '1px solid rgba(150,138,223,0.1)',
        borderBottom: '1px solid rgba(150,138,223,0.1)',
        background: 'rgba(150,138,223,0.02)',
        padding: '14px 0',
      }}>
        <Marquee
          items={WORDS_2}
          direction="right"
          speed={35}
          separator="◆"
          className="text-xs uppercase"
          style={{ color: 'rgba(150,138,223,0.28)', letterSpacing: '0.15em' }}
        />
      </div>

      {/* ══════════════════════════════════════════════
          TOURNAMENTS
      ══════════════════════════════════════════════ */}
      <section ref={tournRef} className="relative overflow-hidden py-24"
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        {/* Lavender glow top-right */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 50% 60% at 100% 0%, rgba(150,138,223,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 40% 50% at 0% 80%, rgba(150,138,223,0.05) 0%, transparent 55%)
          `,
        }} />
        <div className="bg-line-grid pointer-events-none absolute inset-0" style={{ opacity: 0.18 }} />

        <div className="relative mx-auto max-w-6xl px-8 sm:px-12 lg:px-16">
          <div className="mb-12 flex items-end justify-between">
            <div className="flex items-start gap-5">
              <span className="sec-num hidden pt-1 text-5xl font-black sm:block"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-purple)', opacity: 0.12, lineHeight: 1, letterSpacing: '-0.04em' }}>
                02
              </span>
              <div>
                <p style={{ marginBottom: '0.3rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--accent-purple)' }}>
                  Compete
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--text)', textTransform: 'uppercase' }}>
                  Tournaments
                </h2>
              </div>
            </div>
            <Link href="/tournaments"
              className="hidden shrink-0 text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-white sm:block"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.18em' }}>
              All →
            </Link>
          </div>

          {tournaments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No upcoming tournaments.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {tournaments.map(t => (
                <Link key={t.id} href={`/tournaments/${t.id}`} className="tourn-card group block">
                  <TiltCard className="rounded-xl" intensity={7}>
                    <div className="relative flex items-center gap-4 overflow-hidden rounded-xl px-5 py-4 transition-all duration-300"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(150,138,223,0.18)' }}>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background: 'radial-gradient(ellipse at left, rgba(150,138,223,0.09), transparent 70%)',
                          boxShadow: 'inset 0 0 0 1px rgba(150,138,223,0.38)',
                        }} />
                      {/* Left accent bar on hover */}
                      <div className="absolute inset-y-0 left-0 w-0.5 origin-bottom scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
                        style={{ background: 'var(--accent-purple)' }} />

                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                        style={{ background: 'rgba(150,138,223,0.12)', border: '1px solid rgba(150,138,223,0.22)' }}>
                        {t.games?.logo_url
                          ? <Image src={t.games.logo_url} alt={t.games.name} width={44} height={44} className="object-cover" />
                          : <span className="text-lg">🏆</span>}
                      </div>

                      <div className="relative min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <Badge variant={t.status as any}>{t.status}</Badge>
                          {t.registration_open && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{
                              background: 'rgba(0,232,122,0.1)',
                              border: '1px solid rgba(0,232,122,0.35)',
                              fontFamily: 'var(--font-display)', fontSize: '0.55rem', fontWeight: 700,
                              letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-green)',
                            }}>
                              <span style={{
                                display: 'inline-block', width: 4, height: 4, borderRadius: '50%',
                                background: 'var(--accent-green)',
                                boxShadow: '0 0 4px rgba(0,232,122,0.75)',
                                animation: 'live-dot 1.5s ease-in-out infinite',
                                flexShrink: 0,
                              }} />
                              REG OPEN
                            </span>
                          )}
                        </div>
                        <p className="truncate font-black uppercase"
                          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', letterSpacing: '-0.01em' }}>
                          {t.name}
                        </p>
                        <p className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {t.start_date
                            ? new Date(t.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'TBD'}
                          {t.max_teams && ` · ${t.max_teams} teams max`}
                        </p>
                      </div>

                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="relative shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                        style={{ color: 'var(--accent-purple)' }}>
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

      {/* ══════════════════════════════════════════════
          ABOUT US
      ══════════════════════════════════════════════ */}
      <section ref={aboutRef} className="relative overflow-hidden py-24"
        style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="bg-dot-grid pointer-events-none absolute inset-0" style={{ opacity: 0.2 }} />
        {/* Cyan glow right */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 55% 60% at 100% 40%, rgba(34,211,238,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 40% 50% at 0% 70%, rgba(192,251,80,0.04) 0%, transparent 55%)
          `,
        }} />

        <div className="relative mx-auto max-w-6xl px-8 sm:px-12 lg:px-16">

          {/* Section header */}
          <div className="mb-16 flex items-start gap-5">
            <span className="sec-num hidden pt-1 text-5xl font-black sm:block"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', opacity: 0.1, lineHeight: 1, letterSpacing: '-0.04em' }}>
              03
            </span>
            <div>
              <p style={{ marginBottom: '0.3rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
                Our Story
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--text)', textTransform: 'uppercase' }}>
                About Us
              </h2>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">

            {/* Left: text block */}
            <div className="about-el flex flex-col justify-center">
              {/* Mission statement */}
              <div className="relative mb-8 pl-5"
                style={{ borderLeft: '2px solid rgba(34,211,238,0.45)' }}>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  lineHeight: 1.15,
                  color: 'var(--text)',
                }}>
                  BRAC University&apos;s<br />
                  <span className="text-grad-cyan">Premier Esports</span><br />
                  Organisation.
                </p>
              </div>

              <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>
                BRACU Esports Club is BRAC University&apos;s official competitive gaming organisation — a home for students who want to play at the highest level. From casual newcomers to aspiring pros, we welcome everyone with the drive to compete, improve, and represent their university on the national stage.
              </p>
              <p className="mb-8 text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>
                We field squads across multiple titles, host inter-university tournaments, and provide a structured environment where talent is developed and rivalries are forged. If you are grinding ranked or chasing glory on the main stage — this is where you belong.
              </p>

              {/* Identity tags */}
              <div className="about-el flex flex-wrap gap-2">
                {['BRAC University', 'Dhaka, BD', 'Multi-Title', 'Season 2026'].map(tag => (
                  <span key={tag} style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.6rem', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    padding: '0.35rem 0.8rem',
                    border: '1px solid rgba(34,211,238,0.22)',
                    color: 'rgba(34,211,238,0.65)',
                    borderRadius: 4,
                    background: 'rgba(34,211,238,0.05)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: pillar cards */}
            <div className="flex flex-col gap-4">
              {[
                {
                  accent: 'var(--accent)',
                  accentRaw: '192,251,80',
                  label: 'Compete',
                  desc: 'Train hard. Play harder. We field teams across FPS, MOBA, battle royale, and sports titles — representing BRACU in every arena.',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ),
                },
                {
                  accent: 'var(--accent-purple)',
                  accentRaw: '150,138,223',
                  label: 'Community',
                  desc: 'Weekly scrims, watch parties, bootcamps. We grow together, fail together, and win together. The squad extends beyond the server.',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  ),
                },
                {
                  accent: 'var(--accent-cyan)',
                  accentRaw: '34,211,238',
                  label: 'Represent',
                  desc: 'Carry the BRACU banner. We are the face of BRAC University on every esports stage — locally, regionally, and beyond.',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                    </svg>
                  ),
                },
              ].map(({ accent, accentRaw, label, desc, icon }) => (
                <div key={label} className="about-card group relative overflow-hidden rounded-xl px-6 py-5 transition-all duration-300"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: `radial-gradient(ellipse at left, rgba(${accentRaw},0.07), transparent 70%)`, boxShadow: `inset 0 0 0 1px rgba(${accentRaw},0.28)` }} />
                  {/* Left accent bar */}
                  <div className="absolute inset-y-0 left-0 w-0.5 origin-bottom scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
                    style={{ background: accent }} />
                  <div className="relative flex items-start gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `rgba(${accentRaw},0.1)`, border: `1px solid rgba(${accentRaw},0.22)`, color: accent }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text)', marginBottom: '0.3rem' }}>
                        {label}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-sub)' }}>{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════ */}
      <section ref={ctaRef} className="relative overflow-hidden px-8 py-32 sm:px-12 lg:px-16"
        style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="bg-line-grid pointer-events-none absolute inset-0" style={{ opacity: 0.28 }} />
        {/* Fire orange center glow */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
          style={{ height: 500, background: 'radial-gradient(ellipse 50% 100% at 50% 50%, rgba(255,72,32,0.06) 0%, transparent 65%)' }} />
        {/* Lime bottom glow */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ height: 200, background: 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(192,251,80,0.05) 0%, transparent 60%)' }} />

        <div className="cta-inner relative mx-auto max-w-3xl text-center">

          <div className="cta-el mb-3 flex items-center justify-center gap-3">
            <span className="sec-num text-5xl font-black"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-fire)', opacity: 0.12, lineHeight: 1, letterSpacing: '-0.04em' }}>
              04
            </span>
          </div>

          <p className="cta-el" style={{ marginBottom: '1.75rem', fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--accent)' }}>
            Join the Club
          </p>

          {/* Bracketed glitch headline */}
          <div className="cta-el relative mx-auto mb-10 inline-block px-10 py-4">
            <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2" style={{ borderColor: 'rgba(192,251,80,0.55)', animation: 'border-pulse 2s ease-in-out infinite' }} />
            <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2" style={{ borderColor: 'rgba(192,251,80,0.55)', animation: 'border-pulse 2s ease-in-out infinite 0.5s' }} />
            <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2" style={{ borderColor: 'rgba(192,251,80,0.55)', animation: 'border-pulse 2s ease-in-out infinite 1s' }} />
            <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2" style={{ borderColor: 'rgba(192,251,80,0.55)', animation: 'border-pulse 2s ease-in-out infinite 1.5s' }} />
            <h2
              className="glitch font-black uppercase"
              data-text="Ready?"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.8rem, 10vw, 7rem)', letterSpacing: '-0.03em', lineHeight: 0.95 }}
            >
              Ready?
            </h2>
          </div>

          <p className="cta-el mx-auto mb-10 max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>
            Apply for membership and join a community of dedicated players pushing each other to the next level. Season 2026 is open.
          </p>

          <div className="cta-el">
            <Link
              href="/apply"
              className="magnetic-btn group inline-flex h-14 items-center gap-3 rounded-xl px-10 text-sm font-black uppercase tracking-wider"
              style={{
                background: 'var(--accent)', color: '#000',
                fontFamily: 'var(--font-display)', letterSpacing: '0.1em',
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 48px rgba(192,251,80,0.55)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
            >
              Apply Now
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

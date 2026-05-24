'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useMotionValue, animate } from 'framer-motion'
import type { PanInfo } from 'framer-motion'

type HomeGame = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
}

interface GamesCarouselProps {
  games: HomeGame[]
}

const ACCENT = '#c0fb50'
const GAP = 20

export function GamesCarousel({ games }: GamesCarouselProps) {
  const [active, setActive] = useState(0)
  const [cardW, setCardW] = useState(440)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragX = useMotionValue(0)

  const unit = cardW + GAP

  // Measure container, set responsive card width
  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.offsetWidth ?? 0
      if (w > 0) setCardW(Math.min(460, Math.max(260, w * 0.6)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Spring snap to panel
  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(games.length - 1, idx))
      animate(dragX, -(clamped * unit), {
        type: 'spring',
        stiffness: 340,
        damping: 38,
        mass: 0.85,
      })
      setActive(clamped)
    },
    [dragX, games.length, unit]
  )

  // Re-snap to active panel when cardW changes (resize)
  useEffect(() => {
    animate(dragX, -(active * unit), { duration: 0 })
  }, [unit]) // eslint-disable-line react-hooks/exhaustive-deps

  const onDragEnd = (_: PointerEvent, info: PanInfo) => {
    const threshold = cardW * 0.28
    if (info.velocity.x < -400 || info.offset.x < -threshold) goTo(active + 1)
    else if (info.velocity.x > 400 || info.offset.x > threshold) goTo(active - 1)
    else goTo(active)
  }

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(active + 1)
      if (e.key === 'ArrowLeft') goTo(active - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, goTo])

  if (games.length === 0) return null

  return (
    <div style={{ position: 'relative' }}>
      {/* Overflow hidden clip */}
      <div ref={containerRef} style={{ overflow: 'hidden' }}>
        <motion.div
          style={{
            x: dragX,
            display: 'flex',
            gap: GAP,
            paddingLeft: 48,
            paddingRight: 48,
            paddingBottom: 4,
            cursor: 'grab',
            userSelect: 'none',
            width: 'max-content',
          }}
          drag="x"
          dragConstraints={{ left: -(games.length - 1) * unit, right: 0 }}
          dragElastic={0.08}
          onDragEnd={onDragEnd}
          whileDrag={{ cursor: 'grabbing' }}
        >
          {games.map((game, i) => {
            const isActive = i === active
            return (
              <motion.div
                key={game.id}
                animate={{
                  scale: isActive ? 1 : 0.91,
                  opacity: isActive ? 1 : 0.48,
                  filter: isActive ? 'brightness(1)' : 'brightness(0.6)',
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                style={{
                  flex: `0 0 ${cardW}px`,
                  height: 460,
                  borderRadius: 20,
                  overflow: 'hidden',
                  position: 'relative',
                  border: isActive
                    ? `1px solid rgba(192,251,80,0.35)`
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: isActive
                    ? '0 0 60px rgba(192,251,80,0.14), 0 28px 80px rgba(0,0,0,0.7)'
                    : '0 8px 32px rgba(0,0,0,0.45)',
                  transformOrigin: 'bottom center',
                }}
              >
                {/* Cover image */}
                {game.cover_url ? (
                  <Image
                    src={game.cover_url}
                    alt={game.name}
                    fill
                    className="object-cover"
                    style={{ opacity: isActive ? 0.52 : 0.32, transition: 'opacity 0.4s' }}
                    draggable={false}
                  />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, #111124 0%, #1a1a38 100%)',
                  }} />
                )}

                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(6,6,14,0.98) 0%, rgba(6,6,14,0.6) 45%, rgba(6,6,14,0.15) 100%)',
                }} />

                {/* Active top accent line */}
                <motion.div
                  animate={{ opacity: isActive ? 1 : 0, scaleX: isActive ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                    transformOrigin: 'center',
                  }}
                />

                {/* Watermark number */}
                <div style={{
                  position: 'absolute', bottom: '-4%', right: '3%',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(5rem, 14vw, 9rem)',
                  fontWeight: 900,
                  lineHeight: 0.85,
                  color: 'rgba(255,255,255,0.038)',
                  userSelect: 'none',
                  letterSpacing: '-0.06em',
                  pointerEvents: 'none',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Card content */}
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  padding: '28px 30px',
                  pointerEvents: 'none',
                }}>
                  {game.logo_url && (
                    <div style={{ marginBottom: 14 }}>
                      <Image
                        src={game.logo_url}
                        alt={game.name}
                        width={44}
                        height={44}
                        style={{ borderRadius: 10, objectFit: 'cover' }}
                        draggable={false}
                      />
                    </div>
                  )}

                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.025em',
                    textTransform: 'uppercase',
                    lineHeight: 0.92,
                    color: '#fff',
                    marginBottom: 14,
                  }}>
                    {game.name}
                  </div>

                  {/* Category chips */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                    {['Ranked', 'Tournaments', 'Open'].map(tag => (
                      <span key={tag} style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.07)',
                        color: 'rgba(255,255,255,0.45)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ pointerEvents: isActive ? 'auto' : 'none' }}>
                    <Link
                      href={`/games/${game.slug}`}
                      onClick={e => !isActive && e.preventDefault()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 18px',
                        borderRadius: 8,
                        border: `1px solid ${isActive ? 'rgba(192,251,80,0.5)' : 'rgba(255,255,255,0.12)'}`,
                        color: isActive ? ACCENT : 'rgba(255,255,255,0.35)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        background: isActive ? 'rgba(192,251,80,0.08)' : 'transparent',
                        width: 'fit-content',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Explore Game
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 48, paddingRight: 48, marginTop: 20 }}>

        {/* Prev / Next arrows */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ dir: -1, icon: 'M19 12H5M12 19l-7-7 7-7' }, { dir: 1, icon: 'M5 12h14M12 5l7 7-7 7' }].map(({ dir, icon }) => {
            const disabled = dir === -1 ? active === 0 : active === games.length - 1
            return (
              <button
                key={dir}
                onClick={() => goTo(active + dir)}
                disabled={disabled}
                aria-label={dir === -1 ? 'Previous game' : 'Next game'}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  border: `1px solid ${disabled ? 'rgba(255,255,255,0.07)' : 'rgba(192,251,80,0.3)'}`,
                  background: disabled ? 'transparent' : 'rgba(192,251,80,0.06)',
                  color: disabled ? 'rgba(255,255,255,0.2)' : ACCENT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={icon}/>
                </svg>
              </button>
            )
          })}
        </div>

        {/* Dot indicators — wired to active state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {games.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to game ${i + 1}`}
              style={{
                width: i === active ? 26 : 6,
                height: 6,
                borderRadius: 3,
                background: i === active ? ACCENT : 'rgba(255,255,255,0.18)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: i === active ? `0 0 10px rgba(192,251,80,0.5)` : 'none',
              }}
            />
          ))}
        </div>

        {/* Counter */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.25)',
        }}>
          <span style={{ color: ACCENT }}>{String(active + 1).padStart(2, '0')}</span>
          {' / '}
          {String(games.length).padStart(2, '0')}
        </div>
      </div>
    </div>
  )
}

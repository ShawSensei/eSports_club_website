'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function Preloader() {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const counterRef  = useRef<HTMLSpanElement>(null)
  const lineRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const counter = counterRef.current
    const line    = lineRef.current
    if (!overlay) return

    if (!counter || !line) return

    const tl = gsap.timeline({
      onComplete: () => {
        overlay.style.display = 'none'
      },
    })

    tl
      .to(counter, {
        innerHTML: 100,
        duration: 2.4,
        ease: 'power1.inOut',
        snap: { innerHTML: 1 },
      })
      .from(line, { scaleX: 0, duration: 2.4, ease: 'power1.inOut' }, 0)
      .to({}, { duration: 0.3 })
      .to(overlay, {
        yPercent: -100,
        duration: 0.85,
        ease: 'power4.inOut',
      })
  }, [])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
      }}
    >
      {/* Club name */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 'clamp(1rem, 4vw, 1.5rem)',
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.25)',
      }}>
        ESPORTS CLUB
      </div>

      {/* Counter */}
      <span
        ref={counterRef}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(4rem, 15vw, 10rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(105deg, #c0fb50 18%, #efffbe 50%, #c0fb50 82%)',
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 14px rgba(192,251,80,0.38))',
        }}
      >
        0
      </span>

      {/* Progress line */}
      <div style={{
        width: 'clamp(160px, 30vw, 280px)',
        height: '1px',
        background: 'rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div
          ref={lineRef}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--accent-primary)',
            transformOrigin: 'left center',
            boxShadow: '0 0 8px var(--accent-primary)',
          }}
        />
      </div>
    </div>
  )
}

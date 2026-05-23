'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export function Preloader() {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const counterRef  = useRef<HTMLSpanElement>(null)
  const lineRef     = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Show only once per browser session
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('preloader_done')) return
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const overlay  = overlayRef.current
    const counter  = counterRef.current
    const line     = lineRef.current
    if (!overlay || !counter || !line) return

    const tl = gsap.timeline({
      onComplete: () => {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('preloader_done', '1')
        overlay.style.display = 'none'
      },
    })

    tl
      // Count 0 → 100
      .to(counter, {
        innerHTML: 100,
        duration: 1.6,
        ease: 'power2.inOut',
        snap: { innerHTML: 1 },
      })
      // Grow progress line to full
      .from(line, { scaleX: 0, duration: 1.6, ease: 'power2.inOut' }, 0)
      // Brief pause at 100
      .to({}, { duration: 0.15 })
      // Curtain slides up
      .to(overlay, {
        yPercent: -100,
        duration: 0.85,
        ease: 'power4.inOut',
      })
  }, [mounted])

  if (!mounted) return null

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
          color: '#fff',
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

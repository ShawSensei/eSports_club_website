'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function PageTransition() {
  const pathname  = usePathname()
  const barRef    = useRef<HTMLDivElement>(null)
  const glowRef   = useRef<HTMLDivElement>(null)
  const prevRef   = useRef(pathname)
  const activeRef = useRef(false)   // true while a navigation is in flight

  // ── Start bar on any internal-link click ──────────────────────────────────
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.getAttribute('href') ?? ''
      // Skip external / hash-only / mailto / tel
      if (!href || /^(https?:|\/\/|#|mailto:|tel:)/.test(href)) return
      // Skip same page
      const dest = href.replace(/[?#].*$/, '') || '/'
      const curr = pathname.replace(/[?#].*$/, '') || '/'
      if (dest === curr) return

      startBar()
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [pathname])

  // ── Complete bar + fade content in when route settles ─────────────────────
  useEffect(() => {
    const isNewRoute = pathname !== prevRef.current
    prevRef.current  = pathname

    if (isNewRoute && activeRef.current) {
      completeBar()
    }
    animatePageIn()
  }, [pathname])

  // ──────────────────────────────────────────────────────────────────────────

  function startBar() {
    const bar = barRef.current
    if (!bar) return
    activeRef.current = true
    gsap.killTweensOf(bar)
    gsap.set(bar, { scaleX: 0, opacity: 1 })
    bar.style.display = 'block'
    // Fake-progress: ease toward 78% over a generous window
    gsap.to(bar, { scaleX: 0.78, duration: 14, ease: 'power1.out' })
  }

  function completeBar() {
    const bar = barRef.current
    if (!bar) return
    activeRef.current = false
    gsap.killTweensOf(bar)
    // Rush to 100%, then fade out
    gsap.to(bar, {
      scaleX: 1,
      duration: 0.22,
      ease: 'power3.out',
      onComplete() {
        gsap.to(bar, {
          opacity: 0,
          duration: 0.38,
          delay: 0.06,
          ease: 'power1.in',
          onComplete: () => {
            bar.style.display = 'none'
            gsap.set(bar, { scaleX: 0, opacity: 1 })
          },
        })
      },
    })
  }

  function animatePageIn() {
    // Find the page's main content element
    const main = document.querySelector<HTMLElement>('main')
    if (!main) return
    gsap.fromTo(
      main,
      { opacity: 0.55, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'transform,opacity' }
    )
  }

  return (
    // Fixed 2px bar + diffuse glow layer underneath
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 3,
        zIndex: 99998,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {/* Diffuse glow (wider, blurred) */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'blur(6px)',
          transformOrigin: 'left center',
        }}
      />

      {/* Crisp bar */}
      <div
        ref={barRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, #c0fb50 0%, #d8ff80 55%, rgba(192,251,80,0.6) 100%)',
          transformOrigin: 'left center',
          transform: 'scaleX(0)',
          display: 'none',
          boxShadow: '0 0 8px rgba(192,251,80,0.9), 0 0 20px rgba(192,251,80,0.45), 0 1px 16px rgba(192,251,80,0.3)',
        }}
      />
    </div>
  )
}

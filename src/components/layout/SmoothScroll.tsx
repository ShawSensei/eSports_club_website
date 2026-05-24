'use client'

import { useEffect } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger)

// Keeps GSAP ScrollTrigger in sync with Lenis virtual scroll
function ScrollSync() {
  const lenis = useLenis(() => {
    ScrollTrigger.update()
  })

  useEffect(() => {
    if (!lenis) return
    // Let GSAP ticker drive Lenis instead of its own RAF
    const fn = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(fn)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(fn)
  }, [lenis])

  return null
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{ lerp: 0.1, duration: 1.2, syncTouch: true, autoRaf: false }}
    >
      <ScrollSync />
      {children}
    </ReactLenis>
  )
}

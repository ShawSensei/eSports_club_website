'use client'

import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Only activate on non-touch (pointer: fine) devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    // Make cursor elements visible
    dot.style.opacity  = '1'
    ring.style.opacity = '1'

    let ringX = 0, ringY = 0
    let mouseX = 0, mouseY = 0
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.left = mouseX + 'px'
      dot.style.top  = mouseY + 'px'
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      ringX = lerp(ringX, mouseX, 0.1)
      ringY = lerp(ringY, mouseY, 0.1)
      ring.style.left = ringX + 'px'
      ring.style.top  = ringY + 'px'
      rafId = requestAnimationFrame(tick)
    }
    tick()

    // Hover state helpers
    const expand = () => {
      ring.style.width  = '52px'
      ring.style.height = '52px'
      ring.style.borderColor = 'var(--accent-primary)'
      ring.style.backgroundColor = 'rgba(0,212,255,0.06)'
      dot.style.opacity = '0'
    }
    const collapse = () => {
      ring.style.width  = '32px'
      ring.style.height = '32px'
      ring.style.borderColor = 'rgba(255,255,255,0.4)'
      ring.style.backgroundColor = 'transparent'
      dot.style.opacity = '1'
    }
    const textMode = () => {
      ring.style.width  = '3px'
      ring.style.height = '24px'
      ring.style.borderRadius = '2px'
      ring.style.borderColor  = 'var(--accent-primary)'
    }
    const textEnd = () => {
      ring.style.width  = '32px'
      ring.style.height = '32px'
      ring.style.borderRadius = '50%'
      ring.style.borderColor  = 'rgba(255,255,255,0.4)'
    }

    const attachTo = (el: Element) => {
      if (el.matches('input, textarea, [contenteditable]')) {
        el.addEventListener('mouseenter', textMode)
        el.addEventListener('mouseleave', textEnd)
      } else {
        el.addEventListener('mouseenter', expand)
        el.addEventListener('mouseleave', collapse)
      }
    }

    const attachAll = () => {
      document.querySelectorAll('a, button, [role="button"], label, input, textarea, [contenteditable]').forEach(attachTo)
    }
    attachAll()

    // Re-attach when DOM changes (SPA navigation)
    const observer = new MutationObserver(attachAll)
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('mousemove', onMove)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* Dot — snaps to cursor position instantly */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          background: '#fff',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
          opacity: 0,                         // shown by JS after mediaQuery check
          transition: 'opacity 0.15s',
        }}
      />

      {/* Ring — lags behind cursor */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999998,
          transform: 'translate(-50%, -50%)',
          opacity: 0,                         // shown by JS after mediaQuery check
          transition: 'width 0.25s, height 0.25s, border-color 0.25s, background-color 0.25s, border-radius 0.2s, opacity 0.15s',
        }}
      />
    </>
  )
}

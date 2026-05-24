'use client'

import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cursorRef.current
    if (!el) return

    // Touch / stylus devices — keep system cursor
    if (window.matchMedia('(pointer: coarse)').matches) return

    el.style.opacity = '1'

    // ── Crosshair child elements ──
    const dot    = el.querySelector<HTMLElement>('.xhair-dot')
    const top    = el.querySelector<HTMLElement>('.xhair-top')
    const bot    = el.querySelector<HTMLElement>('.xhair-bot')
    const left   = el.querySelector<HTMLElement>('.xhair-left')
    const right  = el.querySelector<HTMLElement>('.xhair-right')
    const arms   = [top, bot, left, right].filter(Boolean) as HTMLElement[]

    let curX = 0, curY = 0, mouseX = 0, mouseY = 0
    let rafId: number

    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
    window.addEventListener('mousemove', onMove)

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      curX = lerp(curX, mouseX, 0.35)
      curY = lerp(curY, mouseY, 0.35)
      el.style.left = curX + 'px'
      el.style.top  = curY + 'px'
      rafId = requestAnimationFrame(tick)
    }
    tick()

    // ── State helpers ──
    const setState = (gap: number, armLen: number, color: string, dotGlow: string) => {
      if (top)   { top.style.bottom = gap + 'px'; top.style.height = armLen + 'px' }
      if (bot)   { bot.style.top    = gap + 'px'; bot.style.height = armLen + 'px' }
      if (left)  { left.style.right = gap + 'px'; left.style.width = armLen + 'px' }
      if (right) { right.style.left = gap + 'px'; right.style.width = armLen + 'px' }
      arms.forEach(a => a.style.background = color)
      if (dot) { dot.style.background = color; dot.style.boxShadow = dotGlow }
    }

    const toDefault = () => setState(3, 7, 'rgba(255,255,255,0.9)', 'none')
    const toHover   = () => setState(6, 5, 'var(--accent-primary)', '0 0 6px var(--accent-primary)')
    const toText    = () => {
      // Collapse into a thin I-beam style
      if (top)   { top.style.bottom = '1px'; top.style.height = '10px' }
      if (bot)   { bot.style.top    = '1px'; bot.style.height = '10px' }
      if (left)  { left.style.right  = '999px'; left.style.width = '0px' }
      if (right) { right.style.left  = '999px'; right.style.width = '0px' }
      arms.forEach(a => a.style.background = 'var(--accent-primary)')
      if (dot) { dot.style.background = 'var(--accent-primary)'; dot.style.boxShadow = '0 0 4px var(--accent-primary)' }
    }

    toDefault()

    const attach = () => {
      document.querySelectorAll('a, button, [role="button"], label').forEach(node => {
        node.addEventListener('mouseenter', toHover)
        node.addEventListener('mouseleave', toDefault)
      })
      document.querySelectorAll('input, textarea, [contenteditable]').forEach(node => {
        node.addEventListener('mouseenter', toText)
        node.addEventListener('mouseleave', toDefault)
      })
    }
    attach()

    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  // Shared arm transition
  const armTransition = 'background 0.15s, width 0.18s cubic-bezier(0.22,1,0.36,1), height 0.18s cubic-bezier(0.22,1,0.36,1), top 0.18s cubic-bezier(0.22,1,0.36,1), bottom 0.18s cubic-bezier(0.22,1,0.36,1), left 0.18s cubic-bezier(0.22,1,0.36,1), right 0.18s cubic-bezier(0.22,1,0.36,1)'

  // Arm base styles
  const armBase: React.CSSProperties = {
    position: 'absolute',
    background: 'rgba(255,255,255,0.9)',
    transition: armTransition,
    borderRadius: 1,
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 0, height: 0,
        pointerEvents: 'none',
        zIndex: 999999,
        opacity: 0,
        transform: 'translate(-50%, -50%) rotate(15deg)',
        transition: 'opacity 0.2s',
      }}
    >
      {/* Center dot */}
      <div
        className="xhair-dot"
        style={{
          position: 'absolute',
          width: 2, height: 2,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          top: -1, left: -1,
          transition: 'background 0.15s, box-shadow 0.15s',
        }}
      />

      {/* Top arm */}
      <div className="xhair-top" style={{ ...armBase, width: 1.5, height: 7, left: -0.75, bottom: 3 }} />

      {/* Bottom arm */}
      <div className="xhair-bot" style={{ ...armBase, width: 1.5, height: 7, left: -0.75, top: 3 }} />

      {/* Left arm */}
      <div className="xhair-left" style={{ ...armBase, height: 1.5, width: 7, top: -0.75, right: 3 }} />

      {/* Right arm */}
      <div className="xhair-right" style={{ ...armBase, height: 1.5, width: 7, top: -0.75, left: 3 }} />
    </div>
  )
}

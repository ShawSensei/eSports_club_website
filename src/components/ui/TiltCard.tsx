'use client'

import { useRef, type ReactNode } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  intensity?: number
}

export function TiltCard({ children, className = '', intensity = 12 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    card.style.transition = 'none'
    card.style.transform = `perspective(700px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateZ(6px)`
    if (shineRef.current) {
      shineRef.current.style.background = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(255,255,255,0.10) 0%, transparent 65%)`
    }
  }

  function onLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)'
    card.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
    if (shineRef.current) shineRef.current.style.background = 'transparent'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-target relative ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      {/* Shine layer */}
      <div
        ref={shineRef}
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 2,
          transition: 'background 0.08s',
        }}
      />
    </div>
  )
}

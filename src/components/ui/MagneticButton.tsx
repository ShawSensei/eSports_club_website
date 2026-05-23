'use client'

import { useRef, type ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  style?: React.CSSProperties
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export function MagneticButton({
  children, className = '', strength = 30, style, onClick, type = 'button', disabled,
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * strength
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * strength
    btn.style.transition = 'transform 0.3s cubic-bezier(0.22,1,0.36,1)'
    btn.style.transform  = `translate(${x}px, ${y}px)`
  }

  function onLeave() {
    const btn = btnRef.current
    if (!btn) return
    btn.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)'
    btn.style.transform  = 'translate(0,0)'
  }

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      className={className}
      style={style}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </button>
  )
}

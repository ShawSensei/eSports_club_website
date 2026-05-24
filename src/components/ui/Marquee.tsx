'use client'

import type { CSSProperties } from 'react'

interface MarqueeProps {
  items: string[]
  direction?: 'left' | 'right'
  speed?: number
  separator?: string
  className?: string
  style?: CSSProperties
}

export function Marquee({
  items,
  direction = 'left',
  speed = 25,
  separator = '·',
  className = '',
  style,
}: MarqueeProps) {
  // Duplicate so the -50% translateX loop is seamless
  const doubled = [...items, ...items]

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        ...style,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2.5rem',
          animation: `marquee-${direction} ${speed}s linear infinite`,
          willChange: 'transform',
          whiteSpace: 'nowrap',
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 900 }}
          >
            <span>{item}</span>
            <span style={{ color: 'var(--accent)', opacity: 0.45, fontSize: '0.55em', lineHeight: 1 }}>
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

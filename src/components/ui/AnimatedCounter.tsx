'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'
import { ease } from '@/lib/motion'

interface AnimatedCounterProps {
  value: number
  className?: string
  suffix?: string
}

export function AnimatedCounter({ value, className, suffix = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, value, {
      duration: 1.2,
      ease,
      onUpdate: v => setDisplayed(Math.round(v)),
    })
    return () => controls.stop()
  }, [isInView, value])

  return (
    <span ref={ref} className={className}>
      {displayed.toLocaleString()}{suffix}
    </span>
  )
}

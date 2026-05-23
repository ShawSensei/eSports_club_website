'use client'

import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  stagger?: boolean
  delay?: number
}

export function AnimatedSection({ children, className, stagger = false, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={stagger ? staggerContainer : fadeUp}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  )
}

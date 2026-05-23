'use client'

import { motion } from 'framer-motion'
import { ease } from '@/lib/motion'
import type { ReactNode } from 'react'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const item = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
}

interface AnimatedGridProps {
  children: ReactNode
  className?: string
}

export function AnimatedGrid({ children, className }: AnimatedGridProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedGridItem({ children, className }: AnimatedGridProps) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}

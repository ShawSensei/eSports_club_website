import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'hover' | 'highlighted'

const variantStyles: Record<CardVariant, string> = {
  default:     'border-[var(--border)]',
  hover:       'border-[var(--border)] transition-all duration-200 hover:border-[var(--accent-primary)] hover:shadow-[var(--glow-cyan)] cursor-pointer',
  highlighted: 'border-[var(--accent-primary)] shadow-[var(--glow-cyan)]',
}

interface CardProps {
  variant?: CardVariant
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Card({ variant = 'default', children, className, style }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6',
        'bg-[var(--bg-card)]',
        variantStyles[variant],
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

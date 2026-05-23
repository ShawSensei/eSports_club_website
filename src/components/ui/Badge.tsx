import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'news' | 'patch' | 'strategy' | 'event' | 'announcement'
  | 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled'
  | 'admin' | 'moderator' | 'member'
  | 'default'

const variantStyles: Record<BadgeVariant, string> = {
  news:         'bg-blue-500/20 text-blue-400 border-blue-500/30',
  patch:        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  strategy:     'bg-purple-500/20 text-purple-400 border-purple-500/30',
  event:        'bg-pink-500/20 text-pink-400 border-pink-500/30',
  announcement: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  upcoming:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
  registration: 'bg-green-500/20 text-green-400 border-green-500/30',
  ongoing:      'bg-orange-500/20 text-orange-400 border-orange-500/30',
  completed:    'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled:    'bg-red-500/20 text-red-400 border-red-500/30',
  admin:        'bg-purple-500/20 text-purple-400 border-purple-500/30',
  moderator:    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  member:       'bg-gray-500/20 text-gray-400 border-gray-500/30',
  default:      'bg-white/10 text-white/70 border-white/20',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

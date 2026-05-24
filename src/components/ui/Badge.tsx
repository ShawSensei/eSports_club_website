import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'news' | 'patch' | 'strategy' | 'event' | 'announcement'
  | 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled'
  | 'admin' | 'moderator' | 'member'
  | 'default'

const variantStyle: Record<BadgeVariant, CSSProperties> = {
  // ── News categories ────────────────────────────────────────────────────
  news:         { background: 'rgba(34,211,238,0.12)',   color: 'var(--accent-cyan)',    border: '1px solid rgba(34,211,238,0.38)'    },
  patch:        { background: 'rgba(255,214,10,0.12)',   color: 'var(--accent-yellow)',  border: '1px solid rgba(255,214,10,0.38)'    },
  strategy:     { background: 'rgba(150,138,223,0.12)',  color: 'var(--accent-purple)',  border: '1px solid rgba(150,138,223,0.38)'   },
  event:        { background: 'rgba(255,72,32,0.12)',    color: 'var(--accent-fire)',    border: '1px solid rgba(255,72,32,0.38)'     },
  announcement: { background: 'rgba(192,251,80,0.12)',   color: 'var(--accent)',         border: '1px solid rgba(192,251,80,0.42)'    },
  // ── Tournament statuses ────────────────────────────────────────────────
  upcoming:     { background: 'rgba(150,138,223,0.12)',  color: 'var(--accent-purple)',  border: '1px solid rgba(150,138,223,0.38)'   },
  registration: { background: 'rgba(0,232,122,0.12)',    color: 'var(--accent-green)',   border: '1px solid rgba(0,232,122,0.38)'     },
  ongoing:      { background: 'rgba(255,72,32,0.12)',    color: 'var(--accent-fire)',    border: '1px solid rgba(255,72,32,0.42)'     },
  completed:    { background: 'rgba(240,240,255,0.06)',  color: 'rgba(240,240,255,0.42)', border: '1px solid rgba(240,240,255,0.14)' },
  cancelled:    { background: 'rgba(255,45,85,0.12)',    color: 'var(--accent-red)',     border: '1px solid rgba(255,45,85,0.38)'     },
  // ── User roles ─────────────────────────────────────────────────────────
  admin:        { background: 'rgba(192,251,80,0.12)',   color: 'var(--accent)',         border: '1px solid rgba(192,251,80,0.42)'    },
  moderator:    { background: 'rgba(150,138,223,0.12)',  color: 'var(--accent-purple)',  border: '1px solid rgba(150,138,223,0.38)'   },
  member:       { background: 'rgba(240,240,255,0.06)',  color: 'rgba(240,240,255,0.42)', border: '1px solid rgba(240,240,255,0.14)' },
  // ── Fallback ───────────────────────────────────────────────────────────
  default:      { background: 'rgba(255,255,255,0.07)',  color: 'rgba(240,240,255,0.55)', border: '1px solid rgba(255,255,255,0.16)' },
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
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        className
      )}
      style={variantStyle[variant]}
    >
      {children}
    </span>
  )
}

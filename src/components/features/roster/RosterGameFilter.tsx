'use client'

import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type Game = { id: string; name: string; slug: string; logo_url: string | null }

export function RosterGameFilter({ games, active }: { games: Game[]; active: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const tabs = [{ id: 'all', name: 'All Games', slug: 'all', logo_url: null }, ...games]

  return (
    <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      {tabs.map(game => (
        <button
          key={game.slug}
          onClick={() => router.push(game.slug === 'all' ? pathname : `${pathname}?game=${game.slug}`, { scroll: false })}
          className={cn(
            'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all',
            active === game.slug ? 'shadow-sm' : 'hover:text-white'
          )}
          style={active === game.slug
            ? { background: 'var(--bg-card)', color: 'var(--accent-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
            : { color: 'var(--text-muted)' }
          }
        >
          {game.name}
        </button>
      ))}
    </div>
  )
}

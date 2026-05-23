'use client'

import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type Tab = { value: string; label: string }

export function TournamentStatusTabs({ tabs, active }: { tabs: Tab[]; active: string }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => router.push(value === 'all' ? pathname : `${pathname}?status=${value}`, { scroll: false })}
          className={cn(
            'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all',
            active === value ? 'shadow-sm' : 'hover:text-white'
          )}
          style={active === value
            ? { background: 'var(--bg-card)', color: 'var(--accent-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
            : { color: 'var(--text-muted)' }
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}

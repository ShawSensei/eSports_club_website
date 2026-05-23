'use client'

import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { value: 'overview',    label: 'Overview' },
  { value: 'bracket',     label: 'Bracket' },
  { value: 'teams',       label: 'Teams' },
  { value: 'results',     label: 'Results' },
]

export function TournamentTabs({
  activeTab,
  tournamentId,
  children,
}: {
  activeTab: string
  tournamentId: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl p-1" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => router.push(`${pathname}?tab=${value}`, { scroll: false })}
            className={cn(
              'flex-shrink-0 rounded-lg px-5 py-2 text-sm font-semibold transition-all whitespace-nowrap',
              activeTab === value ? 'shadow-sm' : 'hover:text-white'
            )}
            style={activeTab === value
              ? { background: 'var(--bg-card)', color: 'var(--accent-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
              : { color: 'var(--text-muted)' }
            }
          >
            {label}
          </button>
        ))}
      </div>
      {children}
    </div>
  )
}

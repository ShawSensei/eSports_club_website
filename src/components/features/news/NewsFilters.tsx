'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { NEWS_CATEGORIES } from '@/constants'

type Game = { id: string; name: string; slug: string }

export function NewsFilters({ games }: { games: Game[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const category = searchParams.get('category') ?? ''
  const game = searchParams.get('game') ?? ''
  const search = searchParams.get('q') ?? ''

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search news…"
          defaultValue={search}
          onChange={e => update('q', e.target.value)}
          className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Category filter */}
      <select
        value={category}
        onChange={e => update('category', e.target.value)}
        className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: category ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        <option value="">All Categories</option>
        {NEWS_CATEGORIES.map(c => (
          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
        ))}
      </select>

      {/* Game filter */}
      {games.length > 0 && (
        <select
          value={game}
          onChange={e => update('game', e.target.value)}
          className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: game ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          <option value="">All Games</option>
          {games.map(g => (
            <option key={g.id} value={g.slug}>{g.name}</option>
          ))}
        </select>
      )}

      {/* Clear */}
      {(category || game || search) && (
        <button
          onClick={() => router.push(pathname)}
          className="rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-white/5"
          style={{ color: 'var(--accent-danger)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Pagination({ page, total, perPage }: { page: number; total: number; perPage: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / perPage)

  if (totalPages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    p => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  )

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5 disabled:opacity-30"
        style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1]
        return (
          <div key={p} className="flex items-center gap-2">
            {prev && p - prev > 1 && (
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>…</span>
            )}
            <button
              onClick={() => goTo(p)}
              className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors', p === page ? '' : 'hover:bg-white/5')}
              style={p === page
                ? { background: 'var(--accent-primary)', color: '#000' }
                : { border: '1px solid var(--border)', color: 'var(--text-primary)' }
              }
            >
              {p}
            </button>
          </div>
        )
      })}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5 disabled:opacity-30"
        style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  )
}

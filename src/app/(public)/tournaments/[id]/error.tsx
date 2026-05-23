'use client'

import Link from 'next/link'

export default function TournamentError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Failed to load tournament</p>
      <div className="flex gap-3">
        <button onClick={reset} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: 'var(--accent-primary)', color: '#000' }}>Try again</button>
        <Link href="/tournaments" className="rounded-lg border px-4 py-2 text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>Back to Tournaments</Link>
      </div>
    </div>
  )
}

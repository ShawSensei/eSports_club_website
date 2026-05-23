'use client'

export default function NewsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Failed to load news</p>
      <button
        onClick={reset}
        className="rounded-lg px-4 py-2 text-sm font-medium"
        style={{ background: 'var(--accent-primary)', color: '#000' }}
      >
        Try again
      </button>
    </div>
  )
}

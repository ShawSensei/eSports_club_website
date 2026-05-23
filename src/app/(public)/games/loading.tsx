import { Skeleton } from '@/components/ui/Skeleton'

export default function GamesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <Skeleton className="mb-2 h-10 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="flex items-center gap-4 p-5">
              <Skeleton className="h-12 w-12 flex-shrink-0 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

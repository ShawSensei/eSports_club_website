import { Skeleton } from '@/components/ui/Skeleton'

export default function RosterLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Skeleton className="mb-2 h-10 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="mb-10 h-12 w-96 rounded-xl" />
      <div className="space-y-12">
        {[1, 2].map(s => (
          <div key={s}>
            <div className="mb-6 flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  <Skeleton className="h-14 w-14 flex-shrink-0 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

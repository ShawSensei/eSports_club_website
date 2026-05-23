import { Skeleton } from '@/components/ui/Skeleton'

export default function MembersLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Skeleton className="mb-2 h-10 w-36" />
        <Skeleton className="h-4 w-48" />
      </div>
      {[3, 4].map(count => (
        <div key={count} className="mb-14">
          <div className="mb-6 flex items-center gap-3">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-5 w-8 rounded-full" />
            <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

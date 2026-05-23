import { Skeleton } from '@/components/ui/Skeleton'

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header card */}
      <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Skeleton className="h-24 w-24 flex-shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: game accounts */}
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-6 w-36" />
          {[1, 2].map(i => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>

        {/* Right: stats + history */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Skeleton className="mb-4 h-6 w-16" />
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <div className="mb-4 flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[1,2,3,4].map(j => <Skeleton key={j} className="h-14 rounded-lg" />)}
                  </div>
                  <Skeleton className="mt-4 h-4 w-full" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                <Skeleton className="h-4 w-full" />
              </div>
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4 border-b border-[var(--border)] px-4 py-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

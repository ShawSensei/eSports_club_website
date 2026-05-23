import { Skeleton } from '@/components/ui/Skeleton'

export default function ApplyLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <Skeleton className="mb-3 h-10 w-72" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-3/4" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <Skeleton className="mb-2 h-8 w-8 rounded-full" />
            <Skeleton className="mb-1 h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-1.5 h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-1.5 h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div>
          <Skeleton className="mb-1.5 h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-lg sm:max-w-sm" />
        </div>
        <div>
          <Skeleton className="mb-3 h-4 w-36" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
        </div>
        <div>
          <Skeleton className="mb-1.5 h-4 w-40" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="mb-1.5 h-4 w-36" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="pt-4 border-t border-[var(--border)]">
          <Skeleton className="h-12 w-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from '@/components/ui/Skeleton'

export default function PostLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-5 w-32" />
      <Skeleton className="mb-8 h-64 w-full rounded-2xl sm:h-96" />
      <Skeleton className="mb-2 h-5 w-24" />
      <Skeleton className="mb-4 h-12 w-3/4" />
      <Skeleton className="mb-2 h-5 w-full" />
      <Skeleton className="mb-8 h-5 w-2/3" />
      <div className="mb-8 flex items-center gap-3 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="mb-1 h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  )
}

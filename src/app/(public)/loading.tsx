import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="px-4 py-24 sm:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <Skeleton className="mx-auto mb-4 h-7 w-36 rounded-full" />
          <Skeleton className="mx-auto mb-3 h-16 w-3/4" />
          <Skeleton className="mx-auto mb-3 h-16 w-2/3" />
          <Skeleton className="mx-auto mb-10 h-6 w-1/2" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-36 rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="border-y py-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="text-center">
              <Skeleton className="mx-auto mb-2 h-10 w-20" />
              <Skeleton className="mx-auto h-3 w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* News skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </>
  )
}

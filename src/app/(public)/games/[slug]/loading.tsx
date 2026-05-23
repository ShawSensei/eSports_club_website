import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function GameDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-48 w-full rounded-2xl sm:h-64" />
      <div className="mb-10 flex items-center gap-5">
        <Skeleton className="h-18 w-18 flex-shrink-0 rounded-2xl" />
        <div>
          <Skeleton className="mb-2 h-10 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="mb-6 h-12 w-full rounded-xl" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

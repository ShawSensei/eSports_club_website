import { Skeleton } from '@/components/ui/Skeleton'

export default function TournamentDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-48 w-full rounded-2xl sm:h-72" />
      <div className="mb-10 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="mb-6 h-12 w-full rounded-xl" />
      <div className="space-y-4 max-w-3xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  )
}

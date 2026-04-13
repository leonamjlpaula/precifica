import { Skeleton } from '@/presentation/components/ui/skeleton'

export default function CustosFixosLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-48" />

      {/* Config fields grid */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Items list */}
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-9 w-28 shrink-0" />
          </div>
        ))}
        <div className="pt-2 flex justify-end">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="flex justify-end">
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  )
}

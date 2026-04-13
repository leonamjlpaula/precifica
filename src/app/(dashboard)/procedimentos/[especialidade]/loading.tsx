import { Skeleton } from '@/presentation/components/ui/skeleton'

export default function ProcedimentosLoading() {
  return (
    <div className="space-y-4">
      {/* Especialidade tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      {/* Header + button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Search */}
      <Skeleton className="h-9 w-full max-w-sm" />

      {/* List */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card px-4 py-3 flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-7 w-7 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

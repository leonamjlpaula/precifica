import { Skeleton } from '@/presentation/components/ui/skeleton'

export default function ProcedimentoDetailLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back link + title */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-64" />
      </div>

      {/* Main form card */}
      <div className="rounded-lg border bg-card p-6 space-y-5">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <div className="pt-1">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Materials card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-7 w-7 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

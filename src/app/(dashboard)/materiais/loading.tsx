import { Skeleton } from '@/presentation/components/ui/skeleton'

export default function MateriaisLoading() {
  return (
    <div className="space-y-4">
      {/* Header + button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Search */}
      <Skeleton className="h-9 w-full max-w-sm" />

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-4 px-4 py-3 border-b bg-muted/40">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20 ml-auto" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-7 w-7 shrink-0" />
            <Skeleton className="h-7 w-7 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

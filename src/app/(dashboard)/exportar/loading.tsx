import { Skeleton } from '@/presentation/components/ui/skeleton'

export default function ExportarLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Skeleton className="h-7 w-32" />

      {/* Export option cards */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
      ))}
    </div>
  )
}

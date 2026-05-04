import { Skeleton } from "@/components/ui/skeleton";

export function AgentDashboardHomeSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="px-1 space-y-2">
        <Skeleton className="h-8 w-[min(100%,20rem)] max-w-md rounded-md" />
        <Skeleton className="h-4 w-[min(100%,28rem)] max-w-xl rounded-md" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-subtle bg-white p-4 shadow-sm md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-3 w-32 rounded-full" />
              </div>
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="mt-4 h-[220px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="mt-4 h-[220px] w-full rounded-lg" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <Skeleton className="h-5 w-36 rounded-md" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboardHomeSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading admin dashboard">
      <div className="px-1 space-y-2">
        <Skeleton className="h-8 w-[min(100%,18rem)] max-w-md rounded-md" />
        <Skeleton className="h-4 w-[min(100%,26rem)] max-w-xl rounded-md" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-subtle bg-white p-4 shadow-sm md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-28 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-3 w-36 rounded-full" />
              </div>
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-subtle bg-white p-4 shadow-sm md:p-5"
          >
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="mt-4 h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <Skeleton className="h-5 w-36 rounded-md" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <Skeleton className="h-5 w-48 rounded-md" />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

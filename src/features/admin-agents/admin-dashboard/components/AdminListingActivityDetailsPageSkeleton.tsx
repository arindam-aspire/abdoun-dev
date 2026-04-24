import { Skeleton } from "@/components/ui/skeleton";

export function AdminListingActivityDetailsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading listing activity">
      <Skeleton className="h-4 w-40 rounded-md" />

      <div className="space-y-2 px-1">
        <Skeleton className="h-9 w-[min(100%,22rem)] max-w-lg rounded-md" />
        <Skeleton className="h-4 w-[min(100%,28rem)] max-w-2xl rounded-md" />
      </div>

      <div className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="mt-2 h-3 w-56 max-w-full rounded-md" />
        <div className="mt-6 h-[220px] w-full rounded-xl bg-surface">
          <Skeleton className="h-full w-full rounded-xl opacity-60" />
        </div>
      </div>

      <section className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3 w-[min(100%,20rem)] rounded-md" />
          </div>
          <Skeleton className="h-3 w-28 rounded-md" />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-subtle bg-surface px-3 py-3"
            >
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
}

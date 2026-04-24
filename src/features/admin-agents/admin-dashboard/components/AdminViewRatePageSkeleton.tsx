import { Skeleton } from "@/components/ui/skeleton";

export function AdminViewRatePageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading property views">
      <Skeleton className="h-4 w-40 rounded-md" />

      <div className="px-1 space-y-2">
        <Skeleton className="h-8 w-[min(100%,22rem)] max-w-lg rounded-md" />
        <Skeleton className="h-4 w-[min(100%,28rem)] max-w-2xl rounded-md" />
      </div>

      <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
      </div>

      <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <Skeleton className="h-5 w-48 rounded-md" />
        <ul className="mt-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-subtle bg-surface px-4 py-3"
            >
              <Skeleton className="h-4 flex-1 max-w-md rounded-full" />
              <Skeleton className="h-4 w-16 shrink-0 rounded-md" />
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-center gap-2 border-t border-subtle pt-4">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </article>
    </div>
  );
}

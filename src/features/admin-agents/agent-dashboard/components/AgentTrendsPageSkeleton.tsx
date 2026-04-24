import { Skeleton } from "@/components/ui/skeleton";

export function AgentTrendsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading trends">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>
      <div className="space-y-2 px-1">
        <Skeleton className="h-9 w-[min(100%,18rem)] max-w-md rounded-md" />
        <Skeleton className="h-4 w-[min(100%,26rem)] max-w-2xl rounded-md" />
      </div>

      <section className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <div className="space-y-1">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-3 w-36 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-36 w-full rounded-lg" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Skeleton className="h-[3.25rem] w-full rounded-lg" />
          <Skeleton className="h-[3.25rem] w-full rounded-lg" />
        </div>
      </section>
    </div>
  );
}

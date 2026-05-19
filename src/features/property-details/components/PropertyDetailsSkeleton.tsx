"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export interface PropertyDetailsSkeletonProps {
  isRtl?: boolean;
}

export function PropertyDetailsSkeleton({ isRtl = false }: PropertyDetailsSkeletonProps) {
  return (
    <div
      className={cn(
        "container mx-auto min-h-screen px-4 py-6 md:px-8 md:py-8",
        isRtl ? "text-right" : "text-left",
      )}
      aria-busy="true"
      aria-label="Loading property details"
    >
      <Skeleton className="mb-6 aspect-[16/9] w-full rounded-2xl md:mb-8 md:aspect-[21/9]" />
      <div className="mb-6 flex gap-2 md:mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-20 shrink-0 rounded-lg md:h-20 md:w-24" />
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2 border-b border-subtle pb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      <div
        className={cn(
          "grid gap-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8",
          isRtl && "md:[direction:rtl]",
        )}
      >
        <section className="space-y-6 md:space-y-7">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-8 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </section>

        <aside className={cn("space-y-4", isRtl ? "md:pl-0 md:pr-4" : "md:pl-4")}>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </aside>
      </div>

      <div className="mt-12 space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 min-w-[280px] flex-1 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

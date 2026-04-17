"use client";

import { Skeleton } from "@/components/ui/skeleton";

type PropertyResultsSkeletonView = "grid" | "list";

interface PropertyResultsSkeletonProps {
  view: PropertyResultsSkeletonView;
  count?: number;
}

function GridPropertySkeletonCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-[#e7ebf1] bg-white">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </article>
  );
}

function ListPropertySkeletonCard() {
  return (
    <article className="flex overflow-hidden rounded-xl border border-[#e7ebf1] bg-white">
      <Skeleton className="hidden md:block md:h-[232px] md:w-[320px] md:rounded-none" />
      <div className="flex min-w-0 flex-1 flex-col p-4 md:p-6">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="my-3 h-px w-full" />
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <Skeleton className="h-11 w-24 rounded-lg" />
            <Skeleton className="h-11 w-24 rounded-lg" />
            <Skeleton className="h-11 w-11 rounded-lg" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function PropertyResultsSkeleton({
  view,
  count = view === "grid" ? 8 : 4,
}: PropertyResultsSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index);

  if (view === "grid") {
    return (
      <ul
        className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4"
        aria-hidden="true"
      >
        {items.map((item) => (
          <li key={item} className="min-h-0">
            <GridPropertySkeletonCard />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className="grid grid-cols-1 items-stretch gap-4 md:gap-6"
      aria-hidden="true"
    >
      {items.map((item) => (
        <li key={item} className="min-h-0">
          <ListPropertySkeletonCard />
        </li>
      ))}
    </ul>
  );
}

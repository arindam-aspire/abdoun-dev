"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export interface ProfileFormSkeletonProps {
  compact?: boolean;
  isRtl?: boolean;
  className?: string;
  /** Screen reader / `aria-label` for the loading region */
  message: string;
}

/**
 * Placeholder layout aligned with `ProfileForm` while profile/session is loading.
 */
export function ProfileFormSkeleton({
  compact = true,
  isRtl = false,
  className,
  message,
}: ProfileFormSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={message}
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "flex flex-col rounded-none border-0 bg-transparent",
        compact ? "min-h-0 flex-1" : "",
        className,
      )}
    >
      <span className="sr-only">{message}</span>
      <div
        className={cn(
          compact && "min-h-0 flex-1 overflow-y-auto",
          "px-4 py-5 md:px-6",
        )}
      >
        <div className="mb-6 flex flex-col items-center">
          <Skeleton className="h-28 w-28 shrink-0 rounded-full dark:bg-zinc-700" />
          <Skeleton className="mt-3 h-3 w-36 dark:bg-zinc-700" />
        </div>
        <hr className="mb-6 border-zinc-200 dark:border-zinc-700" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="mb-1.5 h-3 w-24 dark:bg-zinc-700" />
              <Skeleton className="h-10 w-full dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900 md:px-6",
          isRtl && "flex-row-reverse",
        )}
      >
        <Skeleton className="h-10 w-24 dark:bg-zinc-700" />
        <Skeleton className="h-10 w-28 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

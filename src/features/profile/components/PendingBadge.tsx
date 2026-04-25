"use client";

import { cn } from "@/lib/cn";

export type PendingBadgeVariant = "pending" | "verified";

export interface PendingBadgeProps {
  variant: PendingBadgeVariant;
  label: string;
  className?: string;
}

export function PendingBadge({ variant, label, className }: PendingBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-size-xs fw-medium transition-colors duration-200",
        variant === "pending" &&
          "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800",
        variant === "verified" &&
          "bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-800",
        className,
      )}
    >
      {label}
    </span>
  );
}

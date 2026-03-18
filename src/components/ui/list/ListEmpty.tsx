"use client";

import { cn } from "@/lib/cn";

export function ListEmpty({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "col-span-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--color-charcoal)]/70",
        className,
      )}
      role="status"
    >
      {message}
    </div>
  );
}


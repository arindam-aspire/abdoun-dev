"use client";

import { cn } from "@/lib/cn";

export function ListError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
        className,
      )}
      role="alert"
    >
      {message}
    </div>
  );
}


"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/cn";

export type ViewKey = "grid" | "list";

export interface SearchResultViewToggleProps {
  value: ViewKey;
  onSelect: (value: ViewKey) => void;
  gridLabel: string;
  listLabel: string;
  isRtl?: boolean;
}

export function SearchResultViewToggle({
  value,
  onSelect,
  gridLabel,
  listLabel,
  isRtl = false,
}: SearchResultViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 rounded-2xl bg-surface p-1 ring-1 ring-subtle min-h-11 sm:min-h-0",
        isRtl && "flex-row-reverse",
      )}
      dir={isRtl ? "rtl" : "ltr"}
      role="tablist"
      aria-label="View"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "grid"}
        onClick={() => onSelect("grid")}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2 text-size-sm fw-medium capitalize transition min-h-10 sm:min-h-0",
          value === "grid"
            ? "bg-secondary text-white shadow-sm"
            : "text-[rgba(51,51,51,0.7)] hover:text-secondary",
        )}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        {gridLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "list"}
        onClick={() => onSelect("list")}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2 text-size-sm fw-medium capitalize transition min-h-10 sm:min-h-0",
          value === "list"
            ? "bg-secondary text-white shadow-sm"
            : "text-[rgba(51,51,51,0.7)] hover:text-secondary",
        )}
      >
        <List className="h-4 w-4 shrink-0" aria-hidden />
        {listLabel}
      </button>
    </div>
  );
}



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
        "inline-flex shrink-0 rounded-2xl bg-[var(--surface)] p-1 ring-1 ring-[var(--border-subtle)]",
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
          "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-medium capitalize transition",
          value === "grid"
            ? "bg-[var(--brand-secondary)] text-white shadow-sm"
            : "text-[rgba(51,51,51,0.7)] hover:text-[var(--brand-secondary)]",
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
          "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-medium capitalize transition",
          value === "list"
            ? "bg-[var(--brand-secondary)] text-white shadow-sm"
            : "text-[rgba(51,51,51,0.7)] hover:text-[var(--brand-secondary)]",
        )}
      >
        <List className="h-4 w-4 shrink-0" aria-hidden />
        {listLabel}
      </button>
    </div>
  );
}

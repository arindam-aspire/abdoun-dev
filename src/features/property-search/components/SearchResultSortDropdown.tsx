"use client";

import { useRef, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { HeroDropdown } from "@/features/public-home/components/HeroDropdown";
import { cn } from "@/lib/cn";

export type SortKey = "newest" | "price_asc" | "price_desc";

export const SORT_OPTIONS: { value: SortKey; labelKey: string }[] = [
  { value: "newest", labelKey: "sortNewest" },
  { value: "price_asc", labelKey: "sortLowestPrice" },
  { value: "price_desc", labelKey: "sortHighestPrice" },
];

const dropdownPanelClass =
  "min-w-[180px] rounded-lg border border-subtle bg-white p-2 shadow-xl ring-1 ring-black/5 origin-top animate-fade-in-up";

export interface SearchResultSortDropdownProps {
  value: SortKey;
  onSelect: (value: SortKey) => void;
  getLabel: (labelKey: string) => string;
  isRtl?: boolean;
}

export function SearchResultSortDropdown({
  value,
  onSelect,
  getLabel,
  isRtl = false,
}: SearchResultSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const currentLabelKey =
    SORT_OPTIONS.find((o) => o.value === value)?.labelKey ?? "sortNewest";

  return (
    <div className="relative shrink-0" dir={isRtl ? "rtl" : "ltr"}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 sm:h-11 cursor-pointer items-center gap-1.5 sm:gap-2 rounded-lg border-1 border-[#D1D5DC] bg-white px-3 py-2 sm:px-4 text-sm text-[var(--color-charcoal)] transition hover:border-[rgba(43,91,166,0.6)] min-h-[44px] sm:min-h-0",
          open && "border-[var(--brand-secondary)]",
          isRtl && "flex-row-reverse",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={getLabel("sortNewest")}
      >
        <Menu className="h-4 w-4 shrink-0 text-charcoal/60" aria-hidden />
        {getLabel(currentLabelKey)}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <HeroDropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        align={isRtl ? "right" : "left"}
        anchorRef={triggerRef}
      >
        <ul
          role="listbox"
          className={dropdownPanelClass}
          aria-activedescendant={value}
        >
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value} role="option" aria-selected={value === opt.value}>
              <button
                type="button"
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-size-sm transition duration-200 hover:bg-surface",
                  value === opt.value
                    ? "bg-surface fw-medium text-secondary"
                    : "text-charcoal",
                  isRtl && "flex-row-reverse text-right",
                )}
              >
                {getLabel(opt.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      </HeroDropdown>
    </div>
  );
}


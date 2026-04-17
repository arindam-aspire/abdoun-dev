"use client";

import { SearchResultSortDropdown, type SortKey } from "./SearchResultSortDropdown";
import { SearchResultViewToggle, type ViewKey } from "./SearchResultViewToggle";

export function SearchResultsToolbar({
  title,
  totalItems,
  resultsCountLabel,
  sort,
  view,
  onSortChange,
  onViewChange,
  getSortLabel,
  gridLabel,
  listLabel,
}: {
  title: string;
  totalItems: number;
  resultsCountLabel: string;
  sort: SortKey;
  view: ViewKey;
  onSortChange: (sort: SortKey) => void;
  onViewChange: (view: ViewKey) => void;
  getSortLabel: (labelKey: string) => string;
  gridLabel: string;
  listLabel: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <h2 className="min-w-0 flex-1 text-lg font-semibold text-[var(--color-charcoal)]">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <SearchResultSortDropdown
          value={sort}
          onSelect={onSortChange}
          getLabel={getSortLabel}
        />
        <SearchResultViewToggle
          value={view}
          onSelect={onViewChange}
          gridLabel={gridLabel}
          listLabel={listLabel}
        />
        <span className="shrink-0 text-sm text-[var(--color-charcoal)]/70">
          {totalItems} {resultsCountLabel}
        </span>
      </div>
    </div>
  );
}


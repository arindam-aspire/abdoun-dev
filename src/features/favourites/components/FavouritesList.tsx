"use client";

import { SearchResultPropertyCard } from "@/features/property-search/components/SearchResultPropertyCard";
import type { SearchResultListing } from "@/features/property-search/types";
import { cn } from "@/lib/cn";
import { MAX_COMPARE_ITEMS } from "@/features/compare/compareSlice";

export interface FavouritesListProps {
  listings: SearchResultListing[];
  listLabel: string;
  compareMode: boolean;
  compareIds: number[];
  isRtl: boolean;
  onToggleCompareForId: (id: number) => void;
  isInCompare: (id: number) => boolean;
  addToCompareLabel: string;
  cardTranslations: { email: string; call: string };
}

export function FavouritesList({
  listings,
  listLabel,
  compareMode,
  compareIds,
  isRtl,
  onToggleCompareForId,
  isInCompare,
  addToCompareLabel,
  cardTranslations,
}: FavouritesListProps) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5 items-stretch"
      aria-label={listLabel}
    >
      {listings.map((listing) => (
        <li key={listing.id} className="relative min-h-0">
          {compareMode && (
            <label
              className={cn(
                "absolute top-2 z-20 flex items-center gap-2 rounded-lg border bg-white/95 px-2.5 py-1.5 text-xs font-medium shadow-sm",
                isRtl ? "right-2" : "left-2",
              )}
            >
              <input
                type="checkbox"
                checked={isInCompare(listing.id)}
                onChange={() => onToggleCompareForId(listing.id)}
                disabled={
                  !isInCompare(listing.id) &&
                  compareIds.length >= MAX_COMPARE_ITEMS
                }
                className="h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--brand-secondary)]"
              />
              {addToCompareLabel}
            </label>
          )}
          <SearchResultPropertyCard
            listing={listing}
            translations={cardTranslations}
          />
        </li>
      ))}
    </ul>
  );
}


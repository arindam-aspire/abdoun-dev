"use client";

import { SearchResultPropertyCard } from "./SearchResultPropertyCard";
import type { SearchResultListing } from "@/features/property-search/types";

export function PropertyGrid({
  listings,
  detailsBasePath,
  translations,
}: {
  listings: SearchResultListing[];
  detailsBasePath?: string;
  translations: { email: string; call: string };
}) {
  return (
    <ul
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch"
      aria-label="Property listings"
    >
      {listings.map((listing) => (
        <li key={listing.id} className="min-h-0">
          <SearchResultPropertyCard
            listing={listing}
            translations={translations}
            detailsBasePath={detailsBasePath}
          />
        </li>
      ))}
    </ul>
  );
}


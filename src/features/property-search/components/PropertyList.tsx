"use client";

import { SearchResultListCard } from "./SearchResultListCard";
import type { SearchResultListing } from "@/features/property-search/types";

export function PropertyList({
  listings,
  translations,
}: {
  listings: SearchResultListing[];
  translations: {
    launchPrice: string;
    paymentPlan: string;
    handover: string;
    whatsapp: string;
    email: string;
    call: string;
    byDeveloper: (name: string) => string;
    paymentPlanInfo: string;
  };
}) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 md:gap-5 items-stretch"
      aria-label="Property listings"
    >
      {listings.map((listing) => (
        <li key={listing.id} className="min-h-0">
          <SearchResultListCard listing={listing} translations={translations} />
        </li>
      ))}
    </ul>
  );
}


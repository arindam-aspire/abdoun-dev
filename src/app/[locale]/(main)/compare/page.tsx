"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { SearchResultPropertyCard } from "@/features/property-search/components/SearchResultPropertyCard";
import { MOCK_SEARCH_RESULTS } from "@/lib/mocks/mockSearchResults";
import type { SearchResultListing } from "@/features/property-search/types";
import { parseCompareIds } from "@/features/compare/utils/compareIds";
import { useCompareSelection } from "@/features/compare/hooks/useCompareSelection";

function getListingsByIds(ids: number[]): SearchResultListing[] {
  const byId = new Map(MOCK_SEARCH_RESULTS.map((l) => [l.id, l]));
  return ids
    .map((id) => byId.get(id))
    .filter((l): l is SearchResultListing => l != null);
}

export default function ComparePage() {
  const locale = useLocale() as AppLocale;
  const searchParams = useSearchParams();
  const isRtl = locale === "ar";
  const t = useTranslations("compare");
  const tSearch = useTranslations("searchResult");
  const { toggleSelected, clearAll } = useCompareSelection();

  const ids = useMemo(() => {
    return parseCompareIds(searchParams.get("ids"));
  }, [searchParams]);

  // Keep redux selection in sync with URL ids (client-only state model).
  useEffect(() => {
    // If there are no ids in the URL, keep existing compare selection unchanged.
    if (ids.length === 0) return;
    clearAll();
    for (const id of ids) toggleSelected(id);
  }, [clearAll, ids, toggleSelected]);

  const listings = useMemo(() => getListingsByIds(ids), [ids]);

  const cardTranslations = {
    email: tSearch("email"),
    call: tSearch("call"),
  };

  if (listings.length === 0) {
    return (
      <div
        className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <Link
          href={`/${locale}/favourites`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-secondary)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("backToFavourites")}
        </Link>
        <h1 className="mt-6 text-xl font-semibold text-[var(--color-charcoal)]">
          {t("title")}
        </h1>
        <p className="mt-2 text-[var(--color-charcoal)]/75">
          Select properties from My Favourites to compare them here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Link
        href={`/${locale}/favourites`}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-secondary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("backToFavourites")}
      </Link>
      <h1 className="mt-6 text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
        {t("title")}
      </h1>
      <ul
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5"
        aria-label="Compare property listings"
      >
        {listings.map((listing) => (
          <li key={listing.id} className="min-h-0">
            <SearchResultPropertyCard
              listing={listing}
              translations={cardTranslations}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

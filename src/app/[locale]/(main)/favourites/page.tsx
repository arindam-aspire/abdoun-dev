"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Heart, Scale } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompareModal } from "@/features/compare/components/modals/CompareModal";
import { MOCK_SEARCH_RESULTS } from "@/lib/mocks/mockSearchResults";
import type { SearchResultListing } from "@/features/property-search/types";
import { cn } from "@/lib/cn";
import { useFavourites } from "@/features/favourites/hooks/useFavourites";
import { useCompareSelection } from "@/features/compare/hooks/useCompareSelection";
import { FavouritesList } from "@/features/favourites/components/FavouritesList";

const PAGE_SIZE = 12;
const PAGE_PARAM = "page";

function getPageFromSearchParams(searchParams: URLSearchParams): number {
  const page = searchParams.get(PAGE_PARAM);
  const n = parseInt(page ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function getListingsByIds(ids: number[]): SearchResultListing[] {
  const byId = new Map(MOCK_SEARCH_RESULTS.map((l) => [l.id, l]));
  return ids
    .map((id) => byId.get(id))
    .filter((l): l is SearchResultListing => l != null);
}

export default function FavouritesPage() {
  const locale = useLocale() as AppLocale;
  const searchParams = useSearchParams();
  const isRtl = locale === "ar";
  const tFav = useTranslations("favourites");
  const tSearch = useTranslations("searchResult");

  const { propertyIds } = useFavourites();
  const { selectedIds: compareIds, toggleSelected } = useCompareSelection();

  const [compareMode, setCompareMode] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const favouriteListings = useMemo(
    () => getListingsByIds(propertyIds),
    [propertyIds],
  );

  const currentPage = getPageFromSearchParams(searchParams);
  const totalItems = favouriteListings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const listings = favouriteListings.slice(start, start + PAGE_SIZE);

  const isInCompare = useCallback(
    (id: number) => compareIds.includes(id),
    [compareIds],
  );

  const toggleCompareForId = useCallback(
    (id: number) => {
      toggleSelected(id);
    },
    [toggleSelected],
  );

  const handleCompareClick = useCallback(() => {
    if (compareIds.length < 2) {
      setCompareMode(true);
      return;
    }
    setCompareModalOpen(true);
  }, [compareIds.length]);

  const compareListings = useMemo(
    () => getListingsByIds(compareIds),
    [compareIds],
  );

  const cardTranslations = {
    email: tSearch("email"),
    call: tSearch("call"),
  };

  if (favouriteListings.length === 0) {
    return (
      <div
        className="mx-auto container w-full px-4 py-10 md:px-8"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <h1 className="mb-6 text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
          {tFav("title")}
        </h1>
        <EmptyState
          icon={<Heart className="h-8 w-8" strokeWidth={1.5} />}
          title={tFav("emptyTitle")}
          subtitle={tFav("emptySubtitle")}
          actionLabel={tFav("searchButton")}
          actionHref="/search-result"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
    );
  }

  return (
    <div
      className="mx-auto container w-full px-4 py-8 md:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-[var(--color-charcoal)] md:text-2xl">
          {tFav("title")}
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCompareMode(!compareMode)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition",
              compareMode
                ? "border-[var(--brand-secondary)] bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)]"
                : "border-[var(--border-subtle)] bg-white text-[var(--color-charcoal)] hover:border-[var(--brand-primary)]/30",
            )}
          >
            <Scale className="h-4 w-4" aria-hidden />
            {tFav("compareProperties")}
          </button>
          {compareIds.length >= 2 && (
            <button
              type="button"
              onClick={handleCompareClick}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-secondary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              {tFav("compareCount", { count: String(compareIds.length) })}
            </button>
          )}
        </div>
      </div>

      {compareMode && compareIds.length < 2 && (
        <p className="mb-4 text-sm font-medium text-[var(--brand-secondary)]">
          {tFav("compareMinTwo")}
        </p>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[var(--border-subtle)] md:p-5">
        <FavouritesList
          listings={listings}
          listLabel={tFav("listLabel")}
          compareMode={compareMode}
          compareIds={compareIds}
          isRtl={isRtl}
          onToggleCompareForId={toggleCompareForId}
          isInCompare={isInCompare}
          addToCompareLabel={tFav("addToCompare")}
          cardTranslations={cardTranslations}
        />

        {totalPages > 1 && (
          <div className="mt-8 border-t border-[var(--border-subtle)] pt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              pageParam={PAGE_PARAM}
              translations={{
                previous: tSearch("paginationPrevious"),
                next: tSearch("paginationNext"),
                page: tSearch("paginationPage"),
                of: tSearch("paginationOf"),
                showing: tSearch("paginationShowing"),
                to: tSearch("paginationTo"),
                results: tSearch("paginationResults"),
              }}
            />
          </div>
        )}
      </section>
      <CompareModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        listings={compareListings}
        isRtl={isRtl}
      />
    </div>
  );
}

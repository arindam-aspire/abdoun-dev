"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Heart, Scale } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useAppSelector, useAppDispatch } from "@/hooks/storeHooks";
import { addToCompare, removeFromCompare } from "@/features/compare/compareSlice";
import { MAX_COMPARE_ITEMS } from "@/features/compare/compareSlice";
import { useTranslations } from "@/hooks/useTranslations";
import { SearchResultPropertyCard } from "@/components/search-result/SearchResultPropertyCard";
import { Pagination } from "@/components/search-result/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompareModal } from "@/components/compare/CompareModal";
import { MOCK_SEARCH_RESULTS } from "@/components/search-result/mockSearchResults";
import type { SearchResultListing } from "@/components/search-result/types";
import { cn } from "@/lib/cn";

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

  const propertyIds = useAppSelector((state) => state.favourites.propertyIds);
  const compareIds = useAppSelector((state) => state.compare.propertyIds);
  const dispatch = useAppDispatch();

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
      if (compareIds.includes(id)) {
        dispatch(removeFromCompare(id));
      } else if (compareIds.length < MAX_COMPARE_ITEMS) {
        dispatch(addToCompare(id));
      }
    },
    [compareIds, dispatch],
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
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5 items-stretch"
          aria-label={tFav("listLabel")}
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
                    onChange={() => toggleCompareForId(listing.id)}
                    disabled={
                      !isInCompare(listing.id) && compareIds.length >= MAX_COMPARE_ITEMS
                    }
                    className="h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--brand-secondary)]"
                  />
                  {tFav("addToCompare")}
                </label>
              )}
              <SearchResultPropertyCard
                listing={listing}
                translations={cardTranslations}
              />
            </li>
          ))}
        </ul>

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

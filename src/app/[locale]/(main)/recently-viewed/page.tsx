"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Clock3, Trash2 } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { SearchResultPropertyCard } from "@/features/property-search/components/SearchResultPropertyCard";
import type { SearchResultListing } from "@/features/property-search/types";
import {
  clearRecentlyViewedProperties,
  listRecentViewedListings,
  removeRecentlyViewedProperty,
} from "@/features/recent-views/api/recentViews.api";
import { LoadingScreen } from "@/components/ui";

const PAGE_SIZE = 12;

export default function RecentlyViewedPage() {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";
  const tRecent = useTranslations("recentlyViewed");
  const tSearch = useTranslations("searchResult");

  const [recentListings, setRecentListings] = useState<SearchResultListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  // const [busyIds, setBusyIds] = useState<Record<number, boolean>>({});
  // const [clearBusy, setClearBusy] = useState(false);

  const loadRecentViews = useCallback(async () => {
    setLoading(true);
    try {
      const listings = await listRecentViewedListings();
      setRecentListings(listings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecentViews();
  }, [loadRecentViews]);

  const totalItems = recentListings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const listings = recentListings.slice(start, start + PAGE_SIZE);

  // const handleRemove = useCallback(async (propertyId: number) => {
  //   setBusyIds((prev) => ({ ...prev, [propertyId]: true }));
  //   try {
  //     const removed = await removeRecentlyViewedProperty(propertyId);
  //     if (removed) {
  //       setRecentListings((prev) => prev.filter((item) => item.id !== propertyId));
  //     }
  //   } finally {
  //     setBusyIds((prev) => ({ ...prev, [propertyId]: false }));
  //   }
  // }, []);

  // const handleClearAll = useCallback(async () => {
  //   setClearBusy(true);
  //   try {
  //     const ok = await clearRecentlyViewedProperties();
  //     if (ok) {
  //       setRecentListings([]);
  //       setPage(1);
  //     }
  //   } finally {
  //     setClearBusy(false);
  //   }
  // }, []);

  if (!loading && recentListings.length === 0) {
    return (
      <div
        className="mx-auto container w-full px-4 py-10 md:px-8"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <h1 className="mb-6 text-xl font-semibold text-charcoal md:text-2xl">
          {tRecent("title")}
        </h1>
        <EmptyState
          icon={<Clock3 className="h-8 w-8" strokeWidth={1.5} />}
          title={tRecent("emptyTitle")}
          subtitle={tRecent("emptySubtitle")}
          actionLabel={tRecent("searchButton")}
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
        <h1 className="text-xl font-semibold text-charcoal md:text-2xl">
          {tRecent("title")}
        </h1>
        {/* <button
          type="button"
          onClick={() => void handleClearAll()}
          disabled={clearBusy || loading || totalItems === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-subtle bg-white px-4 py-2.5 text-sm font-medium text-charcoal transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {tRecent("clearAll")}
        </button> */}
      </div>

      <section>
        {loading ? (
          <LoadingScreen
          title="Loading recently viewed properties"
          description="Please wait while we fetch recently viewed properties."
        />
        ) : (
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5 items-stretch"
            aria-label={tRecent("listLabel")}
          >
            {listings.map((listing) => (
              <li key={listing.id} className="relative min-h-0">
                {/* <button
                  type="button"
                  onClick={() => void handleRemove(listing.id)}
                  disabled={Boolean(busyIds[listing.id])}
                  className={`absolute top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-subtle bg-white/95 text-zinc-600 shadow-sm transition hover:text-rose-700 ${
                    isRtl ? "left-2" : "right-2"
                  }`}
                  aria-label={tRecent("removeItem")}
                >
                  <Trash2 className="h-4 w-4" />
                </button> */}
                <SearchResultPropertyCard listing={listing} />
              </li>
            ))}
          </ul>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-8 border-t border-subtle pt-6">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
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
    </div>
  );
}

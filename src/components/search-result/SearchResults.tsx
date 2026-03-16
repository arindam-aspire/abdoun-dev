"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { fetchProperties } from "@/features/property-search/propertySearchSlice";
import { SearchResultPropertyCard } from "./SearchResultPropertyCard";
import { SearchResultListCard } from "./SearchResultListCard";
import { SearchResultSortDropdown } from "./SearchResultSortDropdown";
import { SearchResultViewToggle } from "./SearchResultViewToggle";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingScreen } from "@/components/ui/loading-screen";
import type { SearchResultListing } from "./types";
import type { SortKey } from "./SearchResultSortDropdown";
import type { ViewKey } from "./SearchResultViewToggle";

const PAGE_SIZE = 12;
const PAGE_PARAM = "page";
const SORT_PARAM = "sort";
const VIEW_PARAM = "view";

export interface SearchResultsProps {
  resultsTitle: string;
  /** Base path segment for property details links. Defaults to "property-details". */
  detailsBasePath?: string;
}

function getPageFromSearchParams(searchParams: URLSearchParams): number {
  const page = searchParams.get(PAGE_PARAM);
  const n = parseInt(page ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function getSortParam(searchParams: URLSearchParams): SortKey {
  const sort = searchParams.get(SORT_PARAM);
  if (sort === "newest" || sort === "price_asc" || sort === "price_desc") {
    return sort;
  }
  return "newest";
}

function getViewParam(searchParams: URLSearchParams): ViewKey {
  const view = searchParams.get(VIEW_PARAM);
  return view === "list" ? "list" : "grid";
}

function toPriceNumber(value: string): number {
  const numeric = String(value).replace(/[^\d.]/g, "");
  const amount = Number(numeric);
  return Number.isFinite(amount) ? amount : 0;
}

function sortListings(
  listings: SearchResultListing[],
  sort: SortKey,
): SearchResultListing[] {
  const arr = [...listings];
  if (sort === "newest") {
    return arr.sort((a, b) => b.id - a.id);
  }
  if (sort === "price_asc" || sort === "price_desc") {
    const mult = sort === "price_asc" ? 1 : -1;
    return arr.sort(
      (a, b) => (toPriceNumber(a.price) - toPriceNumber(b.price)) * mult,
    );
  }
  return arr;
}

export function SearchResults({ resultsTitle, detailsBasePath }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const t = useTranslations("searchResult");
  const currentPage = getPageFromSearchParams(searchParams);
  const sort = getSortParam(searchParams);
  const view = getViewParam(searchParams);
  const { items, total, loading, error, pageSize } = useAppSelector(
    (state) => state.propertySearch,
  );

  const requestQuery = useMemo(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(SORT_PARAM);
    next.delete(VIEW_PARAM);
    next.set(PAGE_PARAM, String(currentPage));
    if (!next.get("pageSize")) {
      next.set("pageSize", String(PAGE_SIZE));
    }
    return next.toString();
  }, [currentPage, searchParams]);

  useEffect(() => {
    void dispatch(fetchProperties(requestQuery));
  }, [dispatch, requestQuery]);

  const sortedListings = sortListings(items, sort);
  const totalItems = total;
  const effectivePageSize = pageSize || PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const page = Math.min(currentPage, totalPages);

  const setSort = useCallback(
    (newSort: SortKey) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set(SORT_PARAM, newSort);
      next.delete(PAGE_PARAM);
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const setView = useCallback(
    (newView: ViewKey) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set(VIEW_PARAM, newView);
      next.delete(PAGE_PARAM);
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const cardTranslations = {
    email: t("email"),
    call: t("call"),
  };
  const listCardTranslations = {
    launchPrice: t("launchPrice"),
    paymentPlan: t("paymentPlan"),
    handover: t("handover"),
    whatsapp: t("whatsapp"),
    email: t("email"),
    call: t("call"),
    byDeveloper: (name: string) => t("byDeveloper", { name }),
    paymentPlanInfo: t("paymentPlanInfo"),
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[var(--border-subtle)] md:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="min-w-0 flex-1 text-lg font-semibold text-[var(--color-charcoal)]">
          {resultsTitle}
        </h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <SearchResultSortDropdown
            value={sort}
            onSelect={setSort}
            getLabel={(key) => t(key)}
          />
          <SearchResultViewToggle
            value={view}
            onSelect={setView}
            gridLabel={t("viewGrid")}
            listLabel={t("viewList")}
          />
          <span className="shrink-0 text-sm text-[var(--color-charcoal)]/70">
            {totalItems} {t("resultsCount")}
          </span>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : loading ? (
        <LoadingScreen
          title="Loading properties..."
          description="Please wait while we fetch matching listings."
        />
      ) : (
        <ul
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-stretch"
              : "grid grid-cols-1 gap-4 md:gap-5 items-stretch"
          }
          aria-label="Property listings"
        >
          {sortedListings.map((listing) => (
            <li key={listing.id} className="min-h-0">
              {view === "grid" ? (
                <SearchResultPropertyCard
                  listing={listing}
                  translations={cardTranslations}
                  detailsBasePath={detailsBasePath}
                />
              ) : (
                <SearchResultListCard
                  listing={listing}
                  translations={listCardTranslations}
                />
              )}
            </li>
          ))}
          {!loading && sortedListings.length === 0 && (
            <li className="col-span-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--color-charcoal)]/70">
              {t("noResults")}
            </li>
          )}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-8 border-t border-subtle pt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={effectivePageSize}
            pageParam={PAGE_PARAM}
            translations={{
              previous: t("paginationPrevious"),
              next: t("paginationNext"),
              page: t("paginationPage"),
              of: t("paginationOf"),
              showing: t("paginationShowing"),
              to: t("paginationTo"),
              results: t("paginationResults"),
            }}
          />
        </div>
      )}
    </section>
  );
}



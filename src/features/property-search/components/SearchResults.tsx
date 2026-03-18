"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useSearchFilters } from "@/features/property-search/hooks/useSearchFilters";
import { usePropertySearch } from "@/features/property-search/hooks/usePropertySearch";
import { SearchResultsToolbar } from "@/features/property-search/components/SearchResultsToolbar";
import { PropertyGrid } from "@/features/property-search/components/PropertyGrid";
import { PropertyList } from "@/features/property-search/components/PropertyList";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ListEmpty } from "@/components/ui/list/ListEmpty";
import { ListError } from "@/components/ui/list/ListError";
import type { SearchResultListing } from "@/features/property-search/types";
import type { SortKey } from "@/features/property-search/components/SearchResultSortDropdown";

const PAGE_SIZE = 12;
const PAGE_PARAM = "page";
const SORT_PARAM = "sort";
const VIEW_PARAM = "view";

export interface SearchResultsProps {
  resultsTitle: string;
  /** Base path segment for property details links. Defaults to "property-details". */
  detailsBasePath?: string;
}

function toPriceNumber(value: string): number {
  const numeric = String(value).replace(/[^\d.]/g, "");
  const amount = Number(numeric);
  return Number.isFinite(amount) ? amount : 0;
}

function sortListings(listings: SearchResultListing[], sort: SortKey): SearchResultListing[] {
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
  const t = useTranslations("searchResult");
  const { searchParams, currentPage, sort, view, setSort, setView } =
    useSearchFilters();
  const { items, total, loading, error, pageSize } = usePropertySearch({
    searchParams,
    currentPage,
    defaultPageSize: PAGE_SIZE,
    sortParamKey: SORT_PARAM,
    viewParamKey: VIEW_PARAM,
  });

  const sortedListings = sortListings(items, sort);
  const totalItems = total;
  const effectivePageSize = pageSize || PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const page = Math.min(currentPage, totalPages);

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
      <SearchResultsToolbar
        title={resultsTitle}
        totalItems={totalItems}
        resultsCountLabel={t("resultsCount")}
        sort={sort}
        view={view}
        onSortChange={setSort}
        onViewChange={setView}
        getSortLabel={(key: string) => t(key)}
        gridLabel={t("viewGrid")}
        listLabel={t("viewList")}
      />

      {error ? (
        <ListError message={error} />
      ) : loading ? (
        <LoadingScreen
          title="Loading properties..."
          description="Please wait while we fetch matching listings."
        />
      ) : (
        <>
          {sortedListings.length === 0 ? (
            <ListEmpty message={t("noResults")} />
          ) : view === "grid" ? (
            <PropertyGrid
              listings={sortedListings}
              translations={cardTranslations}
              detailsBasePath={detailsBasePath}
            />
          ) : (
            <PropertyList
              listings={sortedListings}
              translations={listCardTranslations}
            />
          )}
        </>
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


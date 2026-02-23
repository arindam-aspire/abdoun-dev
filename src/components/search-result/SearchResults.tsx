"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { SearchResultPropertyCard } from "./SearchResultPropertyCard";
import { SearchResultSortDropdown } from "./SearchResultSortDropdown";
import { SearchResultViewToggle } from "./SearchResultViewToggle";
import { Pagination } from "./Pagination";
import { MOCK_SEARCH_RESULTS } from "./mockSearchResults";
import type { CategoryKey, SearchResultListing, StatusTabKey } from "./types";
import type { SortKey } from "./SearchResultSortDropdown";
import type { ViewKey } from "./SearchResultViewToggle";

const PAGE_SIZE = 12;
const PAGE_PARAM = "page";
const SORT_PARAM = "sort";
const VIEW_PARAM = "view";

export interface SearchResultsProps {
  resultsTitle: string;
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

function getPageFromSearchParams(searchParams: URLSearchParams): number {
  const page = searchParams.get(PAGE_PARAM);
  const n = parseInt(page ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function getStatusParam(searchParams: URLSearchParams): StatusTabKey | null {
  const status = searchParams.get("status");
  return status === "buy" || status === "rent" ? status : null;
}

function getCategoryParam(searchParams: URLSearchParams): CategoryKey | null {
  const category = searchParams.get("category");
  if (category === "residential" || category === "commercial") return category;
  if (category === "land" || category === "lands") return "land";
  return null;
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

function getAreasParam(searchParams: URLSearchParams): string[] {
  const raw = searchParams.get("locations");
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function toPriceNumber(value: string): number {
  const numeric = String(value).replace(/[^\d.]/g, "");
  const amount = Number(numeric);
  return Number.isFinite(amount) ? amount : 0;
}

function getBudgetFromParams(searchParams: URLSearchParams): {
  min: number;
  max: number;
  hasMin: boolean;
  hasMax: boolean;
} {
  const rawMin = (searchParams.get("budgetMin") ?? "").trim();
  const rawMax = (searchParams.get("budgetMax") ?? "").trim();
  const min = toPriceNumber(rawMin);
  const max = toPriceNumber(rawMax);
  return {
    min,
    max,
    hasMin: min > 0,
    hasMax: max > 0,
  };
}

/** Normalize area string for comparison (lowercase, consistent spacing). */
function normalizeArea(area: string): string {
  return area.trim().toLowerCase().replace(/\s+/g, " ");
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

function filterListingsBySearchParams(
  listings: typeof MOCK_SEARCH_RESULTS,
  searchParams: URLSearchParams,
): typeof MOCK_SEARCH_RESULTS {
  const status = getStatusParam(searchParams);
  const category = getCategoryParam(searchParams);
  const typeParam = (searchParams.get("type") ?? "").trim().toLowerCase();
  const cityParam = (searchParams.get("city") ?? "").trim().toLowerCase();
  const areas = getAreasParam(searchParams);
  const budget = getBudgetFromParams(searchParams);

  return listings.filter((listing) => {
    if (status) {
      if (!listing.status || listing.status !== status) return false;
    }
    if (category) {
      if (!listing.category || listing.category !== category) return false;
    }
    if (typeParam) {
      const listingType = slugify(
        listing.searchPropertyType ?? listing.propertyType ?? "",
      );
      if (listingType !== typeParam) return false;
    }
    if (cityParam) {
      const listingCity = (listing.city ?? "").trim().toLowerCase();
      if (!listingCity || listingCity !== cityParam) return false;
    }
    if (areas.length > 0) {
      const listingAreaNorm = normalizeArea(listing.areaName ?? "");
      if (!listingAreaNorm) return false;
      const areaMatches = areas.some(
        (a) => normalizeArea(a) === listingAreaNorm,
      );
      if (!areaMatches) return false;
    }
    if (budget.hasMin || budget.hasMax) {
      const price = toPriceNumber(listing.price);
      if (budget.hasMin && price < budget.min) return false;
      if (budget.hasMax && price > budget.max) return false;
    }
    return true;
  });
}

export function SearchResults({ resultsTitle }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("searchResult");
  const currentPage = getPageFromSearchParams(searchParams);
  const sort = getSortParam(searchParams);
  const view = getViewParam(searchParams);

  const filteredListings = filterListingsBySearchParams(
    MOCK_SEARCH_RESULTS,
    searchParams,
  );
  const sortedListings = sortListings(filteredListings, sort);

  const totalItems = sortedListings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const listings = sortedListings.slice(start, start + PAGE_SIZE);

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

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[var(--border-subtle)] md:p-5">
      {/* Same line: title — dropdown — list/map — listing count */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="min-w-0 flex-1 text-lg font-semibold text-[var(--color-charcoal)]">
          {resultsTitle}
        </h2>
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

      <ul
        className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-stretch"
            : "grid grid-cols-1 gap-4 md:gap-5 items-stretch"
        }
        aria-label="Property listings"
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

      {totalPages > 1 && (
        <div className="mt-8 border-t border-[var(--border-subtle)] pt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
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

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { AgentSearchResultGridCard } from "./AgentSearchResultGridCard";
import { AgentSearchResultListCard } from "./AgentSearchResultListCard";
import { SearchResultSortDropdown } from "@/components/search-result/SearchResultSortDropdown";
import { SearchResultViewToggle } from "@/components/search-result/SearchResultViewToggle";
import { Pagination } from "@/components/ui/Pagination";
import { MOCK_SEARCH_RESULTS } from "@/components/search-result/mockSearchResults";
import type {
  CategoryKey,
  SearchResultListing,
  StatusTabKey,
} from "@/components/search-result/types";
import type { SortKey } from "@/components/search-result/SearchResultSortDropdown";
import type { ViewKey } from "@/components/search-result/SearchResultViewToggle";

const PAGE_SIZE = 12;
const PAGE_PARAM = "page";
const SORT_PARAM = "sort";
const VIEW_PARAM = "view";

export interface AgentSearchResultsProps {
  language: AppLocale;
  resultsTitle: string;
  searchParams: URLSearchParams;
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

function getBudgetFromParams(searchParams: URLSearchParams) {
  const rawMin = (searchParams.get("budgetMin") ?? "").trim();
  const rawMax = (searchParams.get("budgetMax") ?? "").trim();
  const min = toPriceNumber(rawMin);
  const max = toPriceNumber(rawMax);
  return { min, max, hasMin: min > 0, hasMax: max > 0 };
}

function toAreaNumber(value: string): number {
  const numeric = String(value).replace(/[^\d.]/g, "");
  return Number.isFinite(Number(numeric)) ? Number(numeric) : 0;
}

function getAdvancedParams(searchParams: URLSearchParams) {
  const get = (k: string) => (searchParams.get(k) ?? "").trim();
  const amenitiesRaw = searchParams.get("amenities");
  const allowedAmenities = new Set([
    "balcony",
    "builtInCloset",
    "garden",
    "alarmSystem",
    "homeAutomation",
    "gymAccess",
    "parkingAvailable",
    "loadingAccess",
    "displayFrontage",
    "airConditioning",
    "storageArea",
    "roadAccess",
    "utilitiesAvailable",
    "zonedUse",
    "waterSource",
    "electricityNearby",
  ]);
  const amenities = amenitiesRaw
    ? new Set(
        amenitiesRaw
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0 && allowedAmenities.has(a)),
      )
    : new Set<string>();
  return {
    furnitureStatus: get("furnitureStatus"),
    bathrooms: get("bathrooms"),
    floorLevel: get("floorLevel"),
    parking: get("parking"),
    propertyAge: get("propertyAge"),
    minArea: toAreaNumber(get("minArea")),
    maxArea: toAreaNumber(get("maxArea")),
    hasMinArea: toAreaNumber(get("minArea")) > 0,
    hasMaxArea: toAreaNumber(get("maxArea")) > 0,
    bedrooms: get("bedrooms"),
    rooms: get("rooms"),
    minPlotArea: toAreaNumber(get("minPlotArea")),
    maxPlotArea: toAreaNumber(get("maxPlotArea")),
    hasMinPlotArea: toAreaNumber(get("minPlotArea")) > 0,
    hasMaxPlotArea: toAreaNumber(get("maxPlotArea")) > 0,
    amenities,
  };
}

function normalizeArea(area: string): string {
  return area
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function sortListings(
  listings: SearchResultListing[],
  sort: SortKey,
): SearchResultListing[] {
  const arr = [...listings];
  if (sort === "newest") return arr.sort((a, b) => b.id - a.id);
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
  const exclusiveParam = searchParams.get("exclusive");
  const exclusiveOnly = exclusiveParam === "1" || exclusiveParam === "true";
  let source = listings;
  if (exclusiveOnly) {
    source = listings.filter(
      (l) =>
        l.exclusive === true ||
        (Array.isArray(l.badges) && l.badges.includes("Exclusive")),
    );
  }
  const status = getStatusParam(searchParams);
  const category = getCategoryParam(searchParams);
  const typeParam = (searchParams.get("type") ?? "").trim().toLowerCase();
  const cityParam = (searchParams.get("city") ?? "").trim().toLowerCase();
  const areas = getAreasParam(searchParams);
  const budget = getBudgetFromParams(searchParams);
  const adv = getAdvancedParams(searchParams);

  return source.filter((listing) => {
    if (status && (!listing.status || listing.status !== status)) return false;
    if (category && (!listing.category || listing.category !== category))
      return false;
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
      if (
        !listingAreaNorm ||
        !areas.some((a) => normalizeArea(a) === listingAreaNorm)
      )
        return false;
    }
    if (budget.hasMin || budget.hasMax) {
      const price = toPriceNumber(listing.price);
      if (budget.hasMin && price < budget.min) return false;
      if (budget.hasMax && price > budget.max) return false;
    }
    if (adv.bathrooms && (category === "residential" || category === "commercial")) {
      const needBaths = parseInt(adv.bathrooms, 10);
      if (Number.isFinite(needBaths) && listing.baths !== needBaths) return false;
    }
    if (adv.bedrooms && category === "residential") {
      const needBeds = parseInt(adv.bedrooms, 10);
      if (Number.isFinite(needBeds) && listing.beds !== needBeds) return false;
    }
    if (adv.rooms && category === "commercial") {
      const needRooms = parseInt(adv.rooms, 10);
      if (Number.isFinite(needRooms) && listing.beds !== needRooms) return false;
    }
    if (adv.hasMinArea || adv.hasMaxArea) {
      const listingArea = toAreaNumber(listing.area);
      if (adv.hasMinArea && listingArea < adv.minArea) return false;
      if (adv.hasMaxArea && listingArea > adv.maxArea) return false;
    }
    if (adv.hasMinPlotArea || adv.hasMaxPlotArea) {
      const listingPlot = toAreaNumber(listing.area);
      if (adv.hasMinPlotArea && listingPlot < adv.minPlotArea) return false;
      if (adv.hasMaxPlotArea && listingPlot > adv.maxPlotArea) return false;
    }
    return true;
  });
}

export function AgentSearchResults({
  language,
  resultsTitle,
  searchParams,
}: AgentSearchResultsProps) {
  const router = useRouter();
  const t = useTranslations("searchResult");
  const currentPage = getPageFromSearchParams(searchParams);
  const sort = getSortParam(searchParams);
  const view = getViewParam(searchParams);
  const isRtl = language === "ar";

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
    <section
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[var(--border-subtle)] md:p-5"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <h2 className="min-w-0 text-base font-semibold text-[var(--color-charcoal)] sm:flex-1 sm:text-lg">
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

      <ul
        className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-stretch"
            : "grid grid-cols-1 gap-4 md:gap-5 items-stretch"
        }
        aria-label="Property listings"
      >
        {totalItems === 0 ? (
          <li className="col-span-full py-12 text-center text-[var(--color-charcoal)]/80">
            {t("noResults")}
          </li>
        ) : (
          listings.map((listing) => (
            <li key={listing.id} className="min-h-0">
              {view === "list" ? (
                <AgentSearchResultListCard
                  listing={listing}
                  translations={listCardTranslations}
                />
              ) : (
                <AgentSearchResultGridCard
                  listing={listing}
                  translations={cardTranslations}
                />
              )}
            </li>
          ))
        )}
      </ul>

      {totalPages > 1 && (
        <div className="mt-8 border-t border-subtle pt-6">
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
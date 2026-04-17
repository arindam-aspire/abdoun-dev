"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SortKey } from "@/features/property-search/components/SearchResultSortDropdown";
import type { ViewKey } from "@/features/property-search/components/SearchResultViewToggle";

const PAGE_PARAM = "page";
const SORT_PARAM = "sort";
const VIEW_PARAM = "view";

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

export type UseSearchFiltersResult = {
  searchParams: URLSearchParams;
  currentPage: number;
  sort: SortKey;
  view: ViewKey;
  setSort: (sort: SortKey) => void;
  setView: (view: ViewKey) => void;
};

/**
 * Search filters derived from URL params with setters that preserve current behavior:
 * - changing sort clears page param
 * - changing view preserves page param
 * - uses router.replace with scroll:false
 */
export function useSearchFilters(): UseSearchFiltersResult {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = useMemo(
    () => getPageFromSearchParams(searchParams),
    [searchParams],
  );
  const sort = useMemo(() => getSortParam(searchParams), [searchParams]);
  const view = useMemo(() => getViewParam(searchParams), [searchParams]);

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
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return { searchParams, currentPage, sort, view, setSort, setView };
}


"use client";

import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { fetchProperties } from "@/features/property-search/propertySearchSlice";
import { buildPropertySearchRequestQuery } from "@/features/property-search/utils/queryStringBuilder";
import type { RootState } from "@/store";

export type UsePropertySearchResult = {
  requestQuery: string;
  items: RootState["propertySearch"]["items"];
  total: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
};

/**
 * Executes property search when the computed request query changes.
 * Uses the existing slice thunk and preserves request-query semantics.
 */
export function usePropertySearch(args: {
  searchParams: URLSearchParams;
  currentPage: number;
  defaultPageSize: number;
  sortParamKey?: string;
  viewParamKey?: string;
}): UsePropertySearchResult {
  const dispatch = useAppDispatch();
  const { items, total, pageSize, loading, error } = useAppSelector(
    (state: RootState) => state.propertySearch,
  );

  const requestQuery = useMemo(() => {
    return buildPropertySearchRequestQuery({
      searchParams: args.searchParams,
      currentPage: args.currentPage,
      defaultPageSize: args.defaultPageSize,
      sortParamKey: args.sortParamKey,
      viewParamKey: args.viewParamKey,
    });
  }, [
    args.currentPage,
    args.defaultPageSize,
    args.searchParams,
    args.sortParamKey,
    args.viewParamKey,
  ]);

  useEffect(() => {
    void dispatch(fetchProperties(requestQuery));
  }, [dispatch, requestQuery]);

  return {
    requestQuery,
    items,
    total,
    pageSize,
    loading,
    error,
  };
}


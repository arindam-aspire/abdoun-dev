"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { fetchExclusivePropertiesOnce } from "@/features/exclusive-properties/exclusivePropertiesSlice";
import type { Property } from "@/features/public-home/components/types";

export type UseExclusivePropertiesResult = {
  items: Property[];
  loading: boolean;
  error: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
};

/**
 * Exclusive properties for the home page. Fetches once when idle; uses slice for caching.
 */
export function useExclusiveProperties(): UseExclusivePropertiesResult {
  const dispatch = useAppDispatch();
  const {
    items,
    loading,
    error,
    status,
  } = useAppSelector((state) => state.exclusiveProperties);

  useEffect(() => {
    if (status !== "idle") return;
    void dispatch(fetchExclusivePropertiesOnce());
  }, [dispatch, status]);

  return { items, loading, error, status };
}

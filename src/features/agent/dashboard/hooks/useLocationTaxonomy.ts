"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import type { LocationTaxonomyCity } from "@/features/location-taxonomy/api/locationTaxonomy.api";
import {
  fetchLocationTaxonomyIfNeeded,
  resetLocationTaxonomy,
  selectLocationTaxonomyCities,
  selectLocationTaxonomyError,
  selectLocationTaxonomyStatus,
} from "@/features/location-taxonomy/locationTaxonomySlice";

export function useLocationTaxonomy() {
  const dispatch = useAppDispatch();
  const cities = useAppSelector(selectLocationTaxonomyCities) as LocationTaxonomyCity[];
  const status = useAppSelector(selectLocationTaxonomyStatus);
  const failed = useAppSelector(selectLocationTaxonomyError);

  useEffect(() => {
    void dispatch(fetchLocationTaxonomyIfNeeded());
  }, [dispatch]);

  const loading =
    status === "loading" || (status === "idle" && cities.length === 0 && !failed);

  const refresh = useCallback(async () => {
    dispatch(resetLocationTaxonomy());
    await dispatch(fetchLocationTaxonomyIfNeeded());
  }, [dispatch]);

  return {
    cities,
    loading,
    error: status === "failed",
    refresh,
  };
}

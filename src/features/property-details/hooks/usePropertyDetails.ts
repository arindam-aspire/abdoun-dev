import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { fetchPropertyDetails } from "@/features/property-details/propertyDetailsSlice";
import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";

export type UsePropertyDetailsResult = {
  resolvedPropertyId: number | null;
  item: PropertyDetailsApiResponse | null;
  isPropertyLoading: boolean;
  propertyNotFound: boolean;
  error: string | null;
};

/**
 * Loads property details via the public API — does not require sign-in.
 * Fetch runs on mount without waiting for auth hydration.
 */
export function usePropertyDetails(propertyId: string | undefined): UsePropertyDetailsResult {
  const dispatch = useAppDispatch();
  const { item, loading, error, currentId } = useAppSelector((state) => state.propertyDetails);

  const resolvedPropertyId = useMemo(() => {
    const parsed = Number.parseInt(propertyId ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [propertyId]);

  useEffect(() => {
    if (!resolvedPropertyId) return;
    if (currentId === resolvedPropertyId && item) return;
    if (loading && currentId === resolvedPropertyId) return;
    void dispatch(fetchPropertyDetails(resolvedPropertyId));
  }, [currentId, dispatch, item, loading, resolvedPropertyId]);

  const isPropertyLoading = Boolean(
    resolvedPropertyId &&
      (loading ||
        (currentId !== resolvedPropertyId && !error) ||
        (currentId === resolvedPropertyId && !item && !error)),
  );

  const propertyNotFound = Boolean(
    resolvedPropertyId &&
      !loading &&
      currentId === resolvedPropertyId &&
      !item &&
      !error,
  );

  return {
    resolvedPropertyId,
    item,
    isPropertyLoading,
    propertyNotFound,
    error,
  };
}

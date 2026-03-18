import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { fetchPropertyDetails } from "@/features/property-details/propertyDetailsSlice";
import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";

export type UsePropertyDetailsResult = {
  resolvedPropertyId: number | null;
  item: PropertyDetailsApiResponse | null;
  loading: boolean;
  error: string | null;
};

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
    void dispatch(fetchPropertyDetails(resolvedPropertyId));
  }, [currentId, dispatch, item, resolvedPropertyId]);

  return { resolvedPropertyId, item, loading, error };
}


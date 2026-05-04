"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSimilarPropertiesById } from "@/features/property-search/api/propertySearch.api";
import type { SearchResultListing } from "@/features/property-search/types";

const resultCache = new Map<string, SearchResultListing[]>();
const inFlight = new Map<string, Promise<SearchResultListing[]>>();

function normalizePropertyId(propertyId: string | number | null | undefined): string | null {
  if (propertyId === null || propertyId === undefined) return null;
  const s = String(propertyId).trim();
  return s.length > 0 ? s : null;
}

/**
 * Similar listings for a property; dedupes concurrent fetches and caches by route id for the session.
 */
export function useSimilarProperties(propertyId: string | number | null | undefined) {
  const key = normalizePropertyId(propertyId);

  const [items, setItems] = useState<SearchResultListing[] | null>(() =>
    key ? resultCache.get(key) ?? null : null,
  );
  const [error, setError] = useState<string | null>(null);

  const loading = key !== null && items === null && error === null;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!key) {
        await Promise.resolve();
        if (cancelled) return;
        setItems(null);
        setError(null);
        return;
      }

      const cached = resultCache.get(key);
      if (cached) {
        await Promise.resolve();
        if (cancelled) return;
        setItems(cached);
        setError(null);
        return;
      }

      await Promise.resolve();
      if (cancelled) return;
      setItems(null);
      setError(null);

      let request = inFlight.get(key);
      if (!request) {
        request = fetchSimilarPropertiesById(key).finally(() => {
          inFlight.delete(key);
        });
        inFlight.set(key, request);
      }

      try {
        const data = await request;
        const filtered = data.filter((item) => String(item.id) !== key);
        if (!cancelled) {
          resultCache.set(key, filtered);
          setItems(filtered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load similar properties.",
          );
          setItems([]);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [key]);

  const refresh = useCallback(async () => {
    if (!key) return;
    resultCache.delete(key);
    setItems(null);
    setError(null);
    try {
      const data = await fetchSimilarPropertiesById(key);
      const filtered = data.filter((item) => String(item.id) !== key);
      resultCache.set(key, filtered);
      setItems(filtered);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load similar properties.",
      );
      setItems([]);
    }
  }, [key]);

  return { items, loading, error, refresh };
}

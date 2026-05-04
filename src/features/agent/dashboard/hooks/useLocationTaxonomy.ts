"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchLocationTaxonomy,
  type LocationTaxonomyCity,
} from "@/features/agent/dashboard/api/taxonomy.api";

let cached: LocationTaxonomyCity[] | null = null;
let inFlight: Promise<LocationTaxonomyCity[]> | null = null;

async function loadLocationTaxonomy(force: boolean): Promise<LocationTaxonomyCity[]> {
  if (!force && cached) {
    return cached;
  }
  if (!force && inFlight) {
    return inFlight;
  }
  if (force) {
    cached = null;
  }

  inFlight = fetchLocationTaxonomy()
    .then((data) => {
      cached = data;
      return data;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function useLocationTaxonomy() {
  const [cities, setCities] = useState<LocationTaxonomyCity[]>(() => cached ?? []);
  const [loading, setLoading] = useState(() => !cached);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadLocationTaxonomy(false)
      .then((data) => {
        if (cancelled) return;
        setCities(data ?? []);
        setFailed(false);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setCities([]);
          setFailed(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadLocationTaxonomy(true);
      setCities(data ?? []);
      setFailed(false);
    } catch {
      setCities([]);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { cities, loading, error: failed, refresh };
}

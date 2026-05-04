"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPropertyTaxonomy,
  type PropertyTaxonomyCategory,
} from "@/features/agent/dashboard/api/taxonomy.api";

let cached: PropertyTaxonomyCategory[] | null = null;
let inFlight: Promise<PropertyTaxonomyCategory[]> | null = null;

async function loadPropertyTaxonomy(force: boolean): Promise<PropertyTaxonomyCategory[]> {
  if (!force && cached) {
    return cached;
  }
  if (!force && inFlight) {
    return inFlight;
  }
  if (force) {
    cached = null;
  }

  inFlight = fetchPropertyTaxonomy()
    .then((data) => {
      cached = data;
      return data;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function usePropertyTaxonomy() {
  const [categories, setCategories] = useState<PropertyTaxonomyCategory[]>(() => cached ?? []);
  const [loading, setLoading] = useState(() => !cached);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadPropertyTaxonomy(false)
      .then((data) => {
        if (cancelled) return;
        setCategories(data ?? []);
        setFailed(false);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
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
      const data = await loadPropertyTaxonomy(true);
      setCategories(data ?? []);
      setFailed(false);
    } catch {
      setCategories([]);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { categories, loading, error: failed, refresh };
}

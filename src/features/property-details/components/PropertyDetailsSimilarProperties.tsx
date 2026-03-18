"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/features/public-home/components/types";
import { PropertyCard } from "@/features/public-home/components/PropertyCard";
import { fetchSimilarPropertiesById } from "@/services/propertyService";
import type { SearchResultListing } from "@/features/property-search/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop";

function toPropertyCard(item: SearchResultListing): Property {
  return {
    id: item.id,
    title: item.title || "Untitled Property",
    price: item.price || "Price on request",
    badge: item.badges?.[0] ?? "For Sale",
    image: item.images?.[0] || FALLBACK_IMAGE,
    location: item.location || "Location unavailable",
    beds: item.beds ?? 0,
    baths: item.baths ?? 0,
    area: item.area || "N/A",
  };
}

export interface PropertyDetailsSimilarPropertiesProps {
  propertyId: number;
}

export function PropertyDetailsSimilarProperties({ propertyId }: PropertyDetailsSimilarPropertiesProps) {
  const [activeSimilar, setActiveSimilar] = useState(0);
  const [items, setItems] = useState<SearchResultListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const similarProperties = useMemo(() => (items ?? []).map(toPropertyCard), [items]);
  const total = similarProperties.length;
  const normalizedIndex = total === 0 ? 0 : Math.min(activeSimilar, total - 1);
  const current = total > 0 ? similarProperties[normalizedIndex] : null;
  const loading = items == null && !error;
  const isRtl = useLocale() === "ar";

  useEffect(() => {
    let mounted = true;

    void fetchSimilarPropertiesById(propertyId)
      .then((data) => {
        if (!mounted) return;
        setItems(data.filter((item) => item.id !== propertyId));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load similar properties.");
        setItems([]);
      })
      ;

    return () => {
      mounted = false;
    };
  }, [propertyId]);

  const goTo = (index: number) => {
    if (total === 0) return;
    const next = (index + total) % total;
    setActiveSimilar(next);
  };

  return (
    <section
      className="rounded-2xl border border-subtle bg-white/95 py-5 text-charcoal shadow-[0_8px_24px_rgba(15,23,42,0.08)] md:py-6"
      aria-labelledby="similar-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-2 px-4 md:px-5">
        <h2
          id="similar-heading"
          className="text-size-sm fw-semibold uppercase tracking-[0.14em] text-charcoal/85"
        >
          Similar properties
        </h2>
        <span className="text-size-xs fw-medium text-charcoal/70">Curated for you</span>
      </div>

      <div className="px-4 md:px-5">
        {loading ? (
          <div className="rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-6 text-sm text-[var(--color-charcoal)]/70">
            Loading similar properties...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
            {error}
          </div>
        ) : current ? (
          <PropertyCard
            property={current}
            agentLabel="Abdoun Real Estate"
            variant="minimal"
          />
        ) : (
          <div className="rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-6 text-sm text-[var(--color-charcoal)]/70">
            No similar properties found.
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 px-4 md:px-5">
        <div
          className={`flex items-center gap-1 text-size-11 text-charcoal/70 ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => goTo(activeSimilar - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-on-primary hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            aria-label={
              isRtl ? "Next similar property" : "Previous similar property"
            }
          >
            {isRtl ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => goTo(activeSimilar + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-on-primary hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            aria-label={
              isRtl ? "Previous similar property" : "Next similar property"
            }
          >
            {isRtl ? (
              <ChevronLeft className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
          <span className={isRtl ? "mr-1" : "ml-1"}>
            {total === 0 ? 0 : normalizedIndex + 1} / {total}
          </span>
        </div>
      </div>

        <div className="flex h-full items-center justify-center gap-1">
          {similarProperties.map((property, index) => (
            <button
              key={property.id}
              type="button"
              onClick={() => setActiveSimilar(index)}
              className={`h-1.5 rounded-full transition ${
                index === activeSimilar
                  ? "w-5 bg-secondary"
                  : "w-3 bg-border-subtle hover:opacity-80"
              }`}
              aria-label={`Go to similar property ${index + 1}`}
            />
          ))}
        </div>
     </section>
  );
}

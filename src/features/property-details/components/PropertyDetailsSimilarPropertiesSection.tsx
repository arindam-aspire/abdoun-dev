"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { ExclusivePropertiesSection } from "@/features/public-home/components/ExclusivePropertiesSection";
import type {
  FeaturedTranslations,
  Property,
} from "@/features/public-home/components/types";
import type { SearchResultListing } from "@/features/property-search/types";
import { fetchSimilarPropertiesById } from "@/services/propertyService";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop";

const SIMILAR_TRANSLATIONS: FeaturedTranslations = {
  title: "Similar Properties",
  subtitle: "Properties related to this listing",
  viewAll: "View all properties",
  viewAllHref: "/search-result?status=buy&category=residential",
};

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

export interface PropertyDetailsSimilarPropertiesSectionProps {
  propertyId: number;
}

export function PropertyDetailsSimilarPropertiesSection({
  propertyId,
}: PropertyDetailsSimilarPropertiesSectionProps) {
  const isRtl = useLocale() === "ar";
  const [items, setItems] = useState<SearchResultListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const similarProperties = useMemo(
    () => (items ?? []).map(toPropertyCard),
    [items],
  );
  const loading = items == null && !error;

  useEffect(() => {
    let mounted = true;

    void fetchSimilarPropertiesById(propertyId)
      .then((data) => {
        if (!mounted) return;
        setItems(data.filter((item) => item.id !== propertyId));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load similar properties.",
        );
        setItems([]);
      });

    return () => {
      mounted = false;
    };
  }, [propertyId]);

  return (
    <ExclusivePropertiesSection
      translations={SIMILAR_TRANSLATIONS}
      properties={similarProperties}
      isRtl={isRtl}
      loading={loading}
      error={error}
      useCarouselOnOverflow
    />
  );
}

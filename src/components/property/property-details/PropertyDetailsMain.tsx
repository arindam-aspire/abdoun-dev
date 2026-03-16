"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { fetchPropertyDetails } from "@/features/property-details/propertyDetailsSlice";
import type { PropertyDetailsApiResponse } from "@/services/propertyService";
import { PropertyDetailsHero } from "./PropertyDetailsHero";
import { PropertyHighlights } from "./PropertyHighlights";
import { PropertyOverview } from "./PropertyOverview";
import { PropertyAmenities } from "./PropertyAmenities";
import { PropertyInsightsSidebar } from "./PropertyInsightsSidebar";
import { PropertyNeighborhood } from "./PropertyNeighborhood";
import { PropertyDetailsPriceCard } from "./PropertyDetailsPriceCard";
import { PropertyDetailsTabBar } from "./PropertyDetailsTabBar";
import { PropertyVirtualTour } from "./PropertyVirtualTour";
import { LoadingScreen } from "@/components/ui/loading-screen";
import type { DetailedProperty, PropertyStat } from "./types";
import type { PropertyDetailsTabKey } from "./PropertyDetailsTabBar";
import { useBackendTranslation } from "@/hooks/useBackendTranslation";

export interface PropertyDetailsMainProps {
  language: AppLocale;
  /** Property ID from route (e.g. "1", "2"). */
  propertyId?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop";
type BackendLocalizedField =
  | string
  | Record<string, string | null | undefined>
  | null
  | undefined;
type BackendTranslateFn = (
  field: BackendLocalizedField,
  fallback?: string,
) => string;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    value,
  );
}

function formatPrice(item: PropertyDetailsApiResponse): string {
  if (item.selling_price_amount != null) {
    const currency = item.selling_price_currency ?? "JD";
    return `${formatNumber(item.selling_price_amount)} ${currency}`;
  }
  if (item.rent_price_amount != null) {
    const currency = item.rent_price_currency ?? "JD";
    return `${formatNumber(item.rent_price_amount)} ${currency}`;
  }
  return "Price on request";
}

function toAmenityText(
  value: unknown,
  tBackend: BackendTranslateFn,
): string | null {
  if (typeof value === "string") {
    const text = value.trim();
    return text ? text : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value && typeof value === "object") {
    const asRecord = value as Record<string, unknown>;
    const localized = tBackend(
      asRecord as Record<string, string | null | undefined>,
    );
    if (localized.trim()) {
      return localized.trim();
    }
    for (const key of ["name", "label", "title", "value"]) {
      const candidate = asRecord[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }
  return null;
}

function toAmenityEntries(
  value: unknown,
  tBackend: BackendTranslateFn,
): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, raw]) => {
        const val = toAmenityText(raw, tBackend);
        if (!val) return [key];
        return [`${key}: ${val}`];
      },
    );
  }
  return [];
}

function extractAmenities(
  item: PropertyDetailsApiResponse,
  tBackend: BackendTranslateFn,
): string[] {
  const all = [
    ...toAmenityEntries(item.features, tBackend),
    ...toAmenityEntries(item.more_features, tBackend),
  ]
    .map((entry) => toAmenityText(entry, tBackend))
    .filter((text): text is string => Boolean(text));
  return Array.from(new Set(all));
}

function extractGallery(item: PropertyDetailsApiResponse): string[] {
  if (Array.isArray(item.images) && item.images.length > 0) return item.images;

  const mediaImages = item.media?.images;
  if (Array.isArray(mediaImages)) {
    if (typeof mediaImages[0] === "string") {
      return (mediaImages as string[]).filter((img): img is string =>
        Boolean(img),
      );
    }

    return (
      mediaImages as Array<{ url?: string | null; thumb_url?: string | null }>
    )
      .map((img) => img.url || img.thumb_url || "")
      .filter((img): img is string => Boolean(img));
  }

  if (item.media?.thumbnail) return [item.media.thumbnail];
  return [FALLBACK_IMAGE];
}

function toDetailedProperty(
  item: PropertyDetailsApiResponse,
  tBackend: BackendTranslateFn,
): DetailedProperty {
  const gallery = extractGallery(item);
  const isRent =
    item.rent_price_amount != null && item.selling_price_amount == null;
  const locationObj =
    item.location && typeof item.location === "object"
      ? item.location
      : item.location_detail && typeof item.location_detail === "object"
        ? item.location_detail
        : null;
  const locationFromNested = locationObj?.address
    ? tBackend(locationObj.address)
    : "";
  const title = tBackend(item.title) || "Untitled Property";
  const description =
    tBackend(item.description)?.trim() || "No description available.";
  const location =
    locationFromNested || item.location_name || "Location unavailable";

  return {
    id: item.id,
    title,
    subtitle: item.category
      ? `${item.category} in ${location}`
      : "Property details",
    badge: isRent ? "For Rent" : "For Sale",
    image: gallery[0],
    location,
    price: formatPrice(item),
    beds: item.bedrooms ?? 0,
    baths: item.bathrooms ?? 0,
    area: item.built_up_area != null ? formatNumber(item.built_up_area) : "N/A",
    status: item.status ?? undefined,
    description,
    amenities: extractAmenities(item, tBackend),
    gallery,
    propertyType: item.category ?? "Property",
    media: item.media,
  };
}

function buildStats(item: PropertyDetailsApiResponse): PropertyStat[] {
  const stats: PropertyStat[] = [];

  if (item.category) {
    stats.push({
      label: "Category",
      value: item.category,
    });
  }
  if (item.status) {
    stats.push({
      label: "Listing status",
      value: item.status,
    });
  }
  if (item.latitude != null && item.longitude != null) {
    stats.push({
      label: "Coordinates",
      value: `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`,
    });
  }

  return stats;
}

export function PropertyDetailsMain({
  language,
  propertyId = "1",
}: PropertyDetailsMainProps) {
  const searchParams = useSearchParams();
  const isRtl = language === "ar";
  const { tBackend } = useBackendTranslation();
  const dispatch = useAppDispatch();
  const { item, loading, error, currentId } = useAppSelector(
    (state) => state.propertyDetails,
  );
  const [activeTab, setActiveTab] = useState<PropertyDetailsTabKey>("overview");

  const overviewRef = useRef<HTMLElement | null>(null);
  const amenitiesRef = useRef<HTMLElement | null>(null);
  const locationRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const virtualTourRef = useRef<HTMLElement | null>(null);
  const manualTabLockUntilRef = useRef(0);
  const manualTabTargetRef = useRef<PropertyDetailsTabKey | null>(null);
  const observerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const resolvedPropertyId = useMemo(() => {
    const parsed = Number.parseInt(propertyId, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [propertyId]);

  useEffect(() => {
    if (!resolvedPropertyId) return;
    if (currentId === resolvedPropertyId && item) return;
    void dispatch(fetchPropertyDetails(resolvedPropertyId));
  }, [currentId, dispatch, item, resolvedPropertyId]);

  const property = useMemo(
    () => (item ? toDetailedProperty(item, tBackend) : null),
    [item, tBackend],
  );
  const stats = useMemo(() => (item ? buildStats(item) : []), [item]);

  const exclusiveFromUrl =
    searchParams.get("exclusive") === "1" ||
    searchParams.get("exclusive") === "true";
  const isExclusiveByData = (item?.status ?? "").toLowerCase() === "exclusive";
  const isExclusive = exclusiveFromUrl || isExclusiveByData;

  const displayProperty = useMemo(() => {
    if (!property) return null;
    const isExclusiveByBadge = property.badge?.toLowerCase() === "exclusive";
    if (exclusiveFromUrl && !isExclusiveByBadge) {
      return {
        ...property,
        badge: "Exclusive",
        video: property.video ?? "/7578547-uhd_3840_2160_30fps.mp4",
      };
    }
    return property;
  }, [exclusiveFromUrl, property]);

  const hasVirtualTour = Boolean(
    item?.media?.virtual_tour_url ?? property?.virtualTourUrl ?? displayProperty?.virtualTourUrl,
  );

  const handleTabChange = (tab: PropertyDetailsTabKey) => {
    manualTabTargetRef.current = tab;
    manualTabLockUntilRef.current = Date.now() + 700;
    setActiveTab(tab);

    const map: Record<PropertyDetailsTabKey, HTMLElement | null | undefined> = {
      overview: overviewRef.current,
      amenities: amenitiesRef.current,
      location: locationRef.current,
      reviews: sidebarRef.current,
      virtualTour: virtualTourRef.current,
    };

    const target = map[tab];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const sections: Array<{
      key: PropertyDetailsTabKey;
      element: HTMLElement | null;
    }> = [
      { key: "overview", element: overviewRef.current },
      { key: "amenities", element: amenitiesRef.current },
      { key: "virtualTour", element: virtualTourRef.current },
      ...(isExclusive
        ? [{ key: "location" as const, element: locationRef.current }]
        : []),
    ];

    const observedSections = sections.filter(
      (
        section,
      ): section is { key: PropertyDetailsTabKey; element: HTMLElement } =>
        Boolean(section.element),
    );

    if (observedSections.length === 0) return;

    const stickyHeaderOffset = window.innerWidth >= 768 ? 170 : 140;
    const visibilityMap = new Map<PropertyDetailsTabKey, number>();

    const setMostVisibleSection = () => {
      if (
        Date.now() < manualTabLockUntilRef.current &&
        manualTabTargetRef.current
      ) {
        const lockedTab = manualTabTargetRef.current;
        setActiveTab((current) =>
          current === lockedTab ? current : lockedTab,
        );
        return;
      }

      let bestKey = observedSections[0].key;
      let bestRatio = -1;

      for (const section of observedSections) {
        const ratio = visibilityMap.get(section.key) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestKey = section.key;
        }
      }

      if (bestRatio > 0) {
        setActiveTab((current) => (current === bestKey ? current : bestKey));
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const matched = observedSections.find(
            (section) => section.element === entry.target,
          );
          if (!matched) continue;
          visibilityMap.set(
            matched.key,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        if (observerDebounceRef.current) {
          clearTimeout(observerDebounceRef.current);
        }
        observerDebounceRef.current = setTimeout(() => {
          setMostVisibleSection();
        }, 80);
      },
      {
        root: null,
        rootMargin: `-${stickyHeaderOffset}px 0px -40% 0px`,
        threshold: [0.15, 0.3, 0.5, 0.7],
      },
    );

    for (const section of observedSections) {
      visibilityMap.set(section.key, 0);
      observer.observe(section.element);
    }

    return () => {
      if (observerDebounceRef.current) {
        clearTimeout(observerDebounceRef.current);
      }
      observer.disconnect();
    };
  }, [isExclusive]);

  const displayTab: PropertyDetailsTabKey =
    (!isExclusive && activeTab === "location") || (!hasVirtualTour && activeTab === "virtualTour")
      ? "overview"
      : activeTab;

  if (!resolvedPropertyId) {
    return (
      <section className="container mx-auto px-4 py-10 text-sm text-red-700 md:px-8">
        Invalid property id.
      </section>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 md:px-8">
        <LoadingScreen
          title="Loading property details..."
          description="Please wait while we fetch property information."
        />
      </div>
    );
  }

  if (error && !displayProperty) {
    return (
      <section className="container mx-auto px-4 py-10 text-sm text-red-700 md:px-8">
        {error}
      </section>
    );
  }

  if (!displayProperty) {
    return (
      <section className="container mx-auto px-4 py-10 text-sm text-[var(--color-charcoal)]/70 md:px-8">
        Property not found.
      </section>
    );
  }

  return (
    <div
      className={`container mx-auto px-4 py-6 md:px-8 md:py-8 relative min-h-screen overflow-x-clip bg-gradient-to-b from-surface via-white to-surface text-charcoal ${
        isRtl ? "text-right" : "text-left"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[28rem] -right-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />

      <PropertyDetailsHero property={displayProperty} isRtl={isRtl} />

      <main className="relative z-10">
        <PropertyDetailsTabBar
          activeTab={displayTab}
          onTabChange={handleTabChange}
          isRtl={isRtl}
          showLocationTab={isExclusive}
          showVirtualTourTab={hasVirtualTour}
        />

        <div
          className={`mt-8 grid gap-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:mt-10 md:gap-8 ${
            isRtl ? "md:[direction:rtl]" : ""
          }`}
        >
          <section className="space-y-6 md:space-y-7">
            <section
              ref={overviewRef}
              className="scroll-mt-36 rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:scroll-mt-40 md:p-6"
            >
              <PropertyHighlights property={displayProperty} stats={stats} />
              <PropertyOverview property={displayProperty} />
            </section>

            <section
              ref={amenitiesRef}
              className="scroll-mt-36 rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:scroll-mt-40 md:p-6"
            >
              <PropertyAmenities amenities={displayProperty.amenities} />
            </section>

            {/* Separate virtual tour section under Features */}
            {displayProperty.virtualTourUrl && (
              <section
                ref={virtualTourRef}
                className="scroll-mt-36 rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:scroll-mt-40 md:p-6"
              >
                <PropertyVirtualTour property={displayProperty} />
              </section>
            )}
            {isExclusive && (
              <section
                ref={locationRef}
                className="scroll-mt-36 rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:scroll-mt-40 md:p-6"
              >
                <PropertyNeighborhood property={displayProperty} />
              </section>
            )}
          </section>

          <div
            ref={sidebarRef}
            className={`${isRtl ? "md:pl-0 md:pr-4" : "md:pl-4"} self-start md:sticky md:top-[124px]`}
          >
            <PropertyDetailsPriceCard price={displayProperty.price} />
            <PropertyInsightsSidebar
              listing={{
                id: displayProperty.id,
                title: displayProperty.title,
                brokerName: displayProperty.brokerName ?? "Abdoun Real Estate",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

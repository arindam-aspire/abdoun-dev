"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
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
import type { PropertyDetailsTabKey } from "./PropertyDetailsTabBar";
import { useBackendTranslation } from "@/hooks/useBackendTranslation";
import { toDetailedProperty } from "@/features/property-details/utils/propertyDetailsMapper";
import { mapPropertyStats } from "@/features/property-details/utils/statsMapper";
import { usePropertyDetails } from "@/features/property-details/hooks/usePropertyDetails";
import { usePropertyDetailsTabs } from "@/features/property-details/hooks/usePropertyDetailsTabs";

export interface PropertyDetailsMainProps {
  language: AppLocale;
  /** Property ID from route (e.g. "1", "2"). */
  propertyId?: string;
}

export function PropertyDetailsMain({
  language,
  propertyId = "1",
}: PropertyDetailsMainProps) {
  const searchParams = useSearchParams();
  const isRtl = language === "ar";
  const { tBackend } = useBackendTranslation();
  const { item, loading, error, resolvedPropertyId } = usePropertyDetails(propertyId);

  const property = useMemo(
    () => (item ? toDetailedProperty(item, tBackend) : null),
    [item, tBackend],
  );
  const stats = useMemo(() => (item ? mapPropertyStats(item) : []), [item]);

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

  const {
    displayTab,
    overviewRef,
    amenitiesRef,
    virtualTourRef,
    locationRef,
    sidebarRef,
    handleTabChange,
  } = usePropertyDetailsTabs({ isExclusive, hasVirtualTour });

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

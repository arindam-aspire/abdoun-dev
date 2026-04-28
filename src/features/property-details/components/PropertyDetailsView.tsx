"use client";

import { useSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import { PropertyDetailsHero } from "@/features/property-details/components/PropertyDetailsHero";
import { PropertyHighlights } from "@/features/property-details/components/PropertyHighlights";
import { PropertyOverview } from "@/features/property-details/components/PropertyOverview";
import { PropertyAmenities } from "@/features/property-details/components/PropertyAmenities";
import { PropertyNeighborhood } from "@/features/property-details/components/PropertyNeighborhood";
import { PropertyDetailsPriceCard } from "@/features/property-details/components/PropertyDetailsPriceCard";
import { PropertyInsightsSidebar } from "@/features/property-details/components/PropertyInsightsSidebar";
import { PropertyVirtualTour } from "@/features/property-details/components/PropertyVirtualTour";
import type { DetailedProperty, PropertyStat } from "@/features/property-details/types";

export type PropertyDetailsViewProps = {
  language: AppLocale;
  property: DetailedProperty;
  stats?: PropertyStat[];
  /**
   * Some existing pages toggle an “Exclusive” experience via `?exclusive=1`.
   * Keep it opt-in so admin flows don’t accidentally change based on URL params.
   */
  enableExclusiveFromUrl?: boolean;
};

export function PropertyDetailsView({
  language,
  property,
  stats = [],
  enableExclusiveFromUrl = false,
}: PropertyDetailsViewProps) {
  const searchParams = useSearchParams();
  const isRtl = language === "ar";

  const exclusiveFromUrl = enableExclusiveFromUrl && searchParams.get("exclusive") === "1";
  const isExclusiveByBadge = property.badge?.toLowerCase() === "exclusive";
  const isExclusive = exclusiveFromUrl || isExclusiveByBadge;

  const displayProperty: DetailedProperty =
    exclusiveFromUrl && !isExclusiveByBadge
      ? {
          ...property,
          badge: "Exclusive",
          video: property.video ?? "/7578547-uhd_3840_2160_30fps.mp4",
        }
      : property;

  const overview = {
    title: "Overview",
    description: [displayProperty.description],
    media: {
      video_label: "Property Video",
      platform: "YouTube",
      video_link: displayProperty.youtubeUrl ?? "",
    },
  };

  return (
    <div
      className={`relative min-h-screen overflow-x-clip bg-gradient-to-b from-surface via-white to-surface text-charcoal ${
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
        <div
          className={`mt-8 grid gap-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:mt-10 md:gap-8 ${
            isRtl ? "md:[direction:rtl]" : ""
          }`}
        >
          <section className="space-y-6 md:space-y-7">
            <section className="scroll-mt-36 md:scroll-mt-40">
              <PropertyHighlights property={displayProperty} stats={stats} />
              <PropertyOverview overview={overview} />
            </section>

            <section className="scroll-mt-36 md:scroll-mt-40">
              <PropertyAmenities amenities={displayProperty.amenities} />
              <PropertyVirtualTour property={displayProperty} />
            </section>

            {isExclusive && (
              <section className="scroll-mt-36 md:scroll-mt-40">
                <PropertyNeighborhood property={displayProperty} />
              </section>
            )}
          </section>

          <div
            className={`self-start md:sticky md:top-[124px] ${isRtl ? "md:pl-0 md:pr-4" : "md:pl-4"}`}
          >
            <PropertyDetailsPriceCard price={displayProperty.price} />
            <PropertyInsightsSidebar
              listing={{
                id: displayProperty.id,
                title: displayProperty.title,
                brokerName: displayProperty.brokerName ?? "Your agency",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}


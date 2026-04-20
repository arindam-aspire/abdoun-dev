"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import { PropertyDetailsHero } from "./PropertyDetailsHero";
import { PropertyHighlights } from "./PropertyHighlights";
import { PropertyOverview } from "./PropertyOverview";
import { PropertyAmenities } from "./PropertyAmenities";
import {
  PropertyDetailsDocumentsTab,
  type PropertyDocumentSection,
} from "./PropertyDetailsDocumentsTab";
import { PropertyInsightsSidebar } from "./PropertyInsightsSidebar";
import { PropertyNeighborhood } from "./PropertyNeighborhood";
import { PropertyDetailsPriceCard } from "./PropertyDetailsPriceCard";
import { PropertyDetailsTabBar } from "./PropertyDetailsTabBar";
import { LoadingScreen } from "@/components/ui/loading-screen";
import type { PropertyDetailsTabKey } from "./PropertyDetailsTabBar";
import { useBackendTranslation } from "@/hooks/useBackendTranslation";
import { useSession } from "@/features/auth/hooks/useSession";
import { toDetailedProperty } from "@/features/property-details/utils/propertyDetailsMapper";
import { mapPropertyStats } from "@/features/property-details/utils/statsMapper";
import { usePropertyDetails } from "@/features/property-details/hooks/usePropertyDetails";
import { usePropertyDetailsTabs } from "@/features/property-details/hooks/usePropertyDetailsTabs";
import { SimilarProperties } from "./SimilarProperties";
import { PropertyVirtualTour } from "./PropertyVirtualTour";

export interface PropertyDetailsMainProps {
  language: AppLocale;
  /** Property ID from route (e.g. "1", "2"). */
  propertyId?: string;
}

export function PropertyDetailsMain({
  language,
  propertyId = "1",
}: PropertyDetailsMainProps) {
  const dummyDocumentSections: PropertyDocumentSection[] = [
    {
      title: "Documents",
      items: [
        { id: "doc-1", name: "assets.zip", size: "5.3MB" },
        { id: "doc-2", name: "theprojekts-design-tokens.zip", size: "5.3MB" },
      ],
    },
    {
      title: "Social Security Documents",
      items: [
        { id: "doc-3", name: "assets.zip", size: "5.3MB" },
        { id: "doc-4", name: "assets.zip", size: "5.3MB" },
      ],
    },
  ];

  const tabPanelRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const isRtl = language === "ar";
  const { role } = useSession();
  const { tBackend } = useBackendTranslation();
  const { item, loading, error, resolvedPropertyId } = usePropertyDetails(propertyId);

  const property = useMemo(
    () => (item ? toDetailedProperty(item, tBackend) : null),
    [item, tBackend],
  );
  // const stats = useMemo(() => (item ? mapPropertyStats(item) : []), [item]);
  const stats = [
    {
      label: "Payment plan",
      value: "30/70",
      description: "Flexible handover terms available on request."
    },
    {
      label: "Service charge",
      value: "On request",
      description: "Estimated based on current building management rates."
    },
    {
      label: "Expected rental yield",
      value: "6.5% - 7.2%",
      description: "Industrial range based on comparable properties in Abdoun."
    }
  ]

  const overview = {
    "title": "Overview",
    "description": [
      "Experience elevated living in this sprawling eco-smart penthouse overlooking Abdoun and the Amman skyline. Thoughtfully crafted with double-height ceilings, floor-to-ceiling windows and a private rooftop plunge pool, The Azure Penthouse combines contemporary design with warm, natural finishes.",
      "A dedicated concierge lobby, direct lift access and three private parking bays ensure complete privacy and convenience for you and your guests."
    ],
    "media": {
      "video_label": "Watch property video on YouTube",
      "platform": "YouTube",
      "video_link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  }

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

  const isPrivilegedUser = role === "admin" || role === "agent";
  const canShowLocationTab = isExclusive || isPrivilegedUser;
  const canShowDocumentsTab = isPrivilegedUser;

  const { displayTab, handleTabChange } = usePropertyDetailsTabs({
    canShowLocationTab,
    canShowDocumentsTab,
  });

  useEffect(() => {
    const node = tabPanelRef.current;
    if (!node || typeof node.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const enterOffset = isRtl ? -18 : 18;
    node.animate(
      [
        { opacity: 0, transform: `translateX(${enterOffset}px)` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    );
  }, [displayTab, isRtl]);

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
          title="Loading property details"
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
      <section className="container mx-auto px-4 py-10 text-sm text-(--color-charcoal)/70 md:px-8">
        Property not found.
      </section>
    );
  }

  return (
    <div
      className={`container mx-auto px-4 py-6 md:px-8 md:py-8 relative min-h-screen overflow-x-clip bg-linear-to-b from-surface via-white to-surface text-charcoal ${
        isRtl ? "text-right" : "text-left"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-112 -right-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
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
          showLocationTab={canShowLocationTab}
          showDocumentsTab={canShowDocumentsTab}
        />

        <div
          className={`pt-8 grid gap-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8 ${
            isRtl ? "md:[direction:rtl]" : ""
          }`}
        >
          <section className="space-y-6 md:space-y-7">
            <div key={displayTab} ref={tabPanelRef}>
            {displayTab === "overview" && (
              <section
                // className="bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                className=""
              >
                <PropertyHighlights property={displayProperty} stats={stats} />
                <PropertyOverview overview={overview} />
                <PropertyVirtualTour property={displayProperty} />
              </section>
            )}

            {displayTab === "amenities" && (
              <section
                className="rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6"
              >
                <PropertyAmenities amenities={displayProperty.amenities} />
              </section>
            )}

            {displayTab === "location" && (
              canShowLocationTab ? (
                <section className="rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
                  <PropertyNeighborhood property={displayProperty} />
                </section>
              ) : (
                <section className="rounded-2xl border border-subtle bg-white/95 p-5 text-sm text-(--color-charcoal)/70 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
                  Location details are available for exclusive listings.
                </section>
              )
            )}

            {displayTab === "documents" && canShowDocumentsTab && (
              <PropertyDetailsDocumentsTab sections={dummyDocumentSections} />
            )}
            </div>
          </section>

          <div
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
      <SimilarProperties />
    </div>
  );
}

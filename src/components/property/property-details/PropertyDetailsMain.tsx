"use client";

import { useEffect, useRef, useState } from "react";
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
import type { DetailedProperty, PropertyStat } from "./types";
import type { PropertyDetailsTabKey } from "./PropertyDetailsTabBar";

export interface PropertyDetailsMainProps {
  language: AppLocale;
  /** Property ID from route (e.g. "1", "2"). Used to pick mock data. */
  propertyId?: string;
}

const MOCK_DETAILED_PROPERTY_EXCLUSIVE: DetailedProperty = {
  id: 1,
  title: "The Azure Penthouse",
  subtitle: "Skyline-facing 4-bedroom penthouse with private terrace",
  badge: "Exclusive",
  image:
    "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop",
  location: "Abdoun, Amman · West Amman skyline",
  latitude:31.9880592,
  longitude:35.8113021,
  video: "/7578547-uhd_3840_2160_30fps.mp4",
  youtubeUrl: "https://www.youtube.com/watch?v=IG7Jrgl9h1o",
  virtualTourUrl: "https://www.youtube.com/embed/otYbvFPA5MI",
  price: "1,250,000 JD",
  beds: 4,
  baths: 5,
  area: "8,500",
  orientation: "North",
  floor: "Full-floor penthouse",
  status: "Ready to move · Vacant on transfer",
  description:
    "Experience elevated living in this sprawling eco-smart penthouse overlooking Abdoun and the Amman skyline. Thoughtfully crafted with double-height ceilings, floor-to-ceiling windows and a private rooftop plunge pool, The Azure Penthouse combines contemporary design with warm, natural finishes. A dedicated concierge lobby, direct lift access and three private parking bays ensure complete privacy and convenience for you and your guests.",
  amenities: [
    "Private rooftop plunge pool",
    "Dual living & dining lounges",
    "Chef's show kitchen & prep kitchen",
    "Panoramic floor-to-ceiling windows",
    "Smart home climate & lighting",
    "En-suite bedrooms with walk-in wardrobes",
    "Private study / library corner",
    "Dedicated maid's room with service entrance",
    "Three allocated parking bays",
    "Residents' indoor fitness studio",
    "Lobby concierge & 24/7 security",
    "Proximity to international schools & embassies",
  ],
  brokerName: "Abdoun Real Estate",
  gallery: [
    "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1800&auto=format&fit=crop",
  ],
  propertyType: "Penthouse",
};

const MOCK_DETAILED_PROPERTY_STANDARD: DetailedProperty = {
  id: 2,
  title: "Sunrise Gardens Villa",
  subtitle: "Family villa with garden and pool in a quiet compound",
  badge: "For Sale",
  image:
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1800&auto=format&fit=crop",
  location: "Dabouq, Amman",
  video: "/7578547-uhd_3840_2160_30fps.mp4",
  youtubeUrl: "https://www.youtube.com/watch?v=IG7Jrgl9h1o",
  virtualTourUrl: "https://my.matterport.com/show/?m=xxeWJqmc5zf",
  price: "685,000 JD",
  beds: 5,
  baths: 4,
  area: "6,200",
  orientation: "East",
  floor: "Ground + 1",
  status: "Ready to move",
  description:
    "A spacious family villa set in a gated compound with landscaped gardens and a private pool. Ideal for families seeking space and privacy, with a large living area, modern kitchen, and multiple terraces.",
  amenities: [
    "Private rooftop plunge pool",
    "Dual living & dining lounges",
    "Chef's show kitchen & prep kitchen",
    "Panoramic floor-to-ceiling windows",
    "Smart home climate & lighting",
    "En-suite bedrooms with walk-in wardrobes",
    "Private study / library corner",
    "Dedicated maid's room with service entrance",
    "Three allocated parking bays",
    "Residents' indoor fitness studio",
    "Lobby concierge & 24/7 security",
    "Proximity to international schools & embassies",
  ],
  brokerName: "Abdoun Real Estate",
  gallery: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1800&auto=format&fit=crop",
  ],
  propertyType: "Penthouse",
};

const MOCK_DETAILED_PROPERTY_EXCLUSIVE_2: DetailedProperty = {
  id: 3,
  title: "Abdoun Skyline Residence",
  subtitle: "Panoramic views and premium finish in Abdoun",
  badge: "Exclusive",
  image:
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1800&auto=format&fit=crop",
  location: "Abdoun, Amman",
  video: "/7578547-uhd_3840_2160_30fps.mp4",
  price: "2,100,000 JD",
  beds: 4,
  baths: 4,
  area: "5,200",
  orientation: "South",
  floor: "High floor",
  status: "Q2 2025",
  description:
    "An exclusive high-rise residence with panoramic Amman views, premium finishes, and direct access to Abdoun's best amenities. Ideal for investors and families seeking a turnkey luxury lifestyle.",
  amenities: [
    "Private rooftop plunge pool",
    "Dual living & dining lounges",
    "Chef's show kitchen & prep kitchen",
    "Panoramic floor-to-ceiling windows",
    "Smart home climate & lighting",
    "En-suite bedrooms with walk-in wardrobes",
    "Private study / library corner",
    "Dedicated maid's room with service entrance",
    "Three allocated parking bays",
    "Residents' indoor fitness studio",
    "Lobby concierge & 24/7 security",
    "Proximity to international schools & embassies",
  ],
  brokerName: "Abdoun Real Estate",
  gallery: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1800&auto=format&fit=crop",
  ],
  propertyType: "Penthouse",
  virtualTourUrl: "https://my.matterport.com/show/?m=xxeWJqmc5zf",
};

const MOCK_DETAILED_PROPERTIES: Record<string, DetailedProperty> = {
  "1": MOCK_DETAILED_PROPERTY_EXCLUSIVE,
  "2": MOCK_DETAILED_PROPERTY_STANDARD,
  "3": MOCK_DETAILED_PROPERTY_EXCLUSIVE_2,
};

function getPropertyById(id: string): DetailedProperty {
  const found = MOCK_DETAILED_PROPERTIES[id];
  if (found) return found;
  return MOCK_DETAILED_PROPERTY_STANDARD;
}

const MOCK_STATS: PropertyStat[] = [
  {
    label: "Payment plan",
    value: "30 / 70",
    helper: "Flexible handover terms available on request.",
  },
  {
    label: "Service charge",
    value: "On request",
    helper: "Estimated based on current building management rates.",
  },
  {
    label: "Expected rental yield",
    value: "6.5% - 7.2%",
    helper: "Indicative range based on comparable properties in Abdoun.",
  },
];

export function PropertyDetailsMain({ language, propertyId = "1" }: PropertyDetailsMainProps) {
  const searchParams = useSearchParams();
  const isRtl = language === "ar";
  const property = getPropertyById(propertyId);
  const exclusiveFromUrl = searchParams.get("exclusive") === "1";
  const isExclusiveByBadge = property.badge?.toLowerCase() === "exclusive";
  const isExclusive = exclusiveFromUrl || isExclusiveByBadge;

  const displayProperty =
    exclusiveFromUrl && !isExclusiveByBadge
      ? { ...property, badge: "Exclusive" as const, video: property.video ?? "/7578547-uhd_3840_2160_30fps.mp4" }
      : property;

  const [activeTab, setActiveTab] = useState<PropertyDetailsTabKey>("overview");

  const overviewRef = useRef<HTMLElement | null>(null);
  const amenitiesRef = useRef<HTMLElement | null>(null);
  const locationRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const virtualTourRef = useRef<HTMLElement | null>(null);
  const manualTabLockUntilRef = useRef(0);
  const manualTabTargetRef = useRef<PropertyDetailsTabKey | null>(null);
  const observerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const sections: Array<{ key: PropertyDetailsTabKey; element: HTMLElement | null }> = [
      { key: "overview", element: overviewRef.current },
      { key: "amenities", element: amenitiesRef.current },
      { key: "virtualTour", element: virtualTourRef.current },
      ...(isExclusive ? [{ key: "location" as const, element: locationRef.current }] : []),
    ];

    const observedSections = sections.filter(
      (section): section is { key: PropertyDetailsTabKey; element: HTMLElement } => Boolean(section.element)
    );

    if (observedSections.length === 0) return;

    const stickyHeaderOffset = window.innerWidth >= 768 ? 170 : 140;
    const visibilityMap = new Map<PropertyDetailsTabKey, number>();

    const setMostVisibleSection = () => {
      if (Date.now() < manualTabLockUntilRef.current && manualTabTargetRef.current) {
        const lockedTab = manualTabTargetRef.current;
        setActiveTab((current) => (current === lockedTab ? current : lockedTab));
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
          const matched = observedSections.find((section) => section.element === entry.target);
          if (!matched) continue;
          visibilityMap.set(matched.key, entry.isIntersecting ? entry.intersectionRatio : 0);
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
      }
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
    !isExclusive && activeTab === "location" ? "overview" : activeTab;

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
              <PropertyHighlights
                property={displayProperty}
                stats={MOCK_STATS}
              />
              <PropertyOverview property={displayProperty} />
            </section>

            <section
              ref={amenitiesRef}
              className="scroll-mt-36 rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:scroll-mt-40 md:p-6"
            >
              <PropertyAmenities amenities={displayProperty.amenities} />
            </section>

            {/* Separate virtual tour section under Features */}
            <section ref={virtualTourRef} className="scroll-mt-36 rounded-2xl border border-subtle bg-white/95 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:scroll-mt-40 md:p-6">
              <PropertyVirtualTour property={displayProperty} />
            </section>
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




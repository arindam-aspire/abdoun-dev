"use client";

import { useRef, useState } from "react";
import type { AppLocale } from "@/i18n/routing";
import { PropertyDetailsHero } from "./PropertyDetailsHero";
import { PropertyHighlights } from "./PropertyHighlights";
import { PropertyOverview } from "./PropertyOverview";
import { PropertyAmenities } from "./PropertyAmenities";
import { PropertyInsightsSidebar } from "./PropertyInsightsSidebar";
import { PropertyNeighborhood } from "./PropertyNeighborhood";
import { PropertyDetailsPriceCard } from "./PropertyDetailsPriceCard";
import { PropertyDetailsTabBar } from "./PropertyDetailsTabBar";
import type { DetailedProperty, PropertyStat } from "./types";
import type { PropertyDetailsTabKey } from "./PropertyDetailsTabBar";

export interface PropertyDetailsMainProps {
  language: AppLocale;
}

const MOCK_DETAILED_PROPERTY: DetailedProperty = {
  id: 1,
  title: "The Azure Penthouse",
  subtitle: "Skyline-facing 4-bedroom penthouse with private terrace",
  badge: "Exclusive",
  image:
    "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop",
  location: "Abdoun, Amman · West Amman skyline",
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
  gallery: [
    "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1800&auto=format&fit=crop",
    // "https://images.unsplash.com/photo-1616594039964-3f516d8e6ddb?q=80&w=1800&auto=format&fit=crop",
  ],
};

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

export function PropertyDetailsMain({ language }: PropertyDetailsMainProps) {
  const isRtl = language === "ar";
  const [activeTab, setActiveTab] = useState<PropertyDetailsTabKey>("overview");

  const overviewRef = useRef<HTMLElement | null>(null);
  const amenitiesRef = useRef<HTMLElement | null>(null);
  const locationRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const handleTabChange = (tab: PropertyDetailsTabKey) => {
    setActiveTab(tab);

    const map: Record<PropertyDetailsTabKey, HTMLElement | null | undefined> = {
      overview: overviewRef.current,
      amenities: amenitiesRef.current,
      location: locationRef.current,
      reviews: sidebarRef.current,
    };

    const target = map[tab];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className={`relative min-h-screen overflow-x-clip bg-gradient-to-b from-[var(--surface)] via-white to-[var(--surface)] text-[var(--color-charcoal)] ${
        isRtl ? "text-right" : "text-left"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[var(--brand-primary)]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[28rem] -right-20 h-56 w-56 rounded-full bg-[var(--brand-secondary)]/10 blur-3xl"
      />

      <PropertyDetailsHero property={MOCK_DETAILED_PROPERTY} isRtl={isRtl} />

      <main className="relative z-10 mx-auto container px-4 pb-14 md:px-8 md:pb-20">
        <PropertyDetailsTabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isRtl={isRtl}
        />

        <div
          className={`mt-8 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-7 ${
            isRtl ? "md:[direction:rtl]" : ""
          }`}
        >
          <section className="space-y-5">
            <section ref={overviewRef} className="scroll-mt-36">
              <PropertyHighlights
                property={MOCK_DETAILED_PROPERTY}
                stats={MOCK_STATS}
              />
              <PropertyOverview property={MOCK_DETAILED_PROPERTY} />
            </section>

            <section ref={amenitiesRef} className="scroll-mt-36">
              <PropertyAmenities amenities={MOCK_DETAILED_PROPERTY.amenities} />
            </section>

            <section ref={locationRef} className="scroll-mt-36">
              <PropertyNeighborhood />
            </section>
          </section>

          <div
            ref={sidebarRef}
            className={`${isRtl ? "md:pl-0 md:pr-4" : "md:pl-4"} md:sticky md:top-[148px] self-start`}
          >
            <PropertyDetailsPriceCard price={MOCK_DETAILED_PROPERTY.price} />
            <PropertyInsightsSidebar />
          </div>
        </div>
      </main>

    </div>
  );
}

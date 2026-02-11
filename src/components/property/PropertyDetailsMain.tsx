"use client";

import { Info, Map, Sparkles, Star } from "lucide-react";
import { useRef, useState } from "react";
import type { LanguageCode } from "@/lib/i18n";
import { homeTranslations } from "@/lib/i18n";
import { PropertyDetailsHero } from "./PropertyDetailsHero";
import { PropertyHighlights } from "./PropertyHighlights";
import { PropertyOverview } from "./PropertyOverview";
import { PropertyAmenities } from "./PropertyAmenities";
import { PropertyInsightsSidebar } from "./PropertyInsightsSidebar";
import { PropertyNeighborhood } from "./PropertyNeighborhood";
import type { DetailedProperty, PropertyStat } from "./types";

export interface PropertyDetailsMainProps {
  language: LanguageCode;
}

const MOCK_DETAILED_PROPERTY: DetailedProperty = {
  id: 1,
  title: "The Azure Penthouse",
  subtitle: "Skyline-facing 4-bedroom penthouse with private terrace",
  badge: "Exclusive",
  image:
    "https://images.unsplash.com/photo-1743486780771-afd09eea3624?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0",
  location: "Abdoun, Amman · West Amman skyline",
  price: "$1,250,000",
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
    "Chef’s show kitchen & prep kitchen",
    "Panoramic floor-to-ceiling windows",
    "Smart home climate & lighting",
    "En-suite bedrooms with walk-in wardrobes",
    "Private study / library corner",
    "Dedicated maid’s room with service entrance",
    "Three allocated parking bays",
    "Residents’ indoor fitness studio",
    "Lobby concierge & 24/7 security",
    "Proximity to international schools & embassies",
  ],
  gallery: [
    "https://images.unsplash.com/photo-1743486780771-afd09eea3624?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.unsplash.com/photo-1743486780771-afd09eea3624?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1743486780771-afd09eea3624?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1743486780771-afd09eea3624?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1743486780771-afd09eea3624?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0",
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
  const t = homeTranslations[language];
  const [activeTab, setActiveTab] = useState<
    "overview" | "amenities" | "location" | "reviews"
  >("overview");

  const overviewRef = useRef<HTMLElement | null>(null);
  const amenitiesRef = useRef<HTMLElement | null>(null);
  const locationRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);

    const map: Record<typeof activeTab, HTMLElement | null | undefined> = {
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
      className={`min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900 ${
        isRtl ? "text-right" : "text-left"
      }`}
    >
      <PropertyDetailsHero property={MOCK_DETAILED_PROPERTY} />

      <main className="mx-auto container px-4 pb-12 md:px-8 md:pb-16">
        {/* Sticky tab bar under header */}
        <div className="sticky top-[72px] z-20 -mx-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:top-[73px] md:-mx-8 md:px-8">
          <div className="flex justify-center md:justify-start">
            <div
              className={`inline-flex items-center gap-1 rounded-full bg-white p-1 text-[11px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/80 ${
                isRtl ? "flex-row-reverse" : ""
              }`}
            >
              {[
                {
                  key: "overview",
                  label: t.propertyTabs.overview,
                  icon: <Info className="h-3.5 w-3.5" />,
                },
                {
                  key: "amenities",
                  label: t.propertyTabs.amenities,
                  icon: <Sparkles className="h-3.5 w-3.5" />,
                },
                {
                  key: "location",
                  label: t.propertyTabs.location,
                  icon: <Map className="h-3.5 w-3.5" />,
                },
                {
                  key: "reviews",
                  label: t.propertyTabs.reviews,
                  icon: <Star className="h-3.5 w-3.5" />,
                },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabClick(tab.key as typeof activeTab)}
                  className={`flex items-center gap-1 rounded-full px-3 py-2 cursor-pointer transition ${
                      isActive
                        ? "bg-sky-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`${
                        isActive ? "text-white" : "text-sky-500"
                      } hidden xs:inline-flex`}
                    >
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={`mt-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] ${
            isRtl ? "md:[direction:rtl]" : ""
          }`}
        >
          <section className="space-y-0">
            <section ref={overviewRef}>
              <PropertyHighlights
                property={MOCK_DETAILED_PROPERTY}
                stats={MOCK_STATS}
              />
              <PropertyOverview property={MOCK_DETAILED_PROPERTY} />
            </section>

            <section ref={amenitiesRef}>
              <PropertyAmenities amenities={MOCK_DETAILED_PROPERTY.amenities} />
            </section>

            <section ref={locationRef}>
              <PropertyNeighborhood />
            </section>
          </section>

          <div
            ref={sidebarRef}
            className={isRtl ? "md:pl-0 md:pr-4" : "md:pl-4"}
          >
            {/* Price / actions moved below hero into right column */}
            <div className="mb-4 rounded-2xl bg-white p-4 text-slate-900 shadow-sm ring-1 ring-slate-200 md:text-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Asking price
              </p>
              <p className="mt-1 text-2xl font-semibold text-sky-600 md:text-3xl">
                {MOCK_DETAILED_PROPERTY.price}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Service charge on request. Flexible viewing times.
              </p>
              <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  Book private tour
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-sky-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Download brochure
                </button>
              </div>
            </div>

            <PropertyInsightsSidebar />
          </div>
        </div>
      </main>

    </div>
  );
}


"use client";

import { useRef, useState, useEffect } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import { PropertyDetailsHero } from "@/components/property/property-details/PropertyDetailsHero";
import { PropertyHighlights } from "@/components/property/property-details/PropertyHighlights";
import { PropertyOverview } from "@/components/property/property-details/PropertyOverview";
import { PropertyAmenities } from "@/components/property/property-details/PropertyAmenities";
import { PropertyInsightsSidebar } from "@/components/property/property-details/PropertyInsightsSidebar";
import { PropertyNeighborhood } from "@/components/property/property-details/PropertyNeighborhood";
import { PropertyDetailsPriceCard } from "@/components/property/property-details/PropertyDetailsPriceCard";
import { PropertyVirtualTour } from "@/components/property/property-details/PropertyVirtualTour";
import { AdminPropertyDetailsTabBar } from "./AdminPropertyDetailsTabBar";
import { AdminPropertyDocuments } from "./AdminPropertyDocuments";
import type { AdminPropertyDetailsTabKey } from "./AdminPropertyDetailsTabBar";
import type { DetailedProperty, PropertyStat } from "@/components/property/property-details/types";

export interface AdminPropertyDetailsMainProps {
  language: AppLocale;
  propertyId?: string;
}

function AdminHeroActions({ isRtl }: { isRtl: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm ring-1 ring-subtle hover:bg-white cursor-pointer"
        aria-label="Property actions"
      >
        <MoreVertical className="h-6 w-6" />
      </button>
      {menuOpen && (
        <div
          className={`absolute top-13 z-50 min-w-[140px] rounded-lg border border-subtle bg-white py-1 shadow-xl ${
            isRtl ? "left-0" : "right-0"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-size-sm text-charcoal hover:bg-surface cursor-pointer transition"
          >
            <Pencil className="h-4 w-4 text-charcoal/60" />
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-size-sm text-red-600 hover:bg-red-50 cursor-pointer transition"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Mock data (same as user side) ── */

const MOCK_DETAILED_PROPERTY_EXCLUSIVE: DetailedProperty = {
  id: 1,
  title: "The Azure Penthouse",
  subtitle: "Skyline-facing 4-bedroom penthouse with private terrace",
  badge: "Exclusive",
  image:
    "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop",
  location: "Abdoun, Amman · West Amman skyline",
  video: "/7578547-uhd_3840_2160_30fps.mp4",
  youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  virtualTourUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
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
  youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  virtualTourUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
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
  virtualTourUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
};

const MOCK_DETAILED_PROPERTIES: Record<string, DetailedProperty> = {
  "1": MOCK_DETAILED_PROPERTY_EXCLUSIVE,
  "2": MOCK_DETAILED_PROPERTY_STANDARD,
  "3": MOCK_DETAILED_PROPERTY_EXCLUSIVE_2,
};

function getPropertyById(id: string): DetailedProperty {
  return MOCK_DETAILED_PROPERTIES[id] ?? MOCK_DETAILED_PROPERTY_STANDARD;
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

export function AdminPropertyDetailsMain({
  language,
  propertyId = "1",
}: AdminPropertyDetailsMainProps) {
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

  const [activeTab, setActiveTab] = useState<AdminPropertyDetailsTabKey>("overview");

  const overviewRef = useRef<HTMLElement | null>(null);
  const amenitiesRef = useRef<HTMLElement | null>(null);
  const locationRef = useRef<HTMLElement | null>(null);
  const documentsRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const handleTabChange = (tab: AdminPropertyDetailsTabKey) => {
    setActiveTab(tab);

    const map: Record<AdminPropertyDetailsTabKey, HTMLElement | null | undefined> = {
      overview: overviewRef.current,
      amenities: amenitiesRef.current,
      location: locationRef.current,
      documents: documentsRef.current,
    };

    const target = map[tab];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const displayTab: AdminPropertyDetailsTabKey =
    !isExclusive && activeTab === "location" ? "overview" : activeTab;

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

      <PropertyDetailsHero 
        property={displayProperty} 
        isRtl={isRtl} 
        customActions={<AdminHeroActions isRtl={isRtl} />}
      />

      <main className="relative z-10">
        <AdminPropertyDetailsTabBar
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
            <section ref={overviewRef} className="scroll-mt-36 md:scroll-mt-40">
              <PropertyHighlights
                property={displayProperty}
                stats={MOCK_STATS}
              />
              <PropertyOverview property={displayProperty} />
            </section>

            <section ref={amenitiesRef} className="scroll-mt-36 md:scroll-mt-40">
              <PropertyAmenities amenities={displayProperty.amenities} />
              <PropertyVirtualTour property={displayProperty} />
            </section>

            {isExclusive && (
              <section ref={locationRef} className="scroll-mt-36 md:scroll-mt-40">
                <PropertyNeighborhood property={displayProperty} />
              </section>
            )}

            {/* Admin-only Documents section */}
            <section ref={documentsRef} className="scroll-mt-36 md:scroll-mt-40">
              <AdminPropertyDocuments />
            </section>
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

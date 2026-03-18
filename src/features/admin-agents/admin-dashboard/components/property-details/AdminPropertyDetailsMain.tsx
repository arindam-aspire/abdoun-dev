"use client";

import { useRef, useState, useEffect } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import { PropertyDetailsHero } from "@/features/property-details/components/PropertyDetailsHero";
import { PropertyHighlights } from "@/features/property-details/components/PropertyHighlights";
import { PropertyOverview } from "@/features/property-details/components/PropertyOverview";
import { PropertyAmenities } from "@/features/property-details/components/PropertyAmenities";
import { PropertyInsightsSidebar } from "@/features/property-details/components/PropertyInsightsSidebar";
import { PropertyNeighborhood } from "@/features/property-details/components/PropertyNeighborhood";
import { PropertyDetailsPriceCard } from "@/features/property-details/components/PropertyDetailsPriceCard";
import { PropertyVirtualTour } from "@/features/property-details/components/PropertyVirtualTour";
import { AdminPropertyDetailsTabBar } from "./AdminPropertyDetailsTabBar";
import { AdminPropertyDocuments } from "./AdminPropertyDocuments";
import type { AdminPropertyDetailsTabKey } from "./AdminPropertyDetailsTabBar";
import type { DetailedProperty, PropertyStat } from "@/features/property-details/types";

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
  ],
  brokerName: "Abdoun Realty",
  gallery: [
    "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-0ef3c08c0632?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1800&auto=format&fit=crop",
  ],
  propertyType: "Penthouse",
};

const MOCK_ADMIN_STATS: PropertyStat[] = [
  { label: "Minimum contract", value: "12 months" },
  { label: "Deposit", value: "2 months" },
  { label: "Brokerage fee", value: "One month rent" },
];

export function AdminPropertyDetailsMain({ language, propertyId }: AdminPropertyDetailsMainProps) {
  const searchParams = useSearchParams();
  const isRtl = language === "ar";
  const [activeTab, setActiveTab] = useState<AdminPropertyDetailsTabKey>("overview");

  const exclusiveFromUrl = searchParams.get("exclusive") === "1";
  const baseProperty = MOCK_DETAILED_PROPERTY_EXCLUSIVE;
  const isExclusiveByBadge = baseProperty.badge?.toLowerCase() === "exclusive";
  const isExclusive = exclusiveFromUrl || isExclusiveByBadge;

  const displayProperty: DetailedProperty =
    exclusiveFromUrl && !isExclusiveByBadge
      ? { ...baseProperty, badge: "Exclusive", video: baseProperty.video ?? "/7578547-uhd_3840_2160_30fps.mp4" }
      : baseProperty;

  void propertyId;

  return (
    <div
      className={`relative min-h-screen overflow-x-clip bg-gradient-to-b from-surface via-white to-surface text-charcoal ${
        isRtl ? "text-right" : "text-left"
      }`}
    >
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-[28rem] -right-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative">
        <PropertyDetailsHero property={displayProperty} isRtl={isRtl} />
        <div className={`absolute top-5 ${isRtl ? "left-5" : "right-5"}`}>
          <AdminHeroActions isRtl={isRtl} />
        </div>
      </div>

      <AdminPropertyDetailsTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isRtl={isRtl}
        showLocationTab={isExclusive}
      />

      <main className="relative z-10">
        <div
          className={`mt-6 grid gap-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:mt-8 md:gap-8 ${
            isRtl ? "md:[direction:rtl]" : ""
          }`}
        >
          <section className="space-y-6 md:space-y-7">
            {activeTab === "overview" ? (
              <section className="scroll-mt-36 md:scroll-mt-40">
                <PropertyHighlights property={displayProperty} stats={MOCK_ADMIN_STATS} />
                <PropertyOverview property={displayProperty} />
              </section>
            ) : null}

            {activeTab === "amenities" ? (
              <section className="scroll-mt-36 md:scroll-mt-40">
                <PropertyAmenities amenities={displayProperty.amenities} />
                <PropertyVirtualTour property={displayProperty} />
              </section>
            ) : null}

            {activeTab === "location" && isExclusive ? (
              <section className="scroll-mt-36 md:scroll-mt-40">
                <PropertyNeighborhood property={displayProperty} />
              </section>
            ) : null}

            {activeTab === "documents" ? (
              <section className="scroll-mt-36 md:scroll-mt-40">
                <AdminPropertyDocuments />
              </section>
            ) : null}
          </section>

          <div className={`self-start md:sticky md:top-[124px] ${isRtl ? "md:pl-0 md:pr-4" : "md:pl-4"}`}>
            <PropertyDetailsPriceCard price={displayProperty.price} />
            <PropertyInsightsSidebar
              listing={{
                id: displayProperty.id,
                title: displayProperty.title,
                brokerName: displayProperty.brokerName ?? "Abdoun Realty",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}


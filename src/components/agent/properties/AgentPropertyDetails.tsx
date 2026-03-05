"use client";

import { useSearchParams } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  PropertyDetailsHero,
} from "@/components/property/property-details/PropertyDetailsHero";
import {
  PropertyHighlights,
} from "@/components/property/property-details/PropertyHighlights";
import {
  PropertyOverview,
} from "@/components/property/property-details/PropertyOverview";
import {
  PropertyAmenities,
} from "@/components/property/property-details/PropertyAmenities";
import {
  PropertyNeighborhood,
} from "@/components/property/property-details/PropertyNeighborhood";
import {
  PropertyDetailsPriceCard,
} from "@/components/property/property-details/PropertyDetailsPriceCard";
import {
  PropertyInsightsSidebar,
} from "@/components/property/property-details/PropertyInsightsSidebar";
import type {
  DetailedProperty,
  PropertyStat,
} from "@/components/property/property-details/types";

export interface AgentPropertyDetailsProps {
  language: AppLocale;
  propertyId?: string;
}

export const MOCK_AGENT_PROPERTY: DetailedProperty = {
  id: 101,
  title: "Agent Listing · Abdoun Terrace Residence",
  subtitle: "Bright 3-bedroom apartment with open-plan living and balcony",
  badge: "For Rent",
  image:
    "https://images.unsplash.com/photo-1600585154340-0ef3c08c0632?q=80&w=1800&auto=format&fit=crop",
  location: "Abdoun, Amman",
  video: "/7578547-uhd_3840_2160_30fps.mp4",
  youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  price: "1,600 JD / month",
  beds: 3,
  baths: 3,
  area: "2,100",
  orientation: "West",
  floor: "4th floor",
  status: "Ready to move",
  description:
    "Well-maintained apartment ideal for families or professionals. Features open-plan living and dining, a modern kitchen, and a covered balcony overlooking a quiet street in Abdoun.",
  amenities: [
    "Open-plan living and dining",
    "Fitted kitchen with appliances",
    "Built-in wardrobes",
    "Covered balcony",
    "Allocated parking space",
    "Elevator access",
  ],
  brokerName: "Your agency",
  gallery: [
    "https://images.unsplash.com/photo-1600585154340-0ef3c08c0632?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1800&auto=format&fit=crop",
  ],
  propertyType: "Apartment",
};

export const MOCK_AGENT_STATS: PropertyStat[] = [
  {
    label: "Minimum contract",
    value: "12 months",
  },
  {
    label: "Deposit",
    value: "2 months",
  },
  {
    label: "Brokerage fee",
    value: "One month rent",
  },
];

export function AgentPropertyDetails({
  language,
  propertyId,
}: AgentPropertyDetailsProps) {
  const searchParams = useSearchParams();
  const isRtl = language === "ar";

  const exclusiveFromUrl = searchParams.get("exclusive") === "1";
  const baseProperty = MOCK_AGENT_PROPERTY;
  const isExclusiveByBadge =
    baseProperty.badge?.toLowerCase() === "exclusive";
  const isExclusive = exclusiveFromUrl || isExclusiveByBadge;

  const displayProperty: DetailedProperty =
    exclusiveFromUrl && !isExclusiveByBadge
      ? {
          ...baseProperty,
          badge: "Exclusive",
          video:
            baseProperty.video ??
            "/7578547-uhd_3840_2160_30fps.mp4",
        }
      : baseProperty;

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
      />

      <main className="relative z-10">
        <div
          className={`mt-8 grid gap-7 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:mt-10 md:gap-8 ${
            isRtl ? "md:[direction:rtl]" : ""
          }`}
        >
          <section className="space-y-6 md:space-y-7">
            <section className="scroll-mt-36 md:scroll-mt-40">
              <PropertyHighlights
                property={displayProperty}
                stats={MOCK_AGENT_STATS}
              />
              <PropertyOverview property={displayProperty} />
            </section>

            <section className="scroll-mt-36 md:scroll-mt-40">
              <PropertyAmenities amenities={displayProperty.amenities} />
            </section>

            {isExclusive && (
              <section className="scroll-mt-36 md:scroll-mt-40">
                <PropertyNeighborhood />
              </section>
            )}
          </section>

          <div
            className={`self-start md:sticky md:top-[124px] ${
              isRtl ? "md:pl-0 md:pr-4" : "md:pl-4"
            }`}
          >
            <PropertyDetailsPriceCard price={displayProperty.price} />
            <PropertyInsightsSidebar
              listing={{
                id: displayProperty.id,
                title: displayProperty.title,
                brokerName:
                  displayProperty.brokerName ?? "Your agency",
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}


"use client";

import type { AppLocale } from "@/i18n/routing";
import { PropertyDetailsView } from "@/features/property-details/components/PropertyDetailsView";
import type { DetailedProperty, PropertyStat } from "@/features/property-details/types";

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
  virtualTourUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
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
  { label: "Minimum contract", value: "12 months" },
  { label: "Deposit", value: "2 months" },
  { label: "Brokerage fee", value: "One month rent" },
];

export function AgentPropertyDetails({ language, propertyId }: AgentPropertyDetailsProps) {
  // Preserve signature: propertyId is currently unused (mock page)
  void propertyId;

  return (
    <PropertyDetailsView
      language={language}
      property={MOCK_AGENT_PROPERTY}
      stats={MOCK_AGENT_STATS}
      enableExclusiveFromUrl
    />
  );
}


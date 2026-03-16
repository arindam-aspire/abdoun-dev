"use client";

import { PropertyDetailsAgentSection } from "./PropertyDetailsAgentSection";
import { PropertyDetailsSimilarProperties } from "./PropertyDetailsSimilarProperties";

export interface PropertyInsightsSidebarProps {
  listing: {
    id: number;
    title: string;
    brokerName: string;
  };
}

export function PropertyInsightsSidebar({ listing }: PropertyInsightsSidebarProps) {
  return (
    <aside className="space-y-4">
      <PropertyDetailsAgentSection listing={listing} />
      {/* <PropertyDetailsReviewSection /> */}
      <PropertyDetailsSimilarProperties key={listing.id} propertyId={listing.id} />
    </aside>
  );
}

"use client";

import { PropertyDetailsAgentSection } from "./PropertyDetailsAgentSection";
import { PropertyDetailsReviewSection } from "./PropertyDetailsReviewSection";
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
      <PropertyDetailsSimilarProperties />
    </aside>
  );
}

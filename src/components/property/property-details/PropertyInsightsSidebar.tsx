"use client";

import { PropertyDetailsAgentSection } from "./PropertyDetailsAgentSection";
import { PropertyDetailsReviewSection } from "./PropertyDetailsReviewSection";
import { PropertyDetailsSimilarProperties } from "./PropertyDetailsSimilarProperties";

export function PropertyInsightsSidebar() {
  return (
    <aside className="space-y-4">
      <PropertyDetailsAgentSection />
      {/* <PropertyDetailsReviewSection /> */}
      <PropertyDetailsSimilarProperties />
    </aside>
  );
}

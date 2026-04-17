"use client";

import { PropertyDetailsAgentSection } from "./PropertyDetailsAgentSection";

export interface PropertyInsightsSidebarProps {
  listing: {
    id: number;
    title: string;
    brokerName: string;
  };
}

export function PropertyInsightsSidebar({
  listing,
}: PropertyInsightsSidebarProps) {
  return <PropertyDetailsAgentSection listing={listing} />;
}

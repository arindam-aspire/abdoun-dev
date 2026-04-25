"use client";

import { PropertyDetailsAgentSection } from "./PropertyDetailsAgentSection";

export interface PropertyInsightsSidebarProps {
  listing: {
    id: number;
    title: string;
    brokerName: string;
    /** When API returns an agent, shown in the card */
    agentName?: string;
    agentTagline?: string;
  };
}

export function PropertyInsightsSidebar({
  listing,
}: PropertyInsightsSidebarProps) {
  return <PropertyDetailsAgentSection listing={listing} />;
}

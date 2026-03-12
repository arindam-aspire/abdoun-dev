"use client";

import { usePathname } from "next/navigation";
import AgentFooter from "@/components/layout/AgentFooter";

/** Renders AgentFooter on all agent routes except Add Property. */
export default function AgentFooterConditional(): React.JSX.Element | null {
  const pathname = usePathname();
  if (pathname?.includes("/add-property")) return null;
  return <AgentFooter />;
}

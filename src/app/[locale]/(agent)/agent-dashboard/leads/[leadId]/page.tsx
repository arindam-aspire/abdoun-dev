"use client";

import { useParams } from "next/navigation";
import { LeadDetailPage } from "@/features/leads/components/LeadDetailPage";

export default function AgentLeadDetailRoute() {
  const params = useParams();
  const leadId = params?.leadId != null ? String(params.leadId) : "";
  return <LeadDetailPage mode="agent" leadId={leadId} />;
}


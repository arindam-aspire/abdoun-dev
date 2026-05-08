"use client";

import { useParams } from "next/navigation";
import { LeadDetailPage } from "@/features/leads/components/LeadDetailPage";

export default function AdminLeadDetailRoute() {
  const params = useParams();
  const leadId = params?.leadId != null ? String(params.leadId) : "";
  return <LeadDetailPage mode="admin" leadId={leadId} />;
}


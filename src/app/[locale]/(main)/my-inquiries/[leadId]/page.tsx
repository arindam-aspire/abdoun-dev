"use client";

import { useParams } from "next/navigation";
import { AuthenticatedRouteGuard } from "@/components/layout/AuthenticatedRouteGuard";
import { LeadDetailPage } from "@/features/leads/components/LeadDetailPage";

export default function MyInquiryDetailRoute() {
  const params = useParams();
  const leadId = params?.leadId != null ? String(params.leadId) : "";
  return (
    <AuthenticatedRouteGuard>
      <LeadDetailPage mode="user" leadId={leadId} />
    </AuthenticatedRouteGuard>
  );
}


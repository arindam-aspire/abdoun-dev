"use client";

import { useParams } from "next/navigation";
import { AdminPropertySubmissionDetailPage } from "@/features/admin-agents/admin-dashboard/components/property-submissions/AdminPropertySubmissionDetailPage";

export default function AdminPropertySubmissionDetailRoute() {
  const params = useParams();
  const submissionId = params?.submissionId != null ? String(params.submissionId) : "";

  if (!submissionId) {
    return <p className="text-sm text-charcoal/60">Missing submission id.</p>;
  }

  return <AdminPropertySubmissionDetailPage submissionId={submissionId} />;
}

"use client";

import { createHttpClients } from "@/lib/http";

type StandardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  error?: string | null;
};

const { authApi } = createHttpClients();

const unwrap = <T,>(raw: StandardApiResponse<T>): T => raw.data;

export type AdminSubmissionListItem = {
  submission_id: string;
  submitted_by: string;
  status: string;
  property_id: string | null;
  current_step: number;
  submitted_at: string | null;
  reviewed_at: string | null;
};

export type AdminSubmissionListResult = {
  items: AdminSubmissionListItem[];
  page: number;
  limit: number;
  total: number;
};

export type AdminGetSubmissionResult = {
  submission_id: string;
  submitted_by: string;
  status: string;
  property_id: string | null;
  current_step: number;
  payload: Record<string, unknown>;
  review_reason?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
};

export type AdminReviewAction = "approve" | "changes_requested" | "reject";

export type AdminReviewBody = {
  action: AdminReviewAction;
  reason?: string | null;
};

export async function listAdminPropertySubmissions(params: {
  status?: "submitted" | "changes_requested" | "approved" | "rejected";
  page?: number;
  limit?: number;
}): Promise<AdminSubmissionListResult> {
  const response = await authApi.get<StandardApiResponse<AdminSubmissionListResult>>(
    "/admin/property-submissions",
    { params },
  );
  return unwrap(response.data);
}

export async function getAdminPropertySubmission(
  submissionId: string,
): Promise<AdminGetSubmissionResult> {
  const response = await authApi.get<StandardApiResponse<AdminGetSubmissionResult>>(
    `/admin/property-submissions/${submissionId}`,
  );
  return unwrap(response.data);
}

export async function reviewAdminPropertySubmission(
  submissionId: string,
  body: AdminReviewBody,
): Promise<Record<string, unknown>> {
  const response = await authApi.post<StandardApiResponse<Record<string, unknown>>>(
    `/admin/property-submissions/${submissionId}/review`,
    body,
  );
  return unwrap(response.data);
}

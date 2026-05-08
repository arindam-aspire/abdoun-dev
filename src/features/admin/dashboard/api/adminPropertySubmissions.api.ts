"use client";

import { authApi } from "@/lib/http/clients";
import {
  createPaginatedResultFromListWire,
  type ListPaginationWire,
  type PaginatedResult,
} from "@/lib/api/pagination";

export type AdminSubmissionListItem = {
  submission_id: string;
  submitted_by: string;
  submitted_by_name?: string | null;
  /** Submission workflow status (snake case). Prefer `submission_status` when present. */
  status: string;
  submission_status?: string | null;
  submission_workflow_label?: string | null;
  submitted_by_role?: "agent" | "admin" | string | null;
  created_by?: string | null;
  created_by_role?: "agent" | "admin" | string | null;
  source_role?: "agent" | "admin" | string | null;
  submission_source?: "agent" | "admin" | string | null;
  property_id: string | null;
  /** Assigned agent user id (null when unassigned). */
  agent_user_id?: string | null;
  /** Alternate backend field name for assigned agent id. */
  assigned_agent_id?: string | null;
  /** Backend convenience flag when the property already has an assigned agent. */
  has_assigned_agent?: boolean | string | number | null;
  /** Numeric id used by `GET /api/v1/properties/{property_hash}` (additive backend field). */
  property_hash?: number | null;
  property_title?: string | null;
  property_reference_number?: string | null;
  current_step: number;
  submitted_at: string | null;
  reviewed_at: string | null;
  review_reason?: string | null;
  reviewed_by?: string | null;
  deleted_at?: string | null;
};

/** Wire API body (after envelope peel): `items` plus nested or flat pagination fields. */
export type AdminSubmissionListWire = ListPaginationWire & {
  items?: AdminSubmissionListItem[] | null;
};

export type AdminSubmissionListResponse = PaginatedResult<AdminSubmissionListItem>;

export type AdminSubmissionDetailResponse = {
  submission_id: string;
  submitted_by: string;
  status: string;
  property_id: string | null;
  /** Numeric id used by `GET /api/v1/properties/{property_hash}` (additive backend field). */
  property_hash?: number | null;
  current_step: number;
  payload: Record<string, unknown>;
  review_reason?: string | null;
  reviewed_by?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  deleted_at?: string | null;
};

export type AdminReviewAction = "approve" | "changes_requested" | "reject";

export type AdminSubmissionReviewRequest = {
  action: AdminReviewAction;
  reason?: string | null;
};

export type AdminSubmissionReviewResponse = Record<string, unknown>;

export type AdminCreateAndSubmitBody = {
  payload: Record<string, unknown>;
  confirm_submit: true;
};

export type AdminCreateAndSubmitResponse = {
  property_id: string;
  submission_id?: string;
  status?: string;
};

export async function createAndSubmitAdminPropertySubmission(
  payload: Record<string, unknown>,
): Promise<AdminCreateAndSubmitResponse> {
  const response = await authApi.post<AdminCreateAndSubmitResponse>(
    "/admin/property-submissions/submit",
    { payload, confirm_submit: true } satisfies AdminCreateAndSubmitBody,
  );
  return response.data;
}

export type AdminCreateDraftBody = {
  payload: Record<string, unknown>;
  current_step: number;
};

export type AdminDraftResult = {
  submission_id: string;
  status: string;
  current_step: number;
  last_completed_step?: number | null;
  step_completion?: Record<string, boolean> | null;
  payload?: Record<string, unknown>;
  property_id?: string | null;
  review_reason?: string | null;
};

export async function createAdminPropertySubmissionDraft(
  payload: Record<string, unknown>,
  currentStep: number,
): Promise<AdminDraftResult> {
  const response = await authApi.post<AdminDraftResult>(
    "/admin/property-submissions",
    { payload, current_step: currentStep } satisfies AdminCreateDraftBody,
  );
  return response.data;
}

export type AdminPatchDraftBody = {
  action: "save_draft";
  current_step: number;
  payload: Record<string, unknown>;
};

export async function updateAdminPropertySubmissionDraft(
  submissionId: string,
  params: { payload: Record<string, unknown>; current_step: number },
): Promise<AdminDraftResult> {
  const body: AdminPatchDraftBody = {
    action: "save_draft",
    current_step: params.current_step,
    payload: params.payload,
  };
  const response = await authApi.patch<AdminDraftResult>(
    `/admin/property-submissions/${submissionId}`,
    body,
  );
  return response.data;
}

export type AdminSubmitExistingDraftResult = {
  property_id: string;
  status?: string;
  submission_id?: string;
};

export async function submitExistingAdminPropertySubmission(
  submissionId: string,
): Promise<AdminSubmitExistingDraftResult> {
  const response = await authApi.post<AdminSubmitExistingDraftResult>(
    `/admin/property-submissions/${submissionId}/submit`,
    { confirm_submit: true },
  );
  return response.data;
}

export type AssignPropertyAgentResponse = Record<string, unknown>;

export async function assignPropertyToAgent(
  propertyId: string,
  agentId: string | null,
): Promise<AssignPropertyAgentResponse> {
  const response = await authApi.patch<AssignPropertyAgentResponse>(
    `/admin/properties/${propertyId}/assign-agent`,
    { agent_id: agentId },
  );
  return response.data;
}

export async function deleteAdminPropertySubmission(
  submissionId: string,
  reason?: string,
): Promise<void> {
  await authApi.delete(`/admin/property-submissions/${submissionId}`, {
    params: reason?.trim() ? { reason: reason.trim() } : undefined,
  });
}

/**
 * Legacy names kept for older imports.
 * Prefer `fetchAdminSubmissions` / `fetchAdminSubmissionDetail` / `reviewAdminSubmission`.
 */
export type AdminPropertySubmissionListItem = AdminSubmissionListItem;
export type AdminPropertySubmissionsListData = AdminSubmissionListResponse;
export async function fetchAdminPropertySubmissions(params: {
  status?: string;
  include_deleted?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<AdminPropertySubmissionsListData> {
  const pageSize = params.pageSize ?? 20;
  return fetchAdminSubmissions({
    status: (params.status ?? "") as
      | ""
      | "draft"
      | "in_progress"
      | "submitted"
      | "changes_requested"
      | "approved"
      | "rejected",
    include_deleted: params.include_deleted,
    page: params.page ?? 1,
    pageSize,
  });
}

/**
 * Typed list call for admin moderation table.
 */
export async function fetchAdminSubmissions(params: {
  status?: "" | "draft" | "in_progress" | "submitted" | "changes_requested" | "approved" | "rejected";
  include_deleted?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<AdminSubmissionListResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const response = await authApi.get<AdminSubmissionListWire>("/admin/property-submissions", {
    params: {
      status: params.status ?? "",
      page,
      pageSize,
      ...(params.include_deleted ? { include_deleted: true } : {}),
    },
  });
  const payload = response.data;
  return createPaginatedResultFromListWire<AdminSubmissionListItem>(payload, { page, pageSize });
}

/**
 * Admin view details for a submission.
 */
export async function fetchAdminSubmissionDetail(
  submissionId: string,
): Promise<AdminSubmissionDetailResponse> {
  const response = await authApi.get<AdminSubmissionDetailResponse>(
    `/admin/property-submissions/${submissionId}`,
  );
  return response.data;
}

export type AdminDraftSubmissionItem = {
  submission_id: string;
  status: string;
  current_step: number;
  last_completed_step?: number | null;
  title: string | null;
  updated_at: string | null;
  can_edit?: boolean;
  can_delete?: boolean;
};

export type AdminDraftSubmissionsListData = PaginatedResult<AdminDraftSubmissionItem>;

type AdminDraftListWire = ListPaginationWire & {
  items?: AdminDraftSubmissionItem[] | null;
};

export async function fetchAdminPropertyDrafts(params: {
  page?: number;
  pageSize?: number;
} = {}): Promise<AdminDraftSubmissionsListData> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const response = await authApi.get<AdminDraftListWire>("/admin/property-submissions/drafts", {
    params: { page, pageSize },
  });
  const payload = response.data;
  return createPaginatedResultFromListWire<AdminDraftSubmissionItem>(payload, { page, pageSize });
}

export async function reviewAdminSubmission(
  submissionId: string,
  body: AdminSubmissionReviewRequest,
): Promise<AdminSubmissionReviewResponse> {
  const response = await authApi.post<AdminSubmissionReviewResponse>(
    `/admin/property-submissions/${submissionId}/review`,
    body,
  );
  return response.data;
}

/**
 * Back-compat exports for earlier component versions.
 */
export type AdminSubmissionListResult = AdminSubmissionListResponse;
export type AdminGetSubmissionResult = AdminSubmissionDetailResponse;
export type AdminReviewBody = AdminSubmissionReviewRequest;
export async function listAdminPropertySubmissions(params: {
  status?: "" | "draft" | "in_progress" | "submitted" | "changes_requested" | "approved" | "rejected";
  include_deleted?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<AdminSubmissionListResponse> {
  return fetchAdminSubmissions(params);
}
export async function getAdminPropertySubmission(
  submissionId: string,
): Promise<AdminSubmissionDetailResponse> {
  return fetchAdminSubmissionDetail(submissionId);
}
export async function reviewAdminPropertySubmission(
  submissionId: string,
  body: AdminSubmissionReviewRequest,
): Promise<AdminSubmissionReviewResponse> {
  return reviewAdminSubmission(submissionId, body);
}


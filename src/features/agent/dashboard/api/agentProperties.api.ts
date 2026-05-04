"use client";

import { authApi } from "@/lib/http/clients";
import { createPaginatedResult, type PaginatedResult } from "@/lib/api/pagination";

export type AgentPropertyListItem = {
  property_id: string;
  property_hash: number;
  title: string;
  listing_purpose: string;
  type_name: string;
  type_slug: string;
  category_name: string;
  category_slug: string;
  status_name: string;
  status_slug: string;
  price: string;
  currency: string;
  reference_number: string | null;
  created_at: string;
  updated_at: string | null;
  /** Set when a submission is linked to this property (same `submitted_by`). */
  submission_id?: string | null;
  submission_status?: string | null;
  /** Backend display label for workflow (prefer for badge). */
  submission_workflow_label?: string | null;
  submission_submitted_at?: string | null;
  submission_reviewed_at?: string | null;
  submission_review_reason?: string | null;
  review_reason?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  can_edit_submission?: boolean;
  can_delete_submission?: boolean;
} & {
  /** Some API versions return camelCase for the same fields. */
  submissionId?: string | null;
  canEditSubmission?: boolean;
  canDeleteSubmission?: boolean;
  listing_submission_id?: string | null;
};

/** Draft / in-progress wizards with no `property_id` yet. */
export type AgentDraftSubmissionItem = {
  submission_id: string;
  status: string;
  current_step: number;
  last_completed_step?: number | null;
  title: string | null;
  updated_at: string | null;
};

export type AgentPropertyListData = PaginatedResult<AgentPropertyListItem> & {
  /** May be absent on older API versions. */
  draft_submissions?: AgentDraftSubmissionItem[];
  draft_submissions_total?: number;
};

export type FetchAgentPropertiesParams = {
  page?: number;
  pageSize?: number;
};

export type AgentDraftSubmissionsListData = PaginatedResult<AgentDraftSubmissionItem>;

/**
 * List properties the current user created (submitted via stepper), newest first.
 */
export async function fetchAgentProperties(
  params: FetchAgentPropertiesParams = {},
): Promise<AgentPropertyListData> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const response = await authApi.get<AgentPropertyListData>("/agent-properties", {
    params: { page, pageSize },
  });
  const payload = response.data;
  return {
    ...payload,
    ...createPaginatedResult(payload.items, payload.pagination, { page, pageSize }),
  };
}

/**
 * Draft-only API: returns only draft / in_progress submissions (no property_id yet).
 * `GET /agent-properties/drafts?page=1&pageSize=20`
 */
export async function fetchAgentPropertyDrafts(
  params: FetchAgentPropertiesParams = {},
): Promise<AgentDraftSubmissionsListData> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const response = await authApi.get<AgentDraftSubmissionsListData>(
    "/agent-properties/drafts",
    { params: { page, pageSize } },
  );
  const payload = response.data;
  return createPaginatedResult(payload.items, payload.pagination, { page, pageSize });
}

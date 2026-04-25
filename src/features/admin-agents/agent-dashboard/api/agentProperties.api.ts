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
  submission_submitted_at?: string | null;
  submission_reviewed_at?: string | null;
  submission_review_reason?: string | null;
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

export type AgentPropertyListData = {
  items: AgentPropertyListItem[];
  total: number;
  page: number;
  limit: number;
  /** May be absent on older API versions. */
  draft_submissions?: AgentDraftSubmissionItem[];
  draft_submissions_total?: number;
};

export type FetchAgentPropertiesParams = {
  page?: number;
  limit?: number;
};

/**
 * List properties the current user created (submitted via stepper), newest first.
 */
export async function fetchAgentProperties(
  params: FetchAgentPropertiesParams = {},
): Promise<AgentPropertyListData> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const response = await authApi.get<StandardApiResponse<AgentPropertyListData>>(
    "/agent-properties",
    { params: { page, limit } },
  );
  return unwrap(response.data);
}

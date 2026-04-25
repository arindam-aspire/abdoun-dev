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

export type SubmissionStatus =
  | "draft"
  | "in_progress"
  | "submitted"
  | "changes_requested"
  | "approved"
  | "rejected";

export type ApiSubmissionStep =
  | "basic_information"
  | "location"
  | "owner_information"
  | "property_details"
  | "pricing"
  | "amenities"
  | "media_documents"
  | "review_submit";

export type ApiSubmissionAction = "save" | "next" | "previous" | "save_draft";

export type CreateSubmissionResult = {
  submission_id: string;
  status: SubmissionStatus;
  current_step: number;
  last_completed_step?: number | null;
  step_completion?: Record<string, boolean> | null;
  payload?: Record<string, unknown>;
};

export type GetSubmissionResult = CreateSubmissionResult & {
  property_id?: string | null;
  review_reason?: string | null;
  payload: Record<string, unknown>;
};

export type CreateSubmissionResponse = CreateSubmissionResult & {
  property_id?: string | null;
};

export type PatchSubmissionBody = {
  step: ApiSubmissionStep;
  action: ApiSubmissionAction;
  data: Record<string, unknown>;
};

/** PATCH response: same envelope as GET; `payload` is merged server state (additive on API). */
export type PatchPropertySubmissionResult = CreateSubmissionResult & {
  property_id?: string | null;
  review_reason?: string | null;
  payload?: Record<string, unknown>;
};

export type SubmitResult = {
  property_id: string;
  status?: SubmissionStatus;
};

export async function createPropertySubmission(
  body?: { payload?: Record<string, unknown> },
): Promise<CreateSubmissionResponse> {
  const response = await authApi.post<StandardApiResponse<CreateSubmissionResponse>>(
    "/property-submissions",
    body ?? {},
  );
  return unwrap(response.data);
}

export async function getPropertySubmission(
  submissionId: string,
): Promise<GetSubmissionResult> {
  const response = await authApi.get<StandardApiResponse<GetSubmissionResult>>(
    `/property-submissions/${submissionId}`,
  );
  return unwrap(response.data);
}

export async function patchPropertySubmission(
  submissionId: string,
  body: PatchSubmissionBody,
): Promise<PatchPropertySubmissionResult> {
  const response = await authApi.patch<StandardApiResponse<PatchPropertySubmissionResult>>(
    `/property-submissions/${submissionId}`,
    body,
  );
  return unwrap(response.data);
}

export async function submitPropertySubmission(
  submissionId: string,
): Promise<SubmitResult> {
  const response = await authApi.post<StandardApiResponse<SubmitResult>>(
    `/property-submissions/${submissionId}/submit`,
    { confirm_submit: true },
  );
  return unwrap(response.data);
}

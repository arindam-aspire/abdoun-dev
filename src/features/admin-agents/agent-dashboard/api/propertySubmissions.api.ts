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

/**
 * **Full-payload draft save (add-property stepper).**
 * Do not send `step` or `data` — the backend deep-merges `payload` and recomputes
 * `step_completion` / `last_completed_step`.
 * Aligns with `PropertySubmissionPatchRequest` when `payload` is set (e.g. `action` must be `save_draft`).
 */
export type PatchPropertySubmissionFullDraftBody = {
  action: "save_draft";
  /** 1-based step index; backend may default to 1 if omitted */
  current_step: number;
  payload: Record<string, unknown>;
};

/**
 * **Per-step PATCH (legacy / narrow updates).** Do not send `payload` with this shape;
 * use {@link PatchPropertySubmissionFullDraftBody} for the add-property wizard save draft.
 */
export type PatchPropertySubmissionStepBody = {
  step: ApiSubmissionStep;
  action: ApiSubmissionAction;
  data: Record<string, unknown>;
  current_step?: number;
};

export type PatchPropertySubmissionBody =
  | PatchPropertySubmissionFullDraftBody
  | PatchPropertySubmissionStepBody;

export type CreateSubmissionResult = {
  submission_id: string;
  status: SubmissionStatus;
  current_step: number;
  last_completed_step?: number | null;
  step_completion?: Record<string, boolean> | null;
  payload?: Record<string, unknown>;
  /** For full-payload saves: API step name matching `current_step` (e.g. `pricing` for step 5). */
  saved_step?: ApiSubmissionStep | string | null;
};

export type GetSubmissionResult = CreateSubmissionResult & {
  property_id?: string | null;
  review_reason?: string | null;
  payload: Record<string, unknown>;
};

export type CreateSubmissionResponse = CreateSubmissionResult & {
  property_id?: string | null;
};

/** PATCH response: same envelope as GET; `payload` is merged server state when present. */
export type PatchPropertySubmissionResult = CreateSubmissionResult & {
  property_id?: string | null;
  review_reason?: string | null;
  payload?: Record<string, unknown>;
};

export type SubmitResult = {
  property_id: string;
  status?: SubmissionStatus;
  submission_id?: string;
  step_completion?: Record<string, boolean> | null;
  last_completed_step?: number | null;
  saved_step?: ApiSubmissionStep | string | null;
};

export type CreateAndSubmitResult = SubmitResult & {
  submission_id?: string;
  step_completion?: Record<string, boolean> | null;
  last_completed_step?: number | null;
};

/**
 * Save a new draft (first persistence). No call on “Add New Property” — use only from Save as Draft.
 */
export async function createPropertySubmissionDraft(
  payload: Record<string, unknown>,
  currentStep: number,
): Promise<CreateSubmissionResponse> {
  const response = await authApi.post<StandardApiResponse<CreateSubmissionResponse>>(
    "/property-submissions",
    { payload, current_step: currentStep },
  );
  return unwrap(response.data);
}

/**
 * Create and submit in one step when there is no persisted submission_id yet.
 */
export async function createAndSubmitPropertySubmission(
  payload: Record<string, unknown>,
): Promise<CreateAndSubmitResult> {
  const response = await authApi.post<StandardApiResponse<CreateAndSubmitResult>>(
    "/property-submissions/submit",
    { payload, confirm_submit: true },
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

/**
 * `PATCH /property-submissions/{id}` — send either
 * - **Full draft:** `{ action: "save_draft", current_step, payload }` (add-property; no `step` / `data`), or
 * - **Per-step:** `{ step, action, data }` (no `payload`), per backend `PropertySubmissionPatchRequest`.
 */
export async function patchPropertySubmission(
  submissionId: string,
  body: PatchPropertySubmissionBody,
): Promise<PatchPropertySubmissionResult> {
  const response = await authApi.patch<StandardApiResponse<PatchPropertySubmissionResult>>(
    `/property-submissions/${submissionId}`,
    body,
  );
  return unwrap(response.data);
}

/** Convenience: full-payload save draft (matches add-property “Save as Draft” / pre-submit sync). */
export function patchPropertySubmissionFullDraft(
  submissionId: string,
  params: { payload: Record<string, unknown>; current_step: number },
): Promise<PatchPropertySubmissionResult> {
  const body: PatchPropertySubmissionFullDraftBody = {
    action: "save_draft",
    current_step: params.current_step,
    payload: params.payload,
  };
  return patchPropertySubmission(submissionId, body);
}

export async function submitExistingPropertySubmission(
  submissionId: string,
): Promise<SubmitResult> {
  const response = await authApi.post<StandardApiResponse<SubmitResult>>(
    `/property-submissions/${submissionId}/submit`,
    { confirm_submit: true },
  );
  return unwrap(response.data);
}

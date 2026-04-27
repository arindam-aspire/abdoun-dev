import type { ApiSubmissionStep, GetSubmissionResult } from "../api/propertySubmissions.api";
import type { AddPropertyWizardState, AddPropertyWorkflowStatus } from "../components/add-property/addPropertyWizardSlice";
import { createEmptyAddPropertyWizardState } from "../components/add-property/addPropertyWizardSlice";
import { createOwner, type AddPropertyStepId } from "../components/add-property/addPropertyWizard.types";
import { applySubmissionPayloadToWizardState } from "./applySubmissionPayloadToWizard";

function newResumeDraftClientId(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
const API_STEP_ORDER: ApiSubmissionStep[] = [
  "basic_information",
  "location",
  "owner_information",
  "property_details",
  "pricing",
  "amenities",
  "media_documents",
  "review_submit",
];

function mapApiStepToUiStep(api: ApiSubmissionStep): AddPropertyStepId {
  const map: Record<ApiSubmissionStep, AddPropertyStepId> = {
    basic_information: "basic-information",
    location: "location",
    owner_information: "owner-information",
    property_details: "property-details",
    pricing: "pricing",
    amenities: "features-amenities",
    media_documents: "media-documents",
    review_submit: "review-submit",
  };
  return map[api] ?? "basic-information";
}

function uiStepFromApiCurrentStep(currentStep: number | undefined | null): AddPropertyStepId {
  if (typeof currentStep !== "number" || !Number.isFinite(currentStep) || currentStep < 1) {
    return "basic-information";
  }
  const idx = Math.min(Math.max(Math.floor(currentStep), 1), API_STEP_ORDER.length) - 1;
  return mapApiStepToUiStep(API_STEP_ORDER[idx]!);
}

/**
 * Builds full wizard Redux state from a GET submission response so drafts resume correctly.
 */
export function wizardStateFromApiSubmission(sub: GetSubmissionResult): AddPropertyWizardState {
  const base = createEmptyAddPropertyWizardState();
  const payload = sub.payload ?? {};

  base.submissionId = sub.submission_id;
  base.submissionStatus = sub.status;
  base.propertyIdAfterSubmit = sub.property_id ?? null;
  base.adminReviewReason = sub.review_reason ?? null;
  base.activeStep = uiStepFromApiCurrentStep(sub.current_step);
  base.draftClientId = newResumeDraftClientId();
  base.isPersisted = true;
  base.dirty = false;
  base.listingWorkflowStatus = sub.status as AddPropertyWorkflowStatus;
  base.serverStepCompletion = sub.step_completion
    ? { ...sub.step_completion }
    : null;
  base.serverLastCompletedStep =
    sub.last_completed_step != null && Number.isFinite(sub.last_completed_step)
      ? sub.last_completed_step
      : null;

  applySubmissionPayloadToWizardState(base, payload);

  if (base.owners.length === 0) {
    base.owners = [createOwner(1)];
  }

  return base;
}

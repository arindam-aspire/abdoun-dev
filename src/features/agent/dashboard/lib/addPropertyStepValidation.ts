import type { AddPropertyWizardState } from "../components/add-property/addPropertyWizardSlice";
import type { AddPropertyStepId } from "../components/add-property/addPropertyWizard.types";
import { ADD_PROPERTY_STEP_ORDER } from "../components/add-property/addPropertyWizard.types";
import {
  computeLocalStepCompletion,
  UI_STEP_ID_TO_COMPLETION_KEY,
} from "./localStepCompletion";

/**
 * `true` iff the user may navigate to this step index (0-based): all previous steps complete, or going back, or current.
 */
export function canNavigateToStepIndex(
  targetIndex: number,
  currentIndex: number,
  w: AddPropertyWizardState,
): boolean {
  if (targetIndex < 0 || targetIndex >= ADD_PROPERTY_STEP_ORDER.length) {
    return false;
  }
  if (targetIndex === currentIndex) {
    return true;
  }
  if (targetIndex < currentIndex) {
    return true;
  }
  const completion = computeLocalStepCompletion(w);
  for (let j = 0; j < targetIndex; j++) {
    const id = ADD_PROPERTY_STEP_ORDER[j]!;
    const key = UI_STEP_ID_TO_COMPLETION_KEY[id];
    if (!completion[key]) {
      return false;
    }
  }
  return true;
}

/**
 * User-facing error when trying **Next** from this step, or `null` if the step is valid to leave.
 */
export function getValidationErrorBeforeLeavingStep(
  step: AddPropertyStepId,
  w: AddPropertyWizardState,
): string | null {
  const c = computeLocalStepCompletion(w);
  const key = UI_STEP_ID_TO_COMPLETION_KEY[step];
  if (c[key]) {
    return null;
  }
  const messages: Record<AddPropertyStepId, string> = {
    "basic-information": "Please fill in listing purpose, type, and property title to continue.",
    location: "Please select a city and at least one area to continue.",
    "property-details": "Please complete at least one property detail field to continue.",
    "owner-information": "Each owner must have a full name and a valid phone number to continue.",
    pricing: "Please enter a price greater than zero to continue.",
    "features-amenities": "Please select at least one feature or amenity to continue.",
    "media-documents": "Add at least one image, video, or document, or a YouTube / virtual tour link to continue.",
    "review-submit": "Please read and accept the terms to submit.",
  };
  return messages[step] ?? "Please complete this step before continuing.";
}

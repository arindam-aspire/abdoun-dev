import type { AddPropertyWizardState } from "../components/add-property/addPropertyWizardSlice";
import type { AddPropertyStepId } from "../components/add-property/addPropertyWizard.types";
import { getCategoryId, getCityAndAreaIds, getTypeId } from "./submissionReferenceIds";

/**
 * API keys in backend `step_completion` / strict validation order (consecutive prefix for last-completed).
 */
export const API_STEP_COMPLETION_ORDER = [
  "basic_information",
  "location",
  "owner_information",
  "property_details",
  "pricing",
  "amenities",
  "media_documents",
  "review_submit",
] as const;

export type StepCompletionKey = (typeof API_STEP_COMPLETION_ORDER)[number];

export const UI_STEP_ID_TO_COMPLETION_KEY: Record<AddPropertyStepId, StepCompletionKey> = {
  "basic-information": "basic_information",
  location: "location",
  "property-details": "property_details",
  "owner-information": "owner_information",
  pricing: "pricing",
  "features-amenities": "amenities",
  "media-documents": "media_documents",
  "review-submit": "review_submit",
};

function hasMeaningfulPropertyDetails(state: AddPropertyWizardState["propertyDetails"]): boolean {
  const p = state;
  for (const v of Object.values(p)) {
    if (typeof v === "string" && v.trim() !== "") return true;
  }
  return false;
}

function fullPhone(o: AddPropertyWizardState["owners"][number]) {
  return [o.countryCode, o.phone].filter(Boolean).join(" ").trim();
}

export function isMediaStepSatisfied(w: AddPropertyWizardState): boolean {
  return (
    w.mediaImages.length +
      w.mediaVideos.length +
      w.propertyListingDocuments.length >
      0 ||
    w.youtubeUrl.trim() !== "" ||
    w.virtualTourUrl.trim() !== ""
  );
}

/**
 * Mirrors backend strict rules for unsaved (local) preview. Backend remains authoritative after sync.
 */
export function computeLocalStepCompletion(
  w: AddPropertyWizardState,
): Record<StepCompletionKey, boolean> {
  const basic_info =
    w.propertyTitle.trim() !== "" &&
    w.propertyType.trim() !== "" &&
    (w.listingPurpose === "sale" || w.listingPurpose === "rent") &&
    getCategoryId(w.category) > 0 &&
    getTypeId(w.category, w.propertyType) > 0;

  const { city_id, area_id } = getCityAndAreaIds(w.city, w.selectedAreas);
  const hasRealLocation = w.city.trim() !== "" && w.selectedAreas.length > 0;
  const location = hasRealLocation && city_id > 0 && area_id > 0;

  const owners = w.owners;
  const owner_information =
    owners.length > 0 &&
    owners.every(
      (o) => o.fullName.trim() !== "" && fullPhone(o) !== "",
    );

  const propertyDetailsObj = w.propertyDetails;
  const hasDetail =
    hasMeaningfulPropertyDetails(propertyDetailsObj);

  const property_details = hasDetail;

  const priceNum = Number(String(w.price).replace(/[, ]/g, "").trim());
  const pricing = Number.isFinite(priceNum) && priceNum > 0;

  const amenities = w.amenityFeatureIds.length > 0;

  const media_documents = isMediaStepSatisfied(w);

  const review_submit =
    w.termsAccepted;

  return {
    basic_information: basic_info,
    location,
    owner_information,
    property_details,
    pricing,
    amenities,
    media_documents,
    review_submit,
  };
}

/**
 * Consecutive 1..k completion count (highest k where steps 0..k-1 are all true) — aligns with common `last_completed_step` prefix semantics.
 */
export function computeConsecutiveLastCompletedFromCompletion(
  c: Record<string, boolean | undefined> | null | undefined,
): number {
  if (!c) return 0;
  let n = 0;
  for (const key of API_STEP_COMPLETION_ORDER) {
    if (c[key]) n += 1;
    else break;
  }
  return n;
}

/**
 * `true` if at least one wizard step passes {@link computeLocalStepCompletion} (user has
 * completed at least one full section). Used to avoid silent “empty” draft saves.
 */
export function hasAnyLocalStepComplete(w: AddPropertyWizardState): boolean {
  return Object.values(computeLocalStepCompletion(w)).some(Boolean);
}

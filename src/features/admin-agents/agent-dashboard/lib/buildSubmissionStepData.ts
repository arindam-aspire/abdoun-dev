import type { AddPropertyWizardState } from "../components/add-property/addPropertyWizardSlice";
import {
  ADD_PROPERTY_STEP_ORDER,
  type AddPropertyStepId,
} from "../components/add-property/addPropertyWizard.types";
import { getCategoryId, getCityAndAreaIds, getTypeId } from "./submissionReferenceIds";
import type { ApiSubmissionStep } from "../api/propertySubmissions.api";

function parseNum(s: string): number | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

export function uiStepToApiStep(ui: AddPropertyStepId): ApiSubmissionStep {
  const map: Record<AddPropertyStepId, ApiSubmissionStep> = {
    "basic-information": "basic_information",
    location: "location",
    "property-details": "property_details",
    "owner-information": "owner_information",
    pricing: "pricing",
    "features-amenities": "amenities",
    "media-documents": "media_documents",
    "review-submit": "review_submit",
  };
  return map[ui];
}

export function buildStepData(
  step: AddPropertyStepId,
  state: AddPropertyWizardState,
): Record<string, unknown> {
  switch (step) {
    case "basic-information":
      return {
        listing_purpose: state.listingPurpose,
        category_id: getCategoryId(state.category),
        type_id: getTypeId(state.category, state.propertyType),
        title: state.propertyTitle,
        description: state.description,
      };
    case "location": {
      const { city_id, area_id } = getCityAndAreaIds(state.city, state.selectedAreas);
      return {
        city_id,
        area_id,
        address: state.address,
      };
    }
    case "owner-information": {
      const owners = state.owners.map((o) => {
        const docs = state.ownerDocuments[o.id] ?? [];
        return {
          full_name: o.fullName,
          email: o.email || undefined,
          phone: [o.countryCode, o.phone].filter(Boolean).join(" ").trim() || undefined,
          nationality: o.nationality?.trim() || undefined,
          address: o.address?.trim() || undefined,
          social_security_id: o.socialSecurityId?.trim() || undefined,
          documents: docs.map((d) => ({ file_name: d.file_name, url: d.url })),
        };
      });
      return { owners };
    }
    case "property-details": {
      const p = state.propertyDetails;
      return {
        bedrooms: parseNum(p.bedrooms),
        bathrooms: parseNum(p.bathrooms),
        built_up_area: parseNum(p.builtUpArea),
        parking_spaces: parseNum(p.parkingSpaces),
        /** UI uses string slugs (e.g. "6-10", "new"); do not use parseNum — it drops non-numeric values. */
        property_age: p.propertyAge?.trim() || undefined,
        total_floors: parseNum(p.totalFloors),
        completion_status: p.completionStatus || undefined,
        occupancy: p.occupancy || undefined,
        ownership_type: p.ownershipType || undefined,
        reference_number: p.referenceNumber?.trim() || undefined,
        permit_number: p.permitNumber?.trim() || undefined,
        orientation: p.orientation || undefined,
      };
    }
    case "pricing": {
      const price = parseNum(state.price);
      return {
        ...(price !== undefined ? { price } : {}),
        currency: "JOD",
        service_charge: parseNum(state.serviceFee),
        maintenance_fee: parseNum(state.maintenanceFee),
      };
    }
    case "features-amenities":
      return { feature_ids: state.amenityFeatureIds };
    case "media-documents": {
      const images = (state.mediaImages ?? []).map((row, i) => ({
        file_name: row.file_name,
        url: row.url,
        ...(i === 0 ? { is_primary: true } : {}),
        display_order: i,
        ...(row.caption ? { caption: row.caption } : {}),
      }));
      const videos = (state.mediaVideos ?? []).map((row, i) => ({
        file_name: row.file_name,
        url: row.url,
        display_order: i,
        ...(row.caption ? { caption: row.caption } : {}),
      }));
      const documents = (state.propertyListingDocuments ?? []).map((row, i) => ({
        file_name: row.file_name,
        url: row.url,
        display_order: i,
        ...(row.caption ? { caption: row.caption } : {}),
      }));
      return {
        youtube_url: state.youtubeUrl || undefined,
        virtual_tour_url: state.virtualTourUrl || undefined,
        images,
        videos,
        documents,
      };
    }
    case "review-submit": {
      const agreed = Boolean(state.termsAccepted);
      return {
        terms_accepted: agreed,
        privacy_accepted: agreed,
        public_display_authorized: agreed,
        fees_acknowledged: agreed,
      };
    }
    default:
      return {};
  }
}

export function getReviewFlagsFromState(state: AddPropertyWizardState): {
  terms_accepted: boolean;
  privacy_accepted: boolean;
  public_display_authorized: boolean;
  fees_acknowledged: boolean;
} {
  const agreed = Boolean(state.termsAccepted);
  return {
    terms_accepted: agreed,
    privacy_accepted: agreed,
    public_display_authorized: agreed,
    fees_acknowledged: agreed,
  };
}

/** 1-based index for `current_step` in API payloads. */
export function getCurrentStepIndex1Based(state: AddPropertyWizardState): number {
  const i = ADD_PROPERTY_STEP_ORDER.indexOf(state.activeStep);
  return i >= 0 ? i + 1 : 1;
}

/**
 * Full nested payload for POST /property-submissions, /submit, or PATCH — matches backend sections.
 */
export function buildFullReduxPayload(
  state: AddPropertyWizardState,
): Record<string, unknown> {
  return {
    basic_information: buildStepData("basic-information", state),
    location: buildStepData("location", state),
    owner_information: buildStepData("owner-information", state),
    property_details: buildStepData("property-details", state),
    pricing: buildStepData("pricing", state),
    amenities: buildStepData("features-amenities", state),
    media_documents: buildStepData("media-documents", state),
    review_submit: buildStepData("review-submit", state),
  };
}

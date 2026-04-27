import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  applyPatchResponsePayloadToWizard,
} from "../../lib/applySubmissionPayloadToWizard";
import {
  computeConsecutiveLastCompletedFromCompletion,
  computeLocalStepCompletion,
  UI_STEP_ID_TO_COMPLETION_KEY,
} from "../../lib/localStepCompletion";

import {
  ADD_PROPERTY_STEP_ORDER,
  createOwner,
  type AddPropertyStepId,
  type Category,
  type ListingPurpose,
  type MediaFileRef,
  type OwnerDocumentRef,
  type OwnerEditableField,
  type OwnerState,
} from "./addPropertyWizard.types";

export type AddPropertyWorkflowStatus =
  | "local"
  | "draft"
  | "in_progress"
  | "submitted"
  | "changes_requested"
  | "approved"
  | "rejected";

function touch(state: { dirty: boolean }) {
  state.dirty = true;
}

export interface AddPropertyWizardState {
  activeStep: AddPropertyStepId;
  /** UUID for presigned uploads before a backend row exists */
  draftClientId: string;
  /** After first successful Save as Draft (or resuming a GET submission) */
  isPersisted: boolean;
  /** True after user changes local data since last init / server sync */
  dirty: boolean;
  /**
   * Workflow status: `local` until first save; then aligned with `submissionStatus` from API
   * when a submission exists.
   */
  listingWorkflowStatus: AddPropertyWorkflowStatus;
  listingPurpose: ListingPurpose;
  category: Category;
  propertyType: string;
  propertyTitle: string;
  description: string;
  city: string;
  selectedAreas: string[];
  address: string;
  price: string;
  serviceFee: string;
  featureSummary: string;
  internalNote: string;
  owners: OwnerState[];
  propertyDetails: {
    bedrooms: string;
    bathrooms: string;
    builtUpArea: string;
    parkingSpaces: string;
    propertyAge: string;
    completionStatus: string;
    totalFloors: string;
    occupancy: string;
    ownershipType: string;
    referenceNumber: string;
    permitNumber: string;
    orientation: string;
  };
  maintenanceFee: string;
  /** @deprecated Use amenityFeatureIds — kept for any legacy reads */
  amenities: string[];
  /** Backend `feature_ids` for amenities step */
  amenityFeatureIds: number[];
  ownerDocuments: Record<number, OwnerDocumentRef[]>;
  mediaImages: MediaFileRef[];
  mediaVideos: MediaFileRef[];
  propertyListingDocuments: MediaFileRef[];
  youtubeUrl: string;
  virtualTourUrl: string;
  /** Single “I agree to the above” flag; all four API flags are derived from this on submit. */
  termsAccepted: boolean;
  submissionId: string | null;
  submissionStatus: string | null;
  propertyIdAfterSubmit: string | null;
  adminReviewReason: string | null;
  /**
   * Last `step_completion` / `last_completed_step` from the API (stored for future use; the
   * add-property UI no longer uses these for stepper ticks — see `selectAddPropertyStepCompletionMap`).
   * **Backend should recompute** `step_completion` from the saved payload; if it returns `true`
   * for steps with empty required data, the UI was misleading before this was client-validated.
   */
  serverStepCompletion: Record<string, boolean> | null;
  serverLastCompletedStep: number | null;
}

const initialState: AddPropertyWizardState = {
  activeStep: "basic-information",
  listingPurpose: "sale",
  category: "residential",
  propertyType: "",
  propertyTitle: "",
  description: "",
  city: "",
  selectedAreas: [],
  address: "",
  price: "",
  serviceFee: "",
  featureSummary: "",
  internalNote: "",
  owners: [createOwner(1)],
  propertyDetails: {
    bedrooms: "",
    bathrooms: "",
    builtUpArea: "",
    parkingSpaces: "",
    propertyAge: "",
    completionStatus: "",
    totalFloors: "",
    occupancy: "",
    ownershipType: "",
    referenceNumber: "",
    permitNumber: "",
    orientation: "",
  },
  maintenanceFee: "",
  amenities: [],
  amenityFeatureIds: [],
  ownerDocuments: {},
  mediaImages: [],
  mediaVideos: [],
  propertyListingDocuments: [],
  youtubeUrl: "",
  virtualTourUrl: "",
  termsAccepted: false,
  draftClientId: "",
  isPersisted: false,
  dirty: false,
  listingWorkflowStatus: "local",
  submissionId: null,
  submissionStatus: null,
  propertyIdAfterSubmit: null,
  adminReviewReason: null,
  serverStepCompletion: null,
  serverLastCompletedStep: null,
};

function newDraftClientId(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildFreshInitialState(): AddPropertyWizardState {
  return {
    ...initialState,
    owners: [createOwner(1)],
    termsAccepted: false,
    draftClientId: newDraftClientId(),
    isPersisted: false,
    dirty: false,
    listingWorkflowStatus: "local",
  };
}

/** Full empty wizard state (e.g. after hydrating from API into a new object). */
export function createEmptyAddPropertyWizardState(): AddPropertyWizardState {
  return buildFreshInitialState();
}

const addPropertyWizardSlice = createSlice({
  name: "addPropertyWizard",
  initialState: buildFreshInitialState(),
  reducers: {
    setActiveStep(state, action: PayloadAction<AddPropertyStepId>) {
      touch(state);
      state.activeStep = action.payload;
    },
    setListingPurpose(state, action: PayloadAction<ListingPurpose>) {
      touch(state);
      state.listingPurpose = action.payload;
    },
    setCategory(state, action: PayloadAction<Category>) {
      touch(state);
      state.category = action.payload;
      state.propertyType = "";
    },
    setPropertyType(state, action: PayloadAction<string>) {
      touch(state);
      state.propertyType = action.payload;
    },
    setPropertyTitle(state, action: PayloadAction<string>) {
      touch(state);
      state.propertyTitle = action.payload;
    },
    setDescription(state, action: PayloadAction<string>) {
      touch(state);
      state.description = action.payload;
    },
    setCity(state, action: PayloadAction<string>) {
      touch(state);
      state.city = action.payload;
      state.selectedAreas = [];
    },
    setSelectedAreas(state, action: PayloadAction<string[]>) {
      touch(state);
      state.selectedAreas = action.payload;
    },
    setAddress(state, action: PayloadAction<string>) {
      touch(state);
      state.address = action.payload;
    },
    setPrice(state, action: PayloadAction<string>) {
      touch(state);
      state.price = action.payload;
    },
    setServiceFee(state, action: PayloadAction<string>) {
      touch(state);
      state.serviceFee = action.payload;
    },
    setMaintenanceFee(state, action: PayloadAction<string>) {
      touch(state);
      state.maintenanceFee = action.payload;
    },
    setPropertyDetailsField(
      state,
      action: PayloadAction<{
        key: keyof AddPropertyWizardState["propertyDetails"];
        value: string;
      }>,
    ) {
      touch(state);
      state.propertyDetails[action.payload.key] = action.payload.value;
    },
    toggleAmenity(state, action: PayloadAction<string>) {
      touch(state);
      if (state.amenities.includes(action.payload)) {
        state.amenities = state.amenities.filter((item) => item !== action.payload);
        return;
      }
      state.amenities.push(action.payload);
    },
    toggleAmenityFeatureId(state, action: PayloadAction<number>) {
      touch(state);
      const id = action.payload;
      if (state.amenityFeatureIds.includes(id)) {
        state.amenityFeatureIds = state.amenityFeatureIds.filter((x) => x !== id);
        return;
      }
      state.amenityFeatureIds.push(id);
    },
    setOwnerDocumentsForOwner(
      state,
      action: PayloadAction<{ ownerId: number; documents: OwnerDocumentRef[] }>,
    ) {
      touch(state);
      state.ownerDocuments[action.payload.ownerId] = action.payload.documents;
    },
    addMediaImage(state, action: PayloadAction<MediaFileRef>) {
      touch(state);
      state.mediaImages.push(action.payload);
    },
    setMediaImages(state, action: PayloadAction<MediaFileRef[]>) {
      touch(state);
      state.mediaImages = action.payload;
    },
    addMediaVideo(state, action: PayloadAction<MediaFileRef>) {
      touch(state);
      state.mediaVideos.push(action.payload);
    },
    setMediaVideos(state, action: PayloadAction<MediaFileRef[]>) {
      touch(state);
      state.mediaVideos = action.payload;
    },
    addPropertyListingDocument(state, action: PayloadAction<MediaFileRef>) {
      touch(state);
      state.propertyListingDocuments.push(action.payload);
    },
    setPropertyListingDocuments(state, action: PayloadAction<MediaFileRef[]>) {
      touch(state);
      state.propertyListingDocuments = action.payload;
    },
    setSubmissionMeta(
      state,
      action: PayloadAction<{
        submissionId?: string | null;
        submissionStatus?: string | null;
        propertyIdAfterSubmit?: string | null;
        adminReviewReason?: string | null;
        isPersisted?: boolean;
        listingWorkflowStatus?: AddPropertyWorkflowStatus;
      }>,
    ) {
      if (action.payload.submissionId !== undefined) state.submissionId = action.payload.submissionId;
      if (action.payload.submissionStatus !== undefined) {
        state.submissionStatus = action.payload.submissionStatus;
        if (action.payload.listingWorkflowStatus === undefined && action.payload.submissionStatus) {
          state.listingWorkflowStatus = action.payload.submissionStatus as AddPropertyWorkflowStatus;
        }
      }
      if (action.payload.listingWorkflowStatus !== undefined) {
        state.listingWorkflowStatus = action.payload.listingWorkflowStatus;
      }
      if (action.payload.isPersisted !== undefined) state.isPersisted = action.payload.isPersisted;
      if (action.payload.propertyIdAfterSubmit !== undefined) {
        state.propertyIdAfterSubmit = action.payload.propertyIdAfterSubmit;
      }
      if (action.payload.adminReviewReason !== undefined) {
        state.adminReviewReason = action.payload.adminReviewReason;
      }
    },
    setYoutubeUrl(state, action: PayloadAction<string>) {
      touch(state);
      state.youtubeUrl = action.payload;
    },
    setVirtualTourUrl(state, action: PayloadAction<string>) {
      touch(state);
      state.virtualTourUrl = action.payload;
    },
    setTermsAccepted(state, action: PayloadAction<boolean>) {
      touch(state);
      state.termsAccepted = action.payload;
    },
    setFeatureSummary(state, action: PayloadAction<string>) {
      touch(state);
      state.featureSummary = action.payload;
    },
    setInternalNote(state, action: PayloadAction<string>) {
      touch(state);
      state.internalNote = action.payload;
    },
    addOwner(state) {
      touch(state);
      if (state.owners.length >= 3) return;
      state.owners.push(createOwner(Date.now()));
    },
    updateOwner(
      state,
      action: PayloadAction<{ id: number; key: OwnerEditableField; value: string }>,
    ) {
      touch(state);
      const owner = state.owners.find((item) => item.id === action.payload.id);
      if (owner) {
        owner[action.payload.key] = action.payload.value;
      }
    },
    removeOwner(state, action: PayloadAction<number>) {
      touch(state);
      if (state.owners.length === 1) return;
      const id = action.payload;
      state.owners = state.owners.filter((owner) => owner.id !== id);
      delete state.ownerDocuments[id];
    },
    goToNextStep(state) {
      touch(state);
      const currentIndex = ADD_PROPERTY_STEP_ORDER.indexOf(state.activeStep);
      const nextStep = ADD_PROPERTY_STEP_ORDER[currentIndex + 1];
      if (nextStep) {
        state.activeStep = nextStep;
      }
    },
    goToPreviousStep(state) {
      touch(state);
      const currentIndex = ADD_PROPERTY_STEP_ORDER.indexOf(state.activeStep);
      const previousStep = ADD_PROPERTY_STEP_ORDER[currentIndex - 1];
      if (previousStep) {
        state.activeStep = previousStep;
      }
    },
    markWizardDirty(state) {
      touch(state);
    },
    initializeNewPropertyWizard: () => buildFreshInitialState(),
    resetAddPropertyWizard: () => buildFreshInitialState(),
    /** Replaces the entire wizard slice (used when loading a draft from GET submission). */
    rehydrateAddPropertyWizard: (_state, action: PayloadAction<AddPropertyWizardState>) =>
      action.payload,
    /** Merged `payload` from PATCH / POST without changing `activeStep` (partial merge). */
    mergeServerPayloadAfterPatch(state, action: PayloadAction<Record<string, unknown>>) {
      applyPatchResponsePayloadToWizard(state, action.payload);
      state.dirty = false;
    },
    setStepProgressFromServer(
      state,
      action: PayloadAction<{
        step_completion?: Record<string, boolean> | null;
        last_completed_step?: number | null;
      }>,
    ) {
      if (action.payload.step_completion !== undefined) {
        const sc = action.payload.step_completion;
        state.serverStepCompletion = sc == null ? null : { ...sc };
      }
      if (action.payload.last_completed_step !== undefined) {
        const v = action.payload.last_completed_step;
        state.serverLastCompletedStep =
          v == null || !Number.isFinite(v) ? null : Math.max(0, Math.floor(v));
      }
    },
  },
});

export const {
  setActiveStep,
  setListingPurpose,
  setCategory,
  setPropertyType,
  setPropertyTitle,
  setDescription,
  setCity,
  setSelectedAreas,
  setAddress,
  setPrice,
  setServiceFee,
  setMaintenanceFee,
  setPropertyDetailsField,
  toggleAmenity,
  toggleAmenityFeatureId,
  setOwnerDocumentsForOwner,
  addMediaImage,
  setMediaImages,
  addMediaVideo,
  setMediaVideos,
  addPropertyListingDocument,
  setPropertyListingDocuments,
  setSubmissionMeta,
  setYoutubeUrl,
  setVirtualTourUrl,
  setTermsAccepted,
  setFeatureSummary,
  setInternalNote,
  addOwner,
  updateOwner,
  removeOwner,
  goToNextStep,
  goToPreviousStep,
  resetAddPropertyWizard,
  rehydrateAddPropertyWizard,
  mergeServerPayloadAfterPatch,
  setStepProgressFromServer,
  markWizardDirty,
  initializeNewPropertyWizard,
} = addPropertyWizardSlice.actions;

export const selectAddPropertyActiveStep = (state: RootState) => state.addPropertyWizard.activeStep;
export const selectAddPropertyCurrentStepIndex = (state: RootState) =>
  ADD_PROPERTY_STEP_ORDER.indexOf(state.addPropertyWizard.activeStep);
export const selectAddPropertyWizard = (state: RootState) => state.addPropertyWizard;

/**
 * Ticks and step progress in the add-property UI: always from {@link computeLocalStepCompletion}
 * (payload-shaped Redux state), never raw API `step_completion` — the server can be out of sync
 * with empty sections marked complete.
 */
export function selectAddPropertyStepCompletionMap(state: RootState): Record<string, boolean> {
  return computeLocalStepCompletion(state.addPropertyWizard);
}

/**
 * 0…8: consecutive “last completed” count from the same local completion map as the stepper.
 */
export function selectAddPropertyLastCompletedStepDisplay(state: RootState): number {
  return computeConsecutiveLastCompletedFromCompletion(computeLocalStepCompletion(state.addPropertyWizard));
}

/** Whether the current step’s required fields are satisfied (for Next button state, etc.). */
export function selectAddPropertyCurrentStepComplete(state: RootState): boolean {
  const w = state.addPropertyWizard;
  const c = computeLocalStepCompletion(w);
  const key = UI_STEP_ID_TO_COMPLETION_KEY[w.activeStep];
  return Boolean(c[key]);
}

function isUserEditableSubmissionStatus(status: string | null | undefined): boolean {
  if (!status) return true;
  return status === "draft" || status === "in_progress" || status === "changes_requested";
}

export function isLockedListingStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return status === "submitted" || status === "approved" || status === "rejected";
}

/** False when review listing is read-only (submitted / approved / rejected). */
export function selectAddPropertyIsEditable(state: RootState): boolean {
  return !isLockedListingStatus(state.addPropertyWizard.submissionStatus);
}

/**
 * True when navigating away should show the leave modal (unsaved or in-progress work).
 * Local flow: any dirty state. Persisted: prior rule with editable status.
 */
export function selectShouldPromptLeaveAddProperty(state: RootState): boolean {
  const w = state.addPropertyWizard;
  if (isLockedListingStatus(w.submissionStatus)) return false;
  if (!w.submissionId) {
    return w.dirty;
  }
  if (!isUserEditableSubmissionStatus(w.submissionStatus)) return false;
  return (
    w.dirty ||
    (w.propertyTitle.trim().length > 0 && w.propertyType.trim().length > 0)
  );
}

export default addPropertyWizardSlice.reducer;

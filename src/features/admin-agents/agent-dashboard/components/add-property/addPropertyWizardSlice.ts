import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  applyPatchResponsePayloadToWizard,
} from "../../lib/applySubmissionPayloadToWizard";

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

export interface AddPropertyWizardState {
  activeStep: AddPropertyStepId;
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
  submissionId: null,
  submissionStatus: null,
  propertyIdAfterSubmit: null,
  adminReviewReason: null,
};

function buildFreshInitialState(): AddPropertyWizardState {
  return {
    ...initialState,
    owners: [createOwner(1)],
    termsAccepted: false,
  };
}

/** Full empty wizard state (e.g. after hydrating from API into a new object). */
export function createEmptyAddPropertyWizardState(): AddPropertyWizardState {
  return buildFreshInitialState();
}

const addPropertyWizardSlice = createSlice({
  name: "addPropertyWizard",
  initialState,
  reducers: {
    setActiveStep(state, action: PayloadAction<AddPropertyStepId>) {
      state.activeStep = action.payload;
    },
    setListingPurpose(state, action: PayloadAction<ListingPurpose>) {
      state.listingPurpose = action.payload;
    },
    setCategory(state, action: PayloadAction<Category>) {
      state.category = action.payload;
      state.propertyType = "";
    },
    setPropertyType(state, action: PayloadAction<string>) {
      state.propertyType = action.payload;
    },
    setPropertyTitle(state, action: PayloadAction<string>) {
      state.propertyTitle = action.payload;
    },
    setDescription(state, action: PayloadAction<string>) {
      state.description = action.payload;
    },
    setCity(state, action: PayloadAction<string>) {
      state.city = action.payload;
      state.selectedAreas = [];
    },
    setSelectedAreas(state, action: PayloadAction<string[]>) {
      state.selectedAreas = action.payload;
    },
    setAddress(state, action: PayloadAction<string>) {
      state.address = action.payload;
    },
    setPrice(state, action: PayloadAction<string>) {
      state.price = action.payload;
    },
    setServiceFee(state, action: PayloadAction<string>) {
      state.serviceFee = action.payload;
    },
    setMaintenanceFee(state, action: PayloadAction<string>) {
      state.maintenanceFee = action.payload;
    },
    setPropertyDetailsField(
      state,
      action: PayloadAction<{
        key: keyof AddPropertyWizardState["propertyDetails"];
        value: string;
      }>,
    ) {
      state.propertyDetails[action.payload.key] = action.payload.value;
    },
    toggleAmenity(state, action: PayloadAction<string>) {
      if (state.amenities.includes(action.payload)) {
        state.amenities = state.amenities.filter((item) => item !== action.payload);
        return;
      }
      state.amenities.push(action.payload);
    },
    toggleAmenityFeatureId(state, action: PayloadAction<number>) {
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
      state.ownerDocuments[action.payload.ownerId] = action.payload.documents;
    },
    addMediaImage(state, action: PayloadAction<MediaFileRef>) {
      state.mediaImages.push(action.payload);
    },
    setMediaImages(state, action: PayloadAction<MediaFileRef[]>) {
      state.mediaImages = action.payload;
    },
    addMediaVideo(state, action: PayloadAction<MediaFileRef>) {
      state.mediaVideos.push(action.payload);
    },
    setMediaVideos(state, action: PayloadAction<MediaFileRef[]>) {
      state.mediaVideos = action.payload;
    },
    addPropertyListingDocument(state, action: PayloadAction<MediaFileRef>) {
      state.propertyListingDocuments.push(action.payload);
    },
    setPropertyListingDocuments(state, action: PayloadAction<MediaFileRef[]>) {
      state.propertyListingDocuments = action.payload;
    },
    setSubmissionMeta(
      state,
      action: PayloadAction<{
        submissionId?: string | null;
        submissionStatus?: string | null;
        propertyIdAfterSubmit?: string | null;
        adminReviewReason?: string | null;
      }>,
    ) {
      if (action.payload.submissionId !== undefined) state.submissionId = action.payload.submissionId;
      if (action.payload.submissionStatus !== undefined) {
        state.submissionStatus = action.payload.submissionStatus;
      }
      if (action.payload.propertyIdAfterSubmit !== undefined) {
        state.propertyIdAfterSubmit = action.payload.propertyIdAfterSubmit;
      }
      if (action.payload.adminReviewReason !== undefined) {
        state.adminReviewReason = action.payload.adminReviewReason;
      }
    },
    setYoutubeUrl(state, action: PayloadAction<string>) {
      state.youtubeUrl = action.payload;
    },
    setVirtualTourUrl(state, action: PayloadAction<string>) {
      state.virtualTourUrl = action.payload;
    },
    setTermsAccepted(state, action: PayloadAction<boolean>) {
      state.termsAccepted = action.payload;
    },
    setFeatureSummary(state, action: PayloadAction<string>) {
      state.featureSummary = action.payload;
    },
    setInternalNote(state, action: PayloadAction<string>) {
      state.internalNote = action.payload;
    },
    addOwner(state) {
      if (state.owners.length >= 3) return;
      state.owners.push(createOwner(Date.now()));
    },
    updateOwner(
      state,
      action: PayloadAction<{ id: number; key: OwnerEditableField; value: string }>,
    ) {
      const owner = state.owners.find((item) => item.id === action.payload.id);
      if (owner) {
        owner[action.payload.key] = action.payload.value;
      }
    },
    removeOwner(state, action: PayloadAction<number>) {
      if (state.owners.length === 1) return;
      const id = action.payload;
      state.owners = state.owners.filter((owner) => owner.id !== id);
      delete state.ownerDocuments[id];
    },
    goToNextStep(state) {
      const currentIndex = ADD_PROPERTY_STEP_ORDER.indexOf(state.activeStep);
      const nextStep = ADD_PROPERTY_STEP_ORDER[currentIndex + 1];
      if (nextStep) {
        state.activeStep = nextStep;
      }
    },
    goToPreviousStep(state) {
      const currentIndex = ADD_PROPERTY_STEP_ORDER.indexOf(state.activeStep);
      const previousStep = ADD_PROPERTY_STEP_ORDER[currentIndex - 1];
      if (previousStep) {
        state.activeStep = previousStep;
      }
    },
    resetAddPropertyWizard: () => buildFreshInitialState(),
    /** Replaces the entire wizard slice (used when loading a draft from GET submission). */
    rehydrateAddPropertyWizard: (_state, action: PayloadAction<AddPropertyWizardState>) =>
      action.payload,
    /** Merged `payload` from PATCH without changing `activeStep` (partial merge). */
    mergeServerPayloadAfterPatch(state, action: PayloadAction<Record<string, unknown>>) {
      applyPatchResponsePayloadToWizard(state, action.payload);
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
} = addPropertyWizardSlice.actions;

export const selectAddPropertyActiveStep = (state: RootState) => state.addPropertyWizard.activeStep;
export const selectAddPropertyCurrentStepIndex = (state: RootState) =>
  ADD_PROPERTY_STEP_ORDER.indexOf(state.addPropertyWizard.activeStep);
export const selectAddPropertyWizard = (state: RootState) => state.addPropertyWizard;

export default addPropertyWizardSlice.reducer;

export type AddPropertyStepId =
  | "basic-information"
  | "location"
  | "property-details"
  | "owner-information"
  | "pricing"
  | "features-amenities"
  | "media-documents"
  | "review-submit";

export type ListingPurpose = "sale" | "rent";
export type Category = "residential" | "commercial" | "land";

export interface OwnerState {
  id: number;
  fullName: string;
  countryCode: string;
  phone: string;
  email: string;
  socialSecurityId: string;
  nationality: string;
  address: string;
}

export type OwnerEditableField = Exclude<keyof OwnerState, "id">;

export const ADD_PROPERTY_STEP_ORDER: AddPropertyStepId[] = [
  "basic-information",
  "location",
  "property-details",
  "owner-information",
  "pricing",
  "features-amenities",
  "media-documents",
  "review-submit",
];

export function createOwner(id: number): OwnerState {
  return {
    id,
    fullName: "",
    countryCode: "+962",
    phone: "",
    email: "",
    socialSecurityId: "",
    nationality: "",
    address: "",
  };
}

/** API allows only `file_name` and `url` on PATCH for owner KYC files. */
export type OwnerDocumentRef = {
  file_name: string;
  url: string;
};

export type MediaFileRef = OwnerDocumentRef & {
  is_primary?: boolean;
  display_order?: number;
  caption?: string;
};

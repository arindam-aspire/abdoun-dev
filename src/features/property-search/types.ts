import type { ReactNode } from "react";

export type StatusTabKey = "buy" | "rent";

export const STATUS_TABS: StatusTabKey[] = ["buy", "rent"];

export type CategoryKey = "residential" | "commercial" | "land";

export interface SearchFieldsTranslations {
  rent: string;
  buy: string;
  enterLocation: string;
  cityPlaceholder: string;
  areasPlaceholder: string;
  areasSelectAll: string;
  areasDeselectAll: string;
  areasMoreLabel: (count: number) => string;
  residential: string;
  commercial: string;
  land: string;
  priceLabel: string;
  areaLabel: string;
  budgetLabel: string;
  budgetPlaceholder: string;
  budgetMin: string;
  budgetMax: string;
  budgetYearlyMin: string;
  budgetYearlyMax: string;
  budgetYearlyMinLabel: string;
  budgetYearlyMaxLabel: string;
  advanceSearch: string;
  advancedSearch: string;
  clear: string;
  resetSearch: string;
  furnitureStatus: string;
  furnitureFurnished: string;
  furnitureSemiFurnished: string;
  furnitureUnfurnished: string;
  bathrooms: string;
  floorLevel: string;
  parking: string;
  propertyAge: string;
  minArea: string;
  maxArea: string;
  bedrooms: string;
  rooms: string;
  minPlotArea: string;
  maxPlotArea: string;
  allRooms: string;
  allBaths: string;
  allParking: string;
  selectFurnitureStatus: string;
  selectFloorLevel: string;
  selectPropertyAge: string;
  garage: string;
  maidsRoom: string;
  heatingUnderfloor: string;
  fireplace: string;
  swimmingPool: string;
  garden: string;
  airConditioning: string;
  /** Optional label for Save Search button (e.g. on search-result page) */
  saveSearch?: string;
}

export interface SearchFieldsProps {
  translations: SearchFieldsTranslations;
  isRtl: boolean;
  /** Optional node rendered on the same row after Clear (e.g. Save Search button) */
  trailingAction?: ReactNode;
}

export const CATEGORY_OPTIONS: {
  key: CategoryKey;
  labelKey: keyof SearchFieldsTranslations;
}[] = [
  { key: "residential", labelKey: "residential" },
  { key: "commercial", labelKey: "commercial" },
  { key: "land", labelKey: "land" },
];

export const CATEGORY_TO_PROPERTY_TYPES: Record<CategoryKey, string[]> = {
  residential: ["Apartments", "Villas", "Buildings", "Farms"],
  commercial: [
    "Buildings",
    "Offices",
    "Ready Businesses",
    "Shops",
    "Showrooms",
    "Warehouses",
  ],
  land: [
    "Residential Lands",
    "Commercial Lands",
    "Industrial Lands",
    "Agricultural Lands",
    "Mixed Use Lands",
  ],
};

export interface ListingOwnerDetails {
  owner_id?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

/** Single listing for search results (Bayut-style card). */
export interface SearchResultListing {
  id: number;
  title: string;
  price: string;
  /** Buy or rent listing status used by status filter. */
  status?: StatusTabKey;
  /** Listing category used by category filter. */
  category?: CategoryKey;
  /** Property-type option label used in SearchFields (e.g. "Apartments"). */
  searchPropertyType?: string;
  /** City used by city filter. */
  city?: string;
  /** Area/neighborhood used by area filter. */
  areaName?: string;
  propertyType: string;
  images: string[];
  location: string;
  beds: number;
  baths: number;
  area: string;
  /** Optional acres (e.g. "10.05") for land/lot listings; shown with property type when present */
  acres?: string;
  /** Optional for advanced filters */
  furnitureStatus?: "furnished" | "semi-furnished" | "unfurnished";
  floorLevel?: string;
  parking?: number;
  propertyAge?: string;
  /** Amenities for checkbox filters */
  amenities?: string[];
  highlights?: string;
  badges?: string[];
  handover?: string;
  paymentPlan?: string;
  validatedDate?: string;
  brokerName: string;
  brokerLogo?: string;
  /** When true, listing appears when search has ?exclusive=1 (exclusive-only view). */
  exclusive?: boolean;
  /** API snake_case variant of exclusive flag. */
  is_exclusive?: boolean;
  owners?: ListingOwnerDetails[];
}


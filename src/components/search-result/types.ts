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
}

export interface SearchFieldsProps {
  translations: SearchFieldsTranslations;
  isRtl: boolean;
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
    "Offices",
    "Showrooms",
    "Buildings",
    "Warehouse",
    "Businesses",
    "Villas",
  ],
  land: [
    "Residential Lands",
    "Commercial Lands",
    "Industrial Lands",
    "Agricultural Lands",
    "Mixed Use Lands",
  ],
};

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
  highlights?: string;
  badges?: string[];
  handover?: string;
  paymentPlan?: string;
  validatedDate?: string;
  brokerName: string;
  brokerLogo?: string;
}

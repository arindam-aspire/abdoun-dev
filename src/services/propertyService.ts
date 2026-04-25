"use client";

import { createHttpClients } from "@/lib/http";
import type {
  CategoryKey,
  ListingOwnerDetails,
  SearchResultListing,
  StatusTabKey,
} from "@/features/property-search/types";
import type { Property as HomeProperty } from "@/features/public-home/components/types";

type PropertySearchApiItem = {
  id: number;
  title: string | Record<string, string | null | undefined>;
  description?: string | Record<string, string | null | undefined> | null;
  price?: string | null;
  status?: string | null;
  category?: string | null;
  searchPropertyType?: string | null;
  city?: string | null;
  areaName?: string | null;
  propertyType?: string | null;
  images?: string[] | null;
  media?: {
    thumbnail?: string | null;
    images?:
      | string[]
      | Array<{
          url?: string | null;
          thumb_url?: string | null;
        }>
      | null;
  } | null;
  location?:
    | string
    | {
        city?: string | null;
        region?: string | null;
        address?: string | Record<string, string | null | undefined> | null;
      }
    | null;
  location_detail?:
    | {
        city?: string | null;
        region?: string | null;
        address?: string | Record<string, string | null | undefined> | null;
      }
    | null;
  beds?: number | null;
  baths?: number | null;
  area?: string | null;
  acres?: string | null;
  highlights?: string | null;
  badges?: string[] | null;
  exclusive?: boolean | number | string | null;
  is_exclusive?: boolean | number | string | null;
  handover?: string | null;
  paymentPlan?: string | null;
  validatedDate?: string | null;
  brokerName?: string | null;
  brokerLogo?: string | null;
  owners?:
    | Array<{
        owner_id?: string | null;
        full_name?: string | null;
        email?: string | null;
        phone?: string | null;
        is_active?: boolean | null;
      }>
    | null;
};

type PropertySearchApiResponse = {
  data: PropertySearchApiItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type PropertySearchResult = {
  items: SearchResultListing[];
  total: number;
  page: number;
  pageSize: number;
};

export type ExclusivePropertiesResult = {
  items: HomeProperty[];
  total: number;
  page: number;
  pageSize: number;
};

export type PropertyDetailsApiResponse = {
  id: number;
  reference_number?: string | null;
  url?: string | null;
  title: string | Record<string, string | null | undefined>;
  description?: string | Record<string, string | null | undefined> | null;
  category?: string | null;
  property_type?: string | null;
  propertyType?: string | null;
  status?: string | null;
  listing_type?: string | null;
  is_exclusive?: boolean | null;
  selling_price_amount?: number | null;
  selling_price_currency?: string | null;
  rent_price_amount?: number | null;
  rent_price_currency?: string | null;
  /** Nested pricing (may mirror top-level amounts). */
  pricing?: {
    listing_type?: string | null;
    selling_price?: number | null;
    currency?: string | null;
    price_on_request?: boolean | null;
    is_negotiable?: boolean | null;
    installment_available?: boolean | null;
    payment_method?: string | null;
    contract_duration?: string | null;
    rent_commission_percent?: number | null;
  } | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  built_up_area?: number | null;
  details?: { built_up_area?: number | null; maid_rooms?: number | null } | null;
  features?: unknown[] | Record<string, unknown> | null;
  more_features?: unknown[] | Record<string, unknown> | null;
  images?: string[] | null;
  media?: {
    thumbnail?: string | null;
    images?:
      | string[]
      | Array<{
          id?: number;
          url?: string | null;
          thumb_url?: string | null;
          is_primary?: boolean;
          order?: number;
          caption?: string | null;
        }>
      | null;
    videos?: unknown;
    virtual_tour_url?: string | null;
    floor_plan_images?: unknown;
    documents?: Array<{
      id: number;
      url?: string | null;
      thumb_url?: string | null;
      caption?: string | null;
      order?: number;
    }> | null;
  } | null;
  /** Listing agent (when API includes it). */
  agent?: {
    id?: number;
    name?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    photo?: string | null;
    license_number?: string | null;
  } | null;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  location?:
    | string
    | {
        city?: string | null;
        region?: string | null;
        country?: string | null;
        address?: string | Record<string, string | null | undefined> | null;
        latitude?: number | null;
        longitude?: number | null;
        map_embed_url?: string | null;
      }
    | null;
  location_detail?: {
    country_id?: number;
    country?: string | null;
    city_id?: number;
    city?: string | null;
    region_id?: number;
    region?: string | null;
    address?: string | Record<string, string | null | undefined> | null;
    latitude?: number | null;
    longitude?: number | null;
    map_embed_url?: string | null;
  } | null;
};

const { publicApi, authApi } = createHttpClients();

const DEFAULT_STATUS: StatusTabKey = "buy";
const DEFAULT_CATEGORY: CategoryKey = "residential";

const VALID_STATUS = new Set<string>(["buy", "rent"]);
const VALID_CATEGORY = new Set<string>([
  "residential",
  "commercial",
  "land",
  "lands",
]);

const normalizeStatus = (value?: string | null): StatusTabKey | undefined => {
  if (!value) return undefined;
  const v = value.toLowerCase();
  return v === "buy" || v === "rent" ? v : undefined;
};

const normalizeCategory = (
  value?: string | null,
): CategoryKey | undefined => {
  if (!value) return undefined;
  const v = value.toLowerCase();
  if (v === "residential" || v === "commercial") return v;
  if (v === "land" || v === "lands") return "land";
  return undefined;
};

const buildLocation = (areaName?: string | null, city?: string | null): string => {
  if (areaName && city) return `${areaName}, ${city}`;
  if (areaName) return areaName;
  if (city) return city;
  return "";
};

const toDisplayText = (
  field?: string | Record<string, string | null | undefined> | null,
): string => {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.en || field.esp || field.ar || field.fr || Object.values(field).find((v): v is string => Boolean(v)) || "";
};

const toLocalizedField = (
  field?: string | Record<string, string | null | undefined> | null,
): string | Record<string, string> => {
  if (!field) return "";
  if (typeof field === "string") return field;
  return Object.entries(field).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string") acc[key] = value;
    return acc;
  }, {});
};

const extractImageUrls = (item: PropertySearchApiItem): string[] => {
  if (Array.isArray(item.images)) {
    return item.images.filter((img): img is string => typeof img === "string" && img.length > 0);
  }

  const mediaImages = item.media?.images;
  if (Array.isArray(mediaImages)) {
    if (typeof mediaImages[0] === "string") {
      return (mediaImages as string[]).filter((img): img is string => typeof img === "string" && img.length > 0);
    }

    return (mediaImages as Array<{ url?: string | null; thumb_url?: string | null }>)
      .map((img) => img.url || img.thumb_url || "")
      .filter((img): img is string => img.length > 0);
  }

  if (item.media?.thumbnail) return [item.media.thumbnail];
  return [];
};

const extractLocationField = (
  item: PropertySearchApiItem,
): string | Record<string, string> => {
  const locationObj =
    item.location && typeof item.location === "object"
      ? item.location
      : item.location_detail && typeof item.location_detail === "object"
        ? item.location_detail
        : null;

  if (locationObj?.address) {
    if (typeof locationObj.address === "string") return locationObj.address;
    return Object.entries(locationObj.address).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (typeof value === "string") acc[key] = value;
        return acc;
      },
      {},
    );
  }

  if (typeof item.location === "string" && item.location.length > 0) {
    return item.location;
  }

  return buildLocation(item.areaName, item.city);
};

const extractLocationString = (item: PropertySearchApiItem): string => {
  const locationField = extractLocationField(item);
  if (typeof locationField === "string") return locationField;
  return toDisplayText(locationField);
};

const toBooleanFlag = (value: boolean | number | string | null | undefined): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }
  return false;
};

const normalizeOwnerDetails = (
  owners: PropertySearchApiItem["owners"],
): ListingOwnerDetails[] | undefined => {
  if (!Array.isArray(owners)) return undefined;
  const normalized = owners
    .map((owner) => ({
      owner_id: owner.owner_id ?? undefined,
      full_name: owner.full_name?.trim() || undefined,
      email: owner.email?.trim() || undefined,
      phone: owner.phone?.trim() || undefined,
      is_active: owner.is_active ?? undefined,
    }))
    .filter((owner) => owner.full_name || owner.phone || owner.email);
  return normalized.length > 0 ? normalized : undefined;
};

const toListing = (item: PropertySearchApiItem): SearchResultListing => ({
  id: item.id,
  title: toDisplayText(item.title) || "Untitled Property",
  price: item.price || "Contact for price",
  status: normalizeStatus(item.status),
  category: normalizeCategory(item.category),
  searchPropertyType: item.searchPropertyType || undefined,
  city: item.city || undefined,
  areaName: item.areaName || undefined,
  propertyType: item.propertyType || "Property",
  images: extractImageUrls(item),
  location: extractLocationString(item),
  beds: item.beds ?? 0,
  baths: item.baths ?? 0,
  area: item.area ?? "",
  acres: item.acres ?? undefined,
  highlights: item.highlights ?? undefined,
  badges: item.badges ?? undefined,
  exclusive: toBooleanFlag(item.exclusive),
  is_exclusive: toBooleanFlag(item.is_exclusive),
  handover: item.handover ?? undefined,
  paymentPlan: item.paymentPlan ?? undefined,
  validatedDate: item.validatedDate ?? undefined,
  brokerName: item.brokerName || "Abdoun Real Estate",
  brokerLogo: item.brokerLogo ?? undefined,
  owners: normalizeOwnerDetails(item.owners),
});

const FALLBACK_PROPERTY_IMAGE =
  "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=1200";

const toHomeProperty = (item: PropertySearchApiItem): HomeProperty => ({
  id: item.id,
  title: toLocalizedField(item.title) || "Untitled Property",
  price: item.price || "Contact for price",
  badge: "Exclusive",
  image: extractImageUrls(item)[0] || FALLBACK_PROPERTY_IMAGE,
  location: extractLocationField(item),
  beds: item.beds ?? 0,
  baths: item.baths ?? 0,
  area: item.area ?? "0",
  owners: normalizeOwnerDetails(item.owners),
});

const normalizeQueryParams = (rawQueryString: string): URLSearchParams => {
  const params = new URLSearchParams(rawQueryString);

  const status = params.get("status")?.toLowerCase();
  const category = params.get("category")?.toLowerCase();

  if (!status || !VALID_STATUS.has(status)) {
    params.set("status", DEFAULT_STATUS);
  }
  if (!category || !VALID_CATEGORY.has(category)) {
    params.set("category", DEFAULT_CATEGORY);
  }

  const page = Number.parseInt(params.get("page") ?? "1", 10);
  if (!Number.isFinite(page) || page < 1) {
    params.set("page", "1");
  }

  const pageSize = Number.parseInt(params.get("pageSize") ?? "12", 10);
  if (!Number.isFinite(pageSize) || pageSize < 1) {
    params.set("pageSize", "12");
  }

  params.delete("sort");
  params.delete("view");
  return params;
};

export async function fetchPropertiesByQuery(
  rawQueryString: string,
): Promise<PropertySearchResult> {
  const params = normalizeQueryParams(rawQueryString);
  const response = await publicApi.get<PropertySearchApiResponse>("/properties", {
    params,
  });
  return {
    items: response.data.data.map(toListing),
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.pageSize,
  };
}

export async function fetchExclusiveProperties(
  pageSize = 10,
): Promise<ExclusivePropertiesResult> {
  const response = await publicApi.get<PropertySearchApiResponse>(
    "/properties/exclusive",
    {
      params: {
        page: 1,
        pageSize,
      },
    },
  );

  return {
    items: response.data.data.map(toHomeProperty),
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.pageSize,
  };
}

export async function fetchPropertyDetailsById(
  propertyId: number,
): Promise<PropertyDetailsApiResponse> {
  const response = await authApi.get<PropertyDetailsApiResponse>(
    `/properties/${propertyId}`,
  );
  return response.data;
}

type SimilarPropertiesApiResponse =
  | PropertySearchApiItem[]
  | {
      data?: PropertySearchApiItem[] | null;
    };

export async function fetchSimilarPropertiesById(
  propertyId: string,
): Promise<SearchResultListing[]> {
  const response = await publicApi.get<SimilarPropertiesApiResponse>(
    `/properties/${propertyId}/similar`,
  );
  const payload = response.data;
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  return items.map(toListing);
}


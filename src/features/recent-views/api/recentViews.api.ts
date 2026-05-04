"use client";

import { authApi } from "@/lib/http/clients";
import type { SearchResultListing } from "@/features/property-search/types";

type RecentViewApiItem = {
  id?: string;
  user_id?: string;
  property_hash?: number | null;
  property_id?: string;
  viewed_at?: string;
  property?: {
    id?: number | string | null;
    title?: string | Record<string, string | null | undefined> | null;
    price?: string | number | null;
    areaName?: string | null;
    city?: string | null;
    location?: string | { address?: string | Record<string, string | null | undefined> | null } | null;
    propertyType?: string | null;
    beds?: number | null;
    baths?: number | null;
    area?: string | null;
    media?: {
      images?: string[] | null;
    };
    brokerName?: string | null;
  } | null;
};
type RecentViewsListData = {
  items?: RecentViewApiItem[] | null;
};

function toPrice(value: string | number | null | undefined, currency?: string | null): string {
  if (value == null) return "Price on request";
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(numeric)) {
    const formatted = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(numeric);
    return currency ? `${formatted} ${currency}` : formatted;
  }
  const raw = String(value);
  return currency ? `${raw} ${currency}` : raw;
}

function toDisplayText(
  field?: string | Record<string, string | null | undefined> | null,
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return (
    field.en ||
    field.esp ||
    field.ar ||
    field.fr ||
    Object.values(field).find((v): v is string => Boolean(v)) ||
    ""
  );
}

function toListing(item: RecentViewApiItem): SearchResultListing | null {
  const propertyHash = item.property_hash;
  if (typeof propertyHash !== "number") return null;
  const property = item.property;
  const locationFromObject =
    property?.location && typeof property.location === "object"
      ? toDisplayText(property.location.address ?? null)
      : "";
  const location =
    (typeof property?.location === "string" ? property.location : "") ||
    locationFromObject ||
    [property?.areaName, property?.city].filter(Boolean).join(", ") ||
    "Location unavailable";

  return {
    id: propertyHash,
    title: toDisplayText(property?.title ?? null) || "Untitled Property",
    price: toPrice(property?.price, null),
    propertyType: property?.propertyType || "Property",
    images:
      property?.media?.images?.filter(
        (image): image is string => typeof image === "string" && image.length > 0,
      ) ?? [],
    location,
    beds: property?.beds ?? 0,
    baths: property?.baths ?? 0,
    area: property?.area ?? "-",
    brokerName: property?.brokerName || "Abdoun Real Estate",
  };
}

export async function listRecentViewedListings(): Promise<SearchResultListing[]> {
  const response = await authApi.get<RecentViewsListData | RecentViewApiItem[]>(
    "/users/recent-views",
  );
  const data = response.data;
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];
  return items
    .map(toListing)
    .filter((item): item is SearchResultListing => item != null);
}

export async function removeRecentlyViewedProperty(propertyId: number): Promise<boolean> {
  const response = await authApi.delete<boolean>(`/users/recent-views/${propertyId}`);
  return response.data;
}

export async function clearRecentlyViewedProperties(): Promise<boolean> {
  const response = await authApi.delete<boolean>("/users/recent-views");
  return response.data;
}

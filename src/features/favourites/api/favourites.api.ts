"use client";

import { createHttpClients } from "@/lib/http";

type StandardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  error?: string | null;
};

const { authApi } = createHttpClients();

const unwrap = <T,>(response: StandardApiResponse<T>): T => response.data;

type FavoriteRequestPayload = {
  property_hash: number;
};

type FavoriteListItem = {
  property_hash?: number | null;
  property?: {
    id?: number | null;
    title?: { en?: string; ar?: string; fr?: string; esp?: string } | null;
    price?: string | null;
    status?: "buy" | "rent" | null;
    category?: "residential" | "commercial" | "land" | null;
    searchPropertyType?: string | null;
    city?: string | null;
    areaName?: string | null;
    propertyType?: string | null;
    media?: {
      thumbnail?: string | null;
      images?: Array<{ thumb_url?: string | null; url?: string | null }> | null;
    } | null;
    location?: {
      address?: { en?: string; ar?: string; fr?: string; esp?: string } | null;
      city?: string | null;
      region?: string | null;
    } | null;
    beds?: number | null;
    baths?: number | null;
    area?: string | number | null;
    highlights?: string | null;
    badges?: string[] | null;
    validatedDate?: string | null;
    brokerName?: string | null;
    brokerLogo?: string | null;
    owners?: Array<{
      owner_id?: string;
      full_name?: string;
      phone?: string;
      email?: string;
      is_active?: boolean;
    }> | null;
    is_exclusive?: boolean | null;
  } | null;
};

type FavoriteListResponseData = {
  items?: FavoriteListItem[] | null;
  total?: number;
};

export async function addFavoriteProperty(propertyId: number): Promise<true> {
  const response = await authApi.post<StandardApiResponse<true>>(
    "/favorites",
    { property_hash: propertyId } satisfies FavoriteRequestPayload,
  );
  return unwrap(response.data);
}

export async function removeFavoriteProperty(propertyId: number): Promise<true> {
  const response = await authApi.delete<StandardApiResponse<true>>(
    `/favorites/${propertyId}`,
  );
  return unwrap(response.data);
}

export async function bulkAddFavoriteProperties(propertyIds: number[]): Promise<true> {
  const response = await authApi.post<StandardApiResponse<true>>(
    "/favorites/bulk",
    { property_hashes: propertyIds },
  );
  return unwrap(response.data);
}

export async function listFavoriteProperties(): Promise<number[]> {
  const items = await listFavoritePropertyItems();
  return items
    .map((item) => {
      if (typeof item.property_hash === "number") return item.property_hash;
      if (typeof item.property?.id === "number") return item.property.id;
      return null;
    })
    .filter((item): item is number => typeof item === "number");
}

export async function listFavoritePropertyItems(): Promise<FavoriteListItem[]> {
  const response = await authApi.get<
    StandardApiResponse<FavoriteListResponseData | number[]>
  >("/favorites");
  const data = unwrap(response.data);

  // Backward compatible: support both [number] and { items: [...] } shapes.
  if (Array.isArray(data)) {
    return data
      .filter((item): item is number => typeof item === "number")
      .map((propertyId) => ({ property_hash: propertyId }));
  }

  return Array.isArray(data?.items) ? data.items : [];
}

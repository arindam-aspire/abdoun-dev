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
  const response = await authApi.get<
    StandardApiResponse<FavoriteListResponseData | number[]>
  >("/favorites");
  const data = unwrap(response.data);

  // Backward compatible: support both [number] and { items: [...] } shapes.
  if (Array.isArray(data)) {
    return data.filter((item): item is number => typeof item === "number");
  }

  const items = Array.isArray(data?.items) ? data.items : [];
  return items
    .map((item) => {
      if (typeof item.property_hash === "number") return item.property_hash;
      if (typeof item.property?.id === "number") return item.property.id;
      return null;
    })
    .filter((item): item is number => typeof item === "number");
}

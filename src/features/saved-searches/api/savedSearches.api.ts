"use client";

import { authApi } from "@/lib/http/clients";
import type { SavedSearch } from "@/features/saved-searches/types";

type SavedSearchApiItem = {
  id: string;
  name: string;
  search_criteria?: Record<string, unknown> | null;
  query_string?: string;
  notification_enabled?: boolean;
  last_run_at?: string | null;
};

type SavedSearchListData = {
  items?: SavedSearchApiItem[] | null;
  total?: number;
};

export type ListSavedSearchItemsParams = {
  /** 1-based page index */
  page?: number;
  /** items per page */
  pageSize?: number;
};

export type SavedSearchListPage = {
  items: SavedSearch[];
  /**
   * Total saved searches count (when API supports pagination).
   * If undefined/null, caller should treat as "unknown" and fall back.
   */
  total?: number;
};

type SavedSearchCreateRequest = {
  name: string;
  search_criteria: Record<string, unknown>;
  notification_enabled: boolean;
};

type SavedSearchUpdateNameRequest = {
  name: string;
};

type SavedSearchUpdateRequest = {
  name?: string;
  search_criteria?: Record<string, unknown>;
  notification_enabled?: boolean;
};

const buildSearchCriteria = (queryString: string): Record<string, unknown> => {
  const params = new URLSearchParams(queryString);
  return Object.fromEntries(params.entries());
};

const toSavedSearch = (item: SavedSearchApiItem): SavedSearch => ({
  id: item.id,
  name: item.name,
  queryString: item.query_string ?? "",
  searchCriteria: item.search_criteria ?? {},
  notificationEnabled: item.notification_enabled ?? false,
  lastRunAt: item.last_run_at ?? null,
  createdAt: item.last_run_at ? Date.parse(item.last_run_at) || Date.now() : Date.now(),
});

let listSavedSearchesInFlight: Promise<SavedSearch[]> | null = null;

export async function listSavedSearchItems(
  params?: ListSavedSearchItemsParams,
): Promise<SavedSearchListPage> {
  const page = params?.page;
  const pageSize = params?.pageSize;
  const query =
    page || pageSize
      ? {
          page: page ?? 1,
          pageSize: pageSize,
        }
      : undefined;

  const response = await authApi.get<SavedSearchListData | SavedSearchApiItem[]>(
    "/saved-searches",
    query ? { params: query } : undefined,
  );
  const data = response.data;

  // Backward compatible: support both [items] and { items: [...], total } shapes.
  if (Array.isArray(data)) {
    const items = data.map(toSavedSearch);
    return { items, total: items.length };
  }

  const items = Array.isArray(data?.items) ? data.items.map(toSavedSearch) : [];
  return {
    items,
    total: typeof data?.total === "number" ? data.total : undefined,
  };
}

export async function listSavedSearches(): Promise<SavedSearch[]> {
  if (listSavedSearchesInFlight) {
    return listSavedSearchesInFlight;
  }
  listSavedSearchesInFlight = (async () => {
    try {
      const page = await listSavedSearchItems();
      return page.items;
    } finally {
      listSavedSearchesInFlight = null;
    }
  })();
  return listSavedSearchesInFlight;
}

export async function createSavedSearch(payload: {
  name: string;
  queryString: string;
}): Promise<SavedSearch> {
  const requestPayload: SavedSearchCreateRequest = {
    name: payload.name,
    search_criteria: buildSearchCriteria(payload.queryString),
    notification_enabled: true,
  };
  const response = await authApi.post<SavedSearchApiItem>(
    "/saved-searches",
    requestPayload,
  );
  return toSavedSearch(response.data);
}

export async function deleteSavedSearch(id: string): Promise<true> {
  const response = await authApi.delete<true>(`/saved-searches/${id}`);
  return response.data;
}

export async function updateSavedSearchName(
  id: string,
  payload: SavedSearchUpdateNameRequest,
): Promise<SavedSearch> {
  return updateSavedSearch(id, payload);
}

export async function updateSavedSearch(
  id: string,
  payload: SavedSearchUpdateRequest,
): Promise<SavedSearch> {
  const response = await authApi.patch<SavedSearchApiItem>(
    `/saved-searches/${id}`,
    payload,
  );
  return toSavedSearch(response.data);
}

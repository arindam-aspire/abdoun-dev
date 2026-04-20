import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  addSavedSearch,
  clearSavedSearches,
  hydrateSavedSearches,
  removeSavedSearch,
  updateSavedSearch,
} from "@/features/saved-searches/savedSearchesSlice";
import type { SavedSearch } from "@/features/saved-searches/types";
import { getApiErrorMessage } from "@/lib/http/apiError";
import {
  createSavedSearch,
  deleteSavedSearch,
  listSavedSearches,
  updateSavedSearch as updateSavedSearchApi,
  updateSavedSearchName,
} from "@/features/saved-searches/api/savedSearches.api";
import { selectCurrentUser } from "@/store/selectors";

export type UseSavedSearchesResult = {
  items: SavedSearch[];
  add: (payload: { name: string; queryString: string }) => Promise<{ ok: boolean; message?: string }>;
  remove: (id: string) => Promise<{ ok: boolean; message?: string }>;
  rename: (id: string, name: string) => Promise<{ ok: boolean; message?: string }>;
  update: (payload: {
    id: string;
    name: string;
    queryString: string;
    searchCriteria?: Record<string, unknown>;
    notificationEnabled?: boolean;
  }) => Promise<{ ok: boolean; message?: string }>;
  clearAll: () => void;
  load: () => Promise<{ ok: boolean; message?: string }>;
  isLoading: boolean;
  runUrl: (args: { locale: string; queryString: string }) => string;
};

export function useSavedSearches(): UseSavedSearchesResult {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const items = useAppSelector((state) => state.savedSearches.items) as SavedSearch[];
  const isLoading = useAppSelector((state) => state.savedSearches.hydratedUserId == null);

  const load = useCallback(async () => {
    if (!user) {
      dispatch(clearSavedSearches());
      return { ok: false, message: "Please sign in first." };
    }
    try {
      const savedSearches = await listSavedSearches();
      dispatch(hydrateSavedSearches({ userId: user.id, items: savedSearches }));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: getApiErrorMessage(error) };
    }
  }, [dispatch, user]);

  const add = useCallback(
    async (payload: { name: string; queryString: string }) => {
      if (!user) {
        return { ok: false, message: "Please sign in first." };
      }
      try {
        const created = await createSavedSearch(payload);
        dispatch(addSavedSearch(created));
        return { ok: true };
      } catch (error) {
        return { ok: false, message: getApiErrorMessage(error) };
      }
    },
    [dispatch, user],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteSavedSearch(id);
        dispatch(removeSavedSearch(id));
        return { ok: true };
      } catch (error) {
        return { ok: false, message: getApiErrorMessage(error) };
      }
    },
    [dispatch],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      try {
        const updated = await updateSavedSearchName(id, { name });
        dispatch(updateSavedSearch({ id: updated.id, name: updated.name }));
        return { ok: true };
      } catch (error) {
        return { ok: false, message: getApiErrorMessage(error) };
      }
    },
    [dispatch],
  );

  const clearAll = useCallback(() => {
    dispatch(clearSavedSearches());
  }, [dispatch]);

  const update = useCallback(
    async (payload: {
      id: string;
      name: string;
      queryString: string;
      searchCriteria?: Record<string, unknown>;
      notificationEnabled?: boolean;
    }) => {
      try {
        const fallbackCriteria = Object.fromEntries(
          new URLSearchParams(payload.queryString).entries(),
        );
        const criteria =
          payload.searchCriteria && Object.keys(payload.searchCriteria).length > 0
            ? payload.searchCriteria
            : fallbackCriteria;

        const updated = await updateSavedSearchApi(payload.id, {
          name: payload.name,
          search_criteria: criteria,
          notification_enabled: payload.notificationEnabled ?? true,
        });
        dispatch(updateSavedSearch({ id: updated.id, name: updated.name }));
        return { ok: true };
      } catch (error) {
        return { ok: false, message: getApiErrorMessage(error) };
      }
    },
    [dispatch],
  );

  const runUrl = useCallback(
    (args: { locale: string; queryString: string }) =>
      `/${args.locale}/search-result${args.queryString ? `?${args.queryString}` : ""}`,
    [],
  );

  return useMemo(
    () => ({ items, add, remove, rename, update, clearAll, load, isLoading, runUrl }),
    [add, clearAll, items, remove, rename, update, load, isLoading, runUrl],
  );
}


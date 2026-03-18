import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  addSavedSearch,
  clearSavedSearches,
  removeSavedSearch,
  updateSavedSearch,
} from "@/features/saved-searches/savedSearchesSlice";
import type { SavedSearch } from "@/features/saved-searches/types";

export type UseSavedSearchesResult = {
  items: SavedSearch[];
  add: (payload: { name: string; queryString: string }) => void;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  clearAll: () => void;
  runUrl: (args: { locale: string; queryString: string }) => string;
};

export function useSavedSearches(): UseSavedSearchesResult {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.savedSearches.items) as SavedSearch[];

  const add = useCallback(
    (payload: { name: string; queryString: string }) => {
      dispatch(addSavedSearch(payload));
    },
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => {
      dispatch(removeSavedSearch(id));
    },
    [dispatch],
  );

  const rename = useCallback(
    (id: string, name: string) => {
      dispatch(updateSavedSearch({ id, name }));
    },
    [dispatch],
  );

  const clearAll = useCallback(() => {
    dispatch(clearSavedSearches());
  }, [dispatch]);

  const runUrl = useCallback(
    (args: { locale: string; queryString: string }) =>
      `/${args.locale}/search-result${args.queryString ? `?${args.queryString}` : ""}`,
    [],
  );

  return useMemo(
    () => ({ items, add, remove, rename, clearAll, runUrl }),
    [add, clearAll, items, remove, rename, runUrl],
  );
}


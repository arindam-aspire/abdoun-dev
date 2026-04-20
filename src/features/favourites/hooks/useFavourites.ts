import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { clearFavourites, toggleFavourite } from "@/features/favourites/favouritesSlice";
import { selectCurrentUser } from "@/store/selectors";
import { getApiErrorMessage } from "@/lib/http/apiError";
import {
  addFavoriteProperty,
  removeFavoriteProperty,
} from "@/features/favourites/api/favourites.api";

type ToggleFavouriteResult = {
  ok: boolean;
  action: "added" | "removed" | null;
  message?: string;
};

export type UseFavouritesResult = {
  /** Raw favourite ids for current session (still stored in Redux). */
  propertyIds: number[];
  /** Whether the current authenticated user has this property favourited. */
  isFavourite: (propertyId: number) => boolean;
  /** Toggle favourite for the current user. No-ops if not authenticated. */
  toggleFavouriteForUser: (propertyId: number) => Promise<ToggleFavouriteResult>;
  /** Clear favourites in Redux (also clears hydrated user id). */
  clearAll: () => void;
  /** Convenience for consumers that need auth-gating. */
  isAuthenticated: boolean;
};

export function useFavourites(): UseFavouritesResult {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const propertyIds = useAppSelector((state) => state.favourites.propertyIds);

  const isAuthenticated = Boolean(user);

  const isFavourite = useCallback(
    (propertyId: number) => (user ? propertyIds.includes(propertyId) : false),
    [propertyIds, user],
  );

  const toggleFavouriteForUser = useCallback(
    async (propertyId: number) => {
      if (!user) return { ok: false, action: null, message: "Please sign in first." };

      const wasFavourite = propertyIds.includes(propertyId);
      dispatch(toggleFavourite(propertyId));

      try {
        if (wasFavourite) {
          await removeFavoriteProperty(propertyId);
          return { ok: true, action: "removed" } satisfies ToggleFavouriteResult;
        }
        await addFavoriteProperty(propertyId);
        return { ok: true, action: "added" } satisfies ToggleFavouriteResult;
      } catch (error) {
        // Roll back local optimistic update if API call fails.
        dispatch(toggleFavourite(propertyId));
        return {
          ok: false,
          action: null,
          message: getApiErrorMessage(error),
        } satisfies ToggleFavouriteResult;
      }
    },
    [dispatch, propertyIds, user],
  );

  const clearAll = useCallback(() => {
    dispatch(clearFavourites());
  }, [dispatch]);

  return useMemo(
    () => ({
      propertyIds,
      isFavourite,
      toggleFavouriteForUser,
      clearAll,
      isAuthenticated,
    }),
    [clearAll, isAuthenticated, isFavourite, propertyIds, toggleFavouriteForUser],
  );
}


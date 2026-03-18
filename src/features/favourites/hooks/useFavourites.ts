import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { clearFavourites, toggleFavourite } from "@/features/favourites/favouritesSlice";
import { selectCurrentUser } from "@/store/selectors";

export type UseFavouritesResult = {
  /** Raw favourite ids for current session (still stored in Redux). */
  propertyIds: number[];
  /** Whether the current authenticated user has this property favourited. */
  isFavourite: (propertyId: number) => boolean;
  /** Toggle favourite for the current user. No-ops if not authenticated. */
  toggleFavouriteForUser: (propertyId: number) => void;
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
    (propertyId: number) => {
      if (!user) return;
      dispatch(toggleFavourite(propertyId));
    },
    [dispatch, user],
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


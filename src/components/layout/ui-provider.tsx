"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { clearFavourites, hydrateFavourites } from "@/features/favourites/favouritesSlice";
import {
  clearSavedSearches,
  hydrateSavedSearches,
  type SavedSearchItem,
} from "@/features/savedSearches/savedSearchesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";

const buildFavouritesStorageKey = (userId: string) =>
  `abdoun:favourites:${userId}`;

const buildSavedSearchesStorageKey = (userId: string) =>
  `abdoun:savedSearches:${userId}`;

export function UiProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const locale = useLocale();
  const user = useAppSelector((state) => state.auth.user);
  const propertyIds = useAppSelector((state) => state.favourites.propertyIds);
  const hydratedUserId = useAppSelector((state) => state.favourites.hydratedUserId);
  const savedSearchesItems = useAppSelector((state) => state.savedSearches.items);
  const savedSearchesHydratedUserId = useAppSelector(
    (state) => state.savedSearches.hydratedUserId,
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("lang", locale);
    root.dataset.theme = theme;
    root.dir = locale === "ar" ? "rtl" : "ltr";
  }, [theme, locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!user) {
      dispatch(clearFavourites());
      dispatch(clearSavedSearches());
      return;
    }

    const key = buildFavouritesStorageKey(user.id);
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      dispatch(hydrateFavourites({ userId: user.id, propertyIds: [] }));
    } else {
      try {
        const parsed = JSON.parse(raw);
        const favoriteIds = Array.isArray(parsed)
          ? parsed.filter((item): item is number => typeof item === "number")
          : [];
        dispatch(hydrateFavourites({ userId: user.id, propertyIds: favoriteIds }));
      } catch {
        dispatch(hydrateFavourites({ userId: user.id, propertyIds: [] }));
      }
    }

    const ssKey = buildSavedSearchesStorageKey(user.id);
    const ssRaw = window.localStorage.getItem(ssKey);
    if (!ssRaw) {
      dispatch(hydrateSavedSearches({ userId: user.id, items: [] }));
    } else {
      try {
        const parsed = JSON.parse(ssRaw);
        const items = Array.isArray(parsed)
          ? (parsed as SavedSearchItem[]).filter(
              (i) =>
                i &&
                typeof i.id === "string" &&
                typeof i.name === "string" &&
                typeof i.queryString === "string" &&
                typeof i.createdAt === "number",
            )
          : [];
        dispatch(hydrateSavedSearches({ userId: user.id, items }));
      } catch {
        dispatch(hydrateSavedSearches({ userId: user.id, items: [] }));
      }
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user || hydratedUserId !== user.id) return;

    const key = buildFavouritesStorageKey(user.id);
    window.localStorage.setItem(key, JSON.stringify(propertyIds));
  }, [hydratedUserId, propertyIds, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user || savedSearchesHydratedUserId !== user.id) return;

    const key = buildSavedSearchesStorageKey(user.id);
    window.localStorage.setItem(key, JSON.stringify(savedSearchesItems));
  }, [savedSearchesHydratedUserId, savedSearchesItems, user]);

  return <>{children}</>;
}


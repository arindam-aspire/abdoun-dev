"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { clearFavourites, hydrateFavourites } from "@/features/favourites/favouritesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";

const buildFavouritesStorageKey = (userId: string) =>
  `abdoun:favourites:${userId}`;

export function UiProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const locale = useLocale();
  const user = useAppSelector((state) => state.auth.user);
  const propertyIds = useAppSelector((state) => state.favourites.propertyIds);
  const hydratedUserId = useAppSelector((state) => state.favourites.hydratedUserId);

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
      return;
    }

    const key = buildFavouritesStorageKey(user.id);
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      dispatch(hydrateFavourites({ userId: user.id, propertyIds: [] }));
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const favoriteIds = Array.isArray(parsed)
        ? parsed.filter((item): item is number => typeof item === "number")
        : [];
      dispatch(hydrateFavourites({ userId: user.id, propertyIds: favoriteIds }));
    } catch {
      dispatch(hydrateFavourites({ userId: user.id, propertyIds: [] }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user || hydratedUserId !== user.id) return;

    const key = buildFavouritesStorageKey(user.id);
    window.localStorage.setItem(key, JSON.stringify(propertyIds));
  }, [hydratedUserId, propertyIds, user]);

  return <>{children}</>;
}


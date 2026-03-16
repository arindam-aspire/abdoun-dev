"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { clearFavourites, hydrateFavourites } from "@/features/favourites/favouritesSlice";
import { setClientLogoutNavigate } from "@/lib/auth/adapters/browserLogoutHandler";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/http/createClient";
import { forceLocalLogout } from "@/lib/auth/logoutClient";
import {
  clearSavedSearches,
  hydrateSavedSearches,
  type SavedSearchItem,
} from "@/features/savedSearches/savedSearchesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import {
  clearAuthSession,
  persistAuthSession,
  readAuthSessionFromBrowser,
} from "@/lib/auth/sessionCookies";
import { selectCurrentUser } from "@/store/selectors";
import { getCurrentUser, enrichWithPhoneParts, toSessionUserForProfile } from "@/services/authService";

const buildFavouritesStorageKey = (userId: string) =>
  `abdoun:favourites:${userId}`;

const buildSavedSearchesStorageKey = (userId: string) =>
  `abdoun:savedSearches:${userId}`;

export function UiProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useAppSelector((state) => state.ui.theme);
  const locale = useLocale();
  const user = useAppSelector(selectCurrentUser);
  const propertyIds = useAppSelector((state) => state.favourites.propertyIds);
  const hydratedUserId = useAppSelector((state) => state.favourites.hydratedUserId);
  const savedSearchesItems = useAppSelector((state) => state.savedSearches.items);
  const savedSearchesHydratedUserId = useAppSelector(
    (state) => state.savedSearches.hydratedUserId,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      if (user.requiresPasswordSet) {
        router.push(`/${locale}/force-change-password`);
      }
      return;
    }

    const fromCookie = readAuthSessionFromBrowser();
    if (fromCookie) {
      dispatch(login(enrichWithPhoneParts(fromCookie)));
      return;
    }

    const accessToken = window.localStorage.getItem("accessToken");
    const refreshToken = window.localStorage.getItem("refreshToken");
    if (!accessToken || !refreshToken) return;

    void (async () => {
      try {
        const me = await getCurrentUser();

        if (me.requires_password_set) {
          clearAuthSession();
          router.push(`/${locale}/force-change-password`);
          return;
        }

        const sessionUser = toSessionUserForProfile(me);
        persistAuthSession(sessionUser);
        dispatch(login(sessionUser));
      } catch {
        // Tokens are invalid/expired and refresh failed (or backend unavailable).
        // Keep UI unauthenticated and clear cookies to prevent stale "logged in" role.
        clearAuthSession();
      }
    })();
  }, [dispatch, user, router, locale]);

  useEffect(() => {
    const loginPath = `/${locale}/login`;
    setClientLogoutNavigate((path) => router.push(path || loginPath));
    return () => setClientLogoutNavigate(null);
  }, [router, locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: CustomEvent<{ message: string }>) => {
      const message = e.detail?.message ?? "Invalid or expired token";
      forceLocalLogout(dispatch, user?.id, message, () => router.push(`/${locale}/login`));
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handler as EventListener);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handler as EventListener);
  }, [dispatch, locale, router, user?.id]);

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


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isRtlLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { clearFavourites, hydrateFavourites } from "@/features/favourites/favouritesSlice";
import { setClientLogoutNavigate } from "@/lib/auth/adapters/browserLogoutHandler";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/http/createClient";
import { forceLocalLogout } from "@/lib/auth/logoutClient";
import {
  clearSavedSearches,
  hydrateSavedSearches,
} from "@/features/saved-searches/savedSearchesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import {
  clearSession,
  getCurrentSession,
  getStoredTokens,
  persistSession,
} from "@/lib/auth/sessionManager";
import { selectCurrentUser } from "@/store/selectors";
import { enrichWithPhoneParts } from "@/lib/auth/enrichSessionUser";
import { getCurrentUser, toSessionUserForProfile } from "@/features/auth/api/auth.api";
import { listFavoriteProperties } from "@/features/favourites/api/favourites.api";
import { listSavedSearches } from "@/features/saved-searches/api/savedSearches.api";

export function UiProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useAppSelector((state) => state.ui.theme);
  const locale = useLocale();
  const user = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // One-time cleanup for legacy persisted keys now replaced by API hydration.
    Object.keys(window.localStorage)
      .filter(
        (key) =>
          key.startsWith("abdoun:favourites:") ||
          key.startsWith("abdoun:savedSearches:"),
      )
      .forEach((key) => window.localStorage.removeItem(key));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      if (user.requiresPasswordSet) {
        router.push(`/${locale}/force-change-password`);
      }
      return;
    }

    const session = getCurrentSession();
    if (session?.user) {
      dispatch(login(enrichWithPhoneParts(session.user)));
      return;
    }

    const tokens = session?.tokens ?? getStoredTokens();
    if (!tokens) return;

    void (async () => {
      try {
        const me = await getCurrentUser();

        if (me.requires_password_set) {
          clearSession();
          router.push(`/${locale}/force-change-password`);
          return;
        }

        const sessionUser = toSessionUserForProfile(me);
        persistSession({ user: sessionUser });
        dispatch(login(sessionUser));
      } catch {
        // Tokens are invalid/expired and refresh failed (or backend unavailable).
        // Keep UI unauthenticated and clear cookies to prevent stale "logged in" role.
        clearSession();
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
    root.dir = isRtlLocale(locale) ? "rtl" : "ltr";
  }, [theme, locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!user) {
      dispatch(clearFavourites());
      dispatch(clearSavedSearches());
      return;
    }

    void (async () => {
      try {
        const favoriteIds = await listFavoriteProperties();
        const safeFavoriteIds = Array.isArray(favoriteIds)
          ? favoriteIds.filter((item): item is number => typeof item === "number")
          : [];
        dispatch(hydrateFavourites({ userId: user.id, propertyIds: safeFavoriteIds }));
      } catch {
        dispatch(hydrateFavourites({ userId: user.id, propertyIds: [] }));
      }
    })();

    void (async () => {
      try {
        const savedSearches = await listSavedSearches();
        dispatch(hydrateSavedSearches({ userId: user.id, items: savedSearches }));
      } catch {
        dispatch(hydrateSavedSearches({ userId: user.id, items: [] }));
      }
    })();
  }, [dispatch, user]);

  return <>{children}</>;
}


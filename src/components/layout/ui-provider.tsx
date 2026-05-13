"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isRtlLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { clearFavourites, hydrateFavourites } from "@/features/favourites/favouritesSlice";
import { setClientLogoutNavigate } from "@/lib/auth/adapters/browserLogoutHandler";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/http/createClient";
import {
  DEFAULT_SESSION_EXPIRED_MESSAGE,
  forceLocalLogout,
  SESSION_EXPIRED_MESSAGE_KEY,
} from "@/lib/auth/logoutClient";
import {
  clearSavedSearches,
  hydrateSavedSearches,
} from "@/features/saved-searches/savedSearchesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import {
  clearSession,
  getCurrentSession,
  getStoredAccessToken,
  getStoredTokens,
  persistSession,
} from "@/lib/auth/sessionManager";
import { selectCurrentUser } from "@/store/selectors";
import { enrichWithPhoneParts } from "@/lib/auth/enrichSessionUser";
import { toSessionUserForProfile } from "@/features/auth/api/auth.api";
import { getCurrentUserDeduped } from "@/lib/auth/currentUserRequest";
import { listFavoriteProperties } from "@/features/favourites/api/favourites.api";
import { listSavedSearches } from "@/features/saved-searches/api/savedSearches.api";
import { Toast } from "@/components/ui";
import { consumeRouteToast, ROUTE_TOAST_EVENT, type RouteToastPayload } from "@/lib/ui/routeToast";
import {
  archiveNotification,
  flagNotificationsDesync,
  mergeNotificationsPage,
  markNotificationRead,
  resetNotificationsState,
  setNotificationsLoading,
  setPollingFallbackActive,
  setRealtimeConnected,
  setReconnectAttempts,
  setUnreadCount,
  upsertRealtimeNotification,
} from "@/features/notifications/notificationsSlice";
import {
  getNotificationsUnreadCount,
  listNotifications,
} from "@/features/notifications/api/notifications.api";
import {
  NotificationsRealtime,
  resolveNotificationsSocketUrl,
} from "@/features/notifications/realtime/notificationsRealtime";
import { notificationItemFromPayload } from "@/features/notifications/normalizeNotification";

export function UiProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useAppSelector((state) => state.ui.theme);
  const locale = useLocale();
  const user = useAppSelector(selectCurrentUser);
  const [toast, setToast] = useState<RouteToastPayload | null>(null);

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
      const tokens = session.tokens ?? getStoredTokens();
      if (tokens) {
        void (async () => {
          try {
            const me = await getCurrentUserDeduped();
            if (me.requires_password_set) {
              clearSession();
              router.push(`/${locale}/force-change-password`);
              return;
            }
            const sessionUser = toSessionUserForProfile(me);
            persistSession({ user: sessionUser });
            dispatch(login(sessionUser));
          } catch {
            dispatch(login(enrichWithPhoneParts(session.user)));
          }
        })();
      } else {
        dispatch(login(enrichWithPhoneParts(session.user)));
      }
      return;
    }

    const tokens = session?.tokens ?? getStoredTokens();
    if (!tokens) return;

    void (async () => {
      try {
        const me = await getCurrentUserDeduped();

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
    const fallbackPath = `/${locale}`;
    setClientLogoutNavigate((path) => router.push(path || fallbackPath));
    return () => setClientLogoutNavigate(null);
  }, [router, locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: CustomEvent<{ message: string }>) => {
      void e;
      forceLocalLogout(dispatch, user?.id, DEFAULT_SESSION_EXPIRED_MESSAGE, () =>
        router.push(`/${locale}`),
      );
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handler as EventListener);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handler as EventListener);
  }, [dispatch, locale, router, user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const consumePendingToast = () => {
      const sessionExpiredMessage = window.sessionStorage.getItem(SESSION_EXPIRED_MESSAGE_KEY);
      if (sessionExpiredMessage) {
        window.sessionStorage.removeItem(SESSION_EXPIRED_MESSAGE_KEY);
        setToast({ kind: "error", message: sessionExpiredMessage });
        return;
      }

      const routeToast = consumeRouteToast();
      if (routeToast) {
        setToast(routeToast);
      }
    };

    consumePendingToast();
    window.addEventListener(ROUTE_TOAST_EVENT, consumePendingToast);
    return () => window.removeEventListener(ROUTE_TOAST_EVENT, consumePendingToast);
  }, [pathname]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    let pollingTimer: ReturnType<typeof setInterval> | null = null;
    let pageRefreshTimer: ReturnType<typeof setTimeout> | null = null;
    let shouldRefreshFirstPage = false;
    let pollingCycles = 0;

    const stopPolling = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
      dispatch(setPollingFallbackActive(false));
    };

    const startPolling = () => {
      if (pollingTimer) return;
      dispatch(setPollingFallbackActive(true));
      pollingTimer = setInterval(() => {
        void (async () => {
          try {
            const unreadCountPromise = getNotificationsUnreadCount();
            const refreshOnThisCycle = shouldRefreshFirstPage || pollingCycles % 3 === 0;
            pollingCycles += 1;
            const firstPagePromise = refreshOnThisCycle
              ? listNotifications({ page: 1, pageSize: 20, includeArchived: false })
              : Promise.resolve(null);
            const [unreadCount, firstPage] = await Promise.all([
              unreadCountPromise,
              firstPagePromise,
            ]);
            if (!isMounted) return;
            dispatch(setUnreadCount(unreadCount));
            if (firstPage) {
              dispatch(
                mergeNotificationsPage({
                  items: firstPage.items,
                  nextCursor: firstPage.nextCursor,
                  hasMore: firstPage.hasMore,
                  replace: true,
                }),
              );
              shouldRefreshFirstPage = false;
            }
          } catch {
            // Keep polling alive; no UI disruption on transient failures.
          }
        })();
      }, 12_000);
    };

    if (!user) {
      dispatch(resetNotificationsState());
      return () => {
        isMounted = false;
        stopPolling();
      };
    }

    const bootstrapFromApi = async () => {
      dispatch(setNotificationsLoading());
      try {
        const [firstPage, unread] = await Promise.all([
          listNotifications({ page: 1, pageSize: 20, includeArchived: false }),
          getNotificationsUnreadCount(),
        ]);
        if (!isMounted) return;
        dispatch(
          mergeNotificationsPage({
            items: firstPage.items,
            nextCursor: firstPage.nextCursor,
            hasMore: firstPage.hasMore,
            replace: true,
          }),
        );
        dispatch(setUnreadCount(unread));
      } catch {
        if (!isMounted) return;
        dispatch(flagNotificationsDesync());
      }
    };

    const extractIdFromEvent = (payload: unknown): string | null => {
      if (!payload || typeof payload !== "object") return null;
      const data = payload as Record<string, unknown>;
      const idCandidate =
        data.notification_id ?? data.id ?? (typeof data.notification === "object" ? (data.notification as Record<string, unknown>).id : undefined);
      if (typeof idCandidate === "string" || typeof idCandidate === "number") return String(idCandidate);
      return null;
    };

    const scheduleFirstPageRefresh = () => {
      shouldRefreshFirstPage = true;
      if (pageRefreshTimer) return;
      pageRefreshTimer = setTimeout(() => {
        pageRefreshTimer = null;
        void (async () => {
          try {
            const firstPage = await listNotifications({
              page: 1,
              pageSize: 20,
              includeArchived: false,
            });
            if (!isMounted) return;
            dispatch(
              mergeNotificationsPage({
                items: firstPage.items,
                nextCursor: firstPage.nextCursor,
                hasMore: firstPage.hasMore,
                replace: true,
              }),
            );
            shouldRefreshFirstPage = false;
          } catch {
            if (!isMounted) return;
            dispatch(flagNotificationsDesync());
          }
        })();
      }, 1500);
    };

    const realtime = new NotificationsRealtime({
      callbacks: {
        onOpen: () => {
          if (!isMounted) return;
          dispatch(setRealtimeConnected(true));
          stopPolling();
          void (async () => {
            try {
              const unread = await getNotificationsUnreadCount();
              if (!isMounted) return;
              dispatch(setUnreadCount(unread));
            } catch {
              // No-op.
            }
          })();
        },
        onClose: ({ expected }) => {
          if (!isMounted) return;
          dispatch(setRealtimeConnected(false));
          if (!expected) startPolling();
        },
        onReconnectAttempt: (attempt) => {
          if (!isMounted) return;
          dispatch(setReconnectAttempts(attempt));
        },
        onNotificationCreated: (payload) => {
          if (!isMounted) return;
          const item = notificationItemFromPayload(payload);
          if (!item) return;
          dispatch(upsertRealtimeNotification(item));
          scheduleFirstPageRefresh();
        },
        onNotificationRead: (payload) => {
          if (!isMounted) return;
          const id = extractIdFromEvent(payload);
          if (id) dispatch(markNotificationRead({ id }));
          scheduleFirstPageRefresh();
        },
        onNotificationArchived: (payload) => {
          if (!isMounted) return;
          const id = extractIdFromEvent(payload);
          if (id) dispatch(archiveNotification({ id }));
          scheduleFirstPageRefresh();
        },
        onUnreadCount: (count) => {
          if (!isMounted) return;
          dispatch(setUnreadCount(count));
        },
        onPing: () => {
          // Keepalive event from backend; no-op.
        },
        onSessionInvalid: () => {
          if (!isMounted) return;
          forceLocalLogout(dispatch, user.id, DEFAULT_SESSION_EXPIRED_MESSAGE, () =>
            router.push(`/${locale}`),
          );
        },
        onError: () => {
          if (!isMounted) return;
          dispatch(flagNotificationsDesync());
        },
      },
      getAccessToken: () => getStoredAccessToken(),
      getSocketUrl: resolveNotificationsSocketUrl,
      maxRetries: 8,
    });

    void bootstrapFromApi();
    realtime.connect();

    return () => {
      isMounted = false;
      realtime.disconnect();
      stopPolling();
      if (pageRefreshTimer) clearTimeout(pageRefreshTimer);
      dispatch(setRealtimeConnected(false));
      dispatch(setReconnectAttempts(0));
    };
  }, [dispatch, locale, router, user]);

  return (
    <>
      {children}
      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} duration={6000} />
      ) : null}
    </>
  );
}


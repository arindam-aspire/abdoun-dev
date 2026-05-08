"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Archive, CheckCheck, X } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  archiveNotification,
  deleteNotification,
  mergeNotificationsPage,
  markAllNotificationsRead,
  markNotificationRead,
  removeArchivedNotification,
  replaceArchivedNotifications,
  selectArchivedNotificationItems,
  selectArchivedNotificationsMeta,
  selectNotificationItems,
  selectNotificationsState,
  selectNotificationUnreadCount,
  setArchivedNotificationsError,
  setArchivedNotificationsLoading,
  setUnreadCount,
  upsertRealtimeNotification,
} from "@/features/notifications/notificationsSlice";
import {
  archiveNotificationById,
  deleteNotificationById,
  getNotificationsUnreadCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  unarchiveNotificationById,
} from "@/features/notifications/api/notifications.api";
import { useRouter } from "next/navigation";
import { NotificationSkeletonList } from "@/features/notifications/components/NotificationSkeletonList";
import { NotificationLists } from "@/features/notifications/components/NotificationLists";
import { NotificationActionDialogs } from "@/features/notifications/components/NotificationActionDialogs";
import { UndoArchiveToast } from "@/features/notifications/components/UndoArchiveToast";

type FormattedNotification = {
  id: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  createdAt: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  read: boolean;
  level: "info" | "success" | "warning";
  time: string;
};

export default function NotificationsPage() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isRtl = locale === "ar";
  const notifications = useAppSelector(selectNotificationItems);
  const unreadCount = useAppSelector(selectNotificationUnreadCount);
  const notificationsStatus = useAppSelector(
    (state) => selectNotificationsState(state).status,
  );
  const [deletingNotification, setDeletingNotification] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [archivingNotification, setArchivingNotification] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [undoArchiveState, setUndoArchiveState] = useState<{
    item: FormattedNotification;
  } | null>(null);
  const [isArchivedPanelOpen, setIsArchivedPanelOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [isActiveLoadingMore, setIsActiveLoadingMore] = useState(false);
  const formattedNotifications = useMemo(
    () =>
      notifications.map((item) => ({
        ...item,
        time: new Date(item.createdAt).toLocaleString(locale),
      })),
    [locale, notifications],
  );
  const shouldShowLoadingState =
    (notificationsStatus === "idle" || notificationsStatus === "loading") &&
    formattedNotifications.length === 0;
  const activeHasMore = useAppSelector((state) => selectNotificationsState(state).hasMore);
  const archivedNotificationsFromStore = useAppSelector(selectArchivedNotificationItems);
  const archivedMeta = useAppSelector(selectArchivedNotificationsMeta);
  const archivedNotifications: FormattedNotification[] = useMemo(
    () =>
      archivedNotificationsFromStore.map((item) => ({
        ...item,
        time: new Date(item.createdAt).toLocaleString(locale),
      })),
    [archivedNotificationsFromStore, locale],
  );

  useEffect(() => {
    if (!isArchivedPanelOpen) return;
    let cancelled = false;
    dispatch(setArchivedNotificationsLoading());
    void (async () => {
      try {
        const page = await listNotifications({
          page: 1,
          pageSize: 50,
          includeArchived: true,
        });
        if (cancelled) return;
        const archivedOnly = page.items
          .filter((item) => Boolean(item.archivedAt));
        dispatch(replaceArchivedNotifications(archivedOnly));
      } catch {
        if (!cancelled)
          dispatch(
            setArchivedNotificationsError(
              "Unable to load archived notifications. Please try again.",
            ),
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, isArchivedPanelOpen]);

  useEffect(() => {
    if (formattedNotifications.length <= 20) {
      setActivePage(1);
    }
  }, [formattedNotifications.length]);

  const navigateToAction = (actionUrl?: string | null) => {
    if (!actionUrl) return;
    const normalized = actionUrl.trim();
    if (!normalized) return;

    if (/^https?:\/\//i.test(normalized)) {
      window.location.assign(normalized);
      return;
    }
    if (normalized.startsWith("/")) {
      const localePrefixed = /^\/(en|ar|es|fr)(\/|$)/.test(normalized);
      router.push(localePrefixed ? normalized : `/${locale}${normalized}`);
      return;
    }
    if (normalized.startsWith(`${locale}/`)) {
      router.push(`/${normalized}`);
      return;
    }
    router.push(`/${locale}/${normalized}`);
  };

  const handleNotificationClick = async (item: (typeof formattedNotifications)[number]) => {
    if (!item.read) {
      dispatch(markNotificationRead({ id: item.id }));
      dispatch(setUnreadCount(Math.max(0, unreadCount - 1)));
      navigateToAction(item.actionUrl);

      void (async () => {
        try {
          await markNotificationAsRead(item.id);
        } catch {
          // Keep optimistic UI and let API reconciliation fix any desync.
          setActionError("Could not mark notification as read. It will retry on next sync.");
        }

        try {
          const unread = await getNotificationsUnreadCount();
          dispatch(setUnreadCount(unread));
        } catch {
          // No-op for count reconciliation failures.
        }
      })();
      return;
    }
    navigateToAction(item.actionUrl);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount <= 0) return;
    setActionError(null);
    dispatch(markAllNotificationsRead());
    dispatch(setUnreadCount(0));
    try {
      await markAllNotificationsAsRead();
    } catch {
      // Keep optimistic UI and let count reconciliation self-heal.
      setActionError("Could not mark all as read right now.");
    }
    try {
      const unread = await getNotificationsUnreadCount();
      dispatch(setUnreadCount(unread));
    } catch {
      // No-op for count reconciliation failures.
    }
  };

  const handleDeleteNotification = async () => {
    if (!deletingNotification) return;
    setActionError(null);
    const deletingId = deletingNotification.id;
    setDeletingNotification(null);
    dispatch(deleteNotification({ id: deletingId }));
    try {
      await deleteNotificationById(deletingId);
    } catch {
      // Keep optimistic UI and rely on next API sync.
      setActionError("Could not delete notification right now.");
    }
    try {
      const unread = await getNotificationsUnreadCount();
      dispatch(setUnreadCount(unread));
    } catch {
      // No-op for count reconciliation failures.
    }
  };

  const handleArchiveNotification = async () => {
    if (!archivingNotification) return;
    setActionError(null);
    const archivingId = archivingNotification.id;
    const archivedItem = formattedNotifications.find((item) => item.id === archivingId) ?? null;
    setArchivingNotification(null);
    dispatch(archiveNotification({ id: archivingId }));
    if (archivedItem) {
      setUndoArchiveState({ item: archivedItem });
      window.setTimeout(() => {
        setUndoArchiveState((current) =>
          current?.item.id === archivingId ? null : current,
        );
      }, 8000);
    }
    try {
      await archiveNotificationById(archivingId);
    } catch {
      // Keep optimistic UI and rely on next API sync.
      setActionError("Could not archive notification right now.");
    }
    try {
      const unread = await getNotificationsUnreadCount();
      dispatch(setUnreadCount(unread));
    } catch {
      // No-op for count reconciliation failures.
    }
  };

  const handleUndoArchive = async () => {
    if (!undoArchiveState) return;
    const restoreItem = undoArchiveState.item;
    setUndoArchiveState(null);
    try {
      await unarchiveNotificationById(restoreItem.id);
    } catch {
      // If backend unarchive fails, keep UI unchanged and rely on future sync.
      setActionError("Could not unarchive notification.");
      return;
    }
    dispatch(
      upsertRealtimeNotification({
        id: restoreItem.id,
        title: restoreItem.title,
        message: restoreItem.message,
        actionUrl: restoreItem.actionUrl,
        createdAt: restoreItem.createdAt,
        updatedAt: restoreItem.updatedAt ?? null,
        read: restoreItem.read,
        level: restoreItem.level,
      }),
    );
    try {
      const unread = await getNotificationsUnreadCount();
      dispatch(setUnreadCount(unread));
    } catch {
      // No-op for count reconciliation failures.
    }
  };

  const handleUnarchiveFromList = async (id: string) => {
    const target = archivedNotifications.find((item) => item.id === id);
    if (!target) return;
    try {
      await unarchiveNotificationById(id);
    } catch {
      setActionError("Could not unarchive notification.");
      return;
    }
    dispatch(removeArchivedNotification({ id }));
    dispatch(
      upsertRealtimeNotification({
        id: target.id,
        title: target.title,
        message: target.message,
        actionUrl: target.actionUrl,
        createdAt: target.createdAt,
        archivedAt: null,
        updatedAt: target.updatedAt ?? null,
        read: target.read,
        level: target.level,
      }),
    );
    try {
      const unread = await getNotificationsUnreadCount();
      dispatch(setUnreadCount(unread));
    } catch {
      // No-op for count reconciliation failures.
    }
  };

  const handleLoadMoreActive = async () => {
    if (!activeHasMore || isActiveLoadingMore) return;
    setIsActiveLoadingMore(true);
    const nextPage = activePage + 1;
    try {
      const page = await listNotifications({
        page: nextPage,
        pageSize: 20,
        includeArchived: false,
      });
      dispatch(
        mergeNotificationsPage({
          items: page.items,
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
          replace: false,
        }),
      );
      setActivePage(nextPage);
    } catch {
      setActionError("Could not load more notifications.");
    } finally {
      setIsActiveLoadingMore(false);
    }
  };

  return (
    <div
      className="mx-auto container w-full px-4 py-8 md:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-charcoal md:text-2xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Stay updated with saved searches, property activity, and account alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={unreadCount <= 0}
            style={{ cursor: unreadCount <= 0 ? "not-allowed" : "pointer" }}
            className="inline-flex h-9 items-center rounded-lg border border-subtle bg-white px-3 text-sm text-zinc-700 transition hover:bg-zinc-50 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            Mark all read
          </button>
          <button
            type="button"
            onClick={() => setIsArchivedPanelOpen(true)}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm text-amber-800 transition hover:bg-amber-100"
          >
            <Archive className="h-4 w-4" />
            <span>Archived</span>
          </button>
        </div>
      </div>
      {actionError ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {actionError}
        </div>
      ) : null}

      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-subtle md:p-5">
        <NotificationLists
          activeTab="active"
          notifications={formattedNotifications}
          archivedNotifications={archivedNotifications}
          isArchivedLoading={archivedMeta.status === "loading"}
          shouldShowLoadingState={shouldShowLoadingState}
          showActiveEmptyState={notificationsStatus === "ready" && formattedNotifications.length === 0}
          archivedLoadError={archivedMeta.error}
          onNotificationClick={(item) => void handleNotificationClick(item)}
          onArchiveClick={(item) => setArchivingNotification({ id: item.id, title: item.title })}
          onDeleteClick={(item) => setDeletingNotification({ id: item.id, title: item.title })}
          onUnarchiveClick={(id) => void handleUnarchiveFromList(id)}
          activeHasMore={activeHasMore}
          isActiveLoadingMore={isActiveLoadingMore}
          onLoadMoreActive={() => void handleLoadMoreActive()}
          renderSkeletons={(count, label) => (
            <NotificationSkeletonList count={count} ariaLabel={label} />
          )}
        />
      </section>
      {isArchivedPanelOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsArchivedPanelOpen(false)}
          aria-hidden
        >
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-xl bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            aria-label="Archived notifications panel"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-charcoal">Archived Notifications</h2>
              <button
                type="button"
                onClick={() => setIsArchivedPanelOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100"
                aria-label="Close archived notifications panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NotificationLists
              activeTab="archived"
              notifications={formattedNotifications}
              archivedNotifications={archivedNotifications}
              isArchivedLoading={archivedMeta.status === "loading"}
              shouldShowLoadingState={shouldShowLoadingState}
              showActiveEmptyState={false}
              archivedLoadError={archivedMeta.error}
              onNotificationClick={(item) => void handleNotificationClick(item)}
              onArchiveClick={(item) =>
                setArchivingNotification({ id: item.id, title: item.title })
              }
              onDeleteClick={(item) =>
                setDeletingNotification({ id: item.id, title: item.title })
              }
              onUnarchiveClick={(id) => void handleUnarchiveFromList(id)}
              activeHasMore={activeHasMore}
              isActiveLoadingMore={isActiveLoadingMore}
              onLoadMoreActive={() => void handleLoadMoreActive()}
              renderSkeletons={(count, label) => (
                <NotificationSkeletonList count={count} ariaLabel={label} />
              )}
            />
          </aside>
        </div>
      ) : null}
      <NotificationActionDialogs
        archivingNotification={archivingNotification}
        deletingNotification={deletingNotification}
        onCancelArchive={() => setArchivingNotification(null)}
        onConfirmArchive={handleArchiveNotification}
        onCancelDelete={() => setDeletingNotification(null)}
        onConfirmDelete={handleDeleteNotification}
      />
      <UndoArchiveToast open={Boolean(undoArchiveState)} onUndo={handleUndoArchive} />
    </div>
  );
}

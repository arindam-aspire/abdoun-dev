"use client";

import type { ReactNode } from "react";
import { Archive, Bell, CircleAlert, CircleCheckBig, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NotificationItem } from "@/features/notifications/notificationsSlice";
import { getNotificationEventPresentation } from "@/features/notifications/normalizeNotification";

type NotificationLevel = "info" | "success" | "warning";

type FormattedNotification = NotificationItem & { time: string };

type NotificationListsProps = {
  activeTab: "active" | "archived";
  notifications: FormattedNotification[];
  archivedNotifications: FormattedNotification[];
  isArchivedLoading: boolean;
  shouldShowLoadingState: boolean;
  showActiveEmptyState: boolean;
  archivedLoadError: string | null;
  onNotificationClick: (item: FormattedNotification) => void;
  onArchiveClick: (item: FormattedNotification) => void;
  onDeleteClick: (item: FormattedNotification) => void;
  onUnarchiveClick: (id: string) => void;
  activeHasMore: boolean;
  isActiveLoadingMore: boolean;
  onLoadMoreActive: () => void;
  renderSkeletons: (count: number, label: string) => ReactNode;
};

function levelIcon(level: NotificationLevel) {
  if (level === "success") return CircleCheckBig;
  if (level === "warning") return CircleAlert;
  return Info;
}

export function NotificationLists({
  activeTab,
  notifications,
  archivedNotifications,
  isArchivedLoading,
  shouldShowLoadingState,
  showActiveEmptyState,
  archivedLoadError,
  onNotificationClick,
  onArchiveClick,
  onDeleteClick,
  onUnarchiveClick,
  activeHasMore,
  isActiveLoadingMore,
  onLoadMoreActive,
  renderSkeletons,
}: NotificationListsProps) {
  if (activeTab === "archived") {
    if (isArchivedLoading) return <>{renderSkeletons(4, "Loading archived notifications")}</>;
    if (archivedLoadError) {
      return (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {archivedLoadError}
        </div>
      );
    }
    if (archivedNotifications.length === 0) {
      return (
        <div className="py-10 text-center text-zinc-500">
          <Archive className="mx-auto mb-3 h-7 w-7 text-zinc-400" />
          <p>No archived notifications.</p>
        </div>
      );
    }
    return (
      <ul className="space-y-3" aria-label="Archived notifications list">
        {archivedNotifications.map((item) => {
          const Icon = levelIcon(item.level);
          const safeTitle = typeof item.title === "string" ? item.title : "";
          const safeMessage = typeof item.message === "string" ? item.message : "";
          return (
            <li key={item.id} className="rounded-xl border border-subtle bg-zinc-50/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 rounded-full p-1.5",
                      item.level === "success" && "bg-emerald-100 text-emerald-700",
                      item.level === "warning" && "bg-amber-100 text-amber-700",
                      item.level === "info" && "bg-blue-100 text-blue-700",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal">{safeTitle}</p>
                    <p className="mt-1 text-sm text-zinc-600">{safeMessage}</p>
                    <p className="mt-2 text-xs text-zinc-500">{item.time}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUnarchiveClick(item.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  aria-label={`Unarchive notification ${safeTitle || item.id}`}
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Unarchive</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  if (shouldShowLoadingState) return <>{renderSkeletons(5, "Loading notifications")}</>;

  return (
    <>
      <ul className="space-y-3" aria-label="Notifications list">
        {notifications.map((item) => {
          const Icon = levelIcon(item.level);
          const eventPresentation = getNotificationEventPresentation(item.eventType);
          const safeTitle = typeof item.title === "string" ? item.title : "";
          const safeMessage = typeof item.message === "string" ? item.message : "";
          return (
            <li
              key={item.id}
              className={cn(
                "rounded-xl border transition",
                item.read ? "border-subtle bg-white" : "border-blue-200 bg-blue-50/50",
                eventPresentation.kind === "system" && "border-violet-200 bg-violet-50/30",
                eventPresentation.kind === "lead-updated" && item.read && "border-zinc-200/90",
                !item.read && eventPresentation.kind === "lead-created" &&
                  "border-emerald-400 bg-emerald-50/45 shadow-sm shadow-emerald-100/60",
              )}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onNotificationClick(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onNotificationClick(item);
                  }
                }}
                className="w-full cursor-pointer rounded-xl p-4 text-left transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 rounded-full p-1.5",
                        item.level === "success" && "bg-emerald-100 text-emerald-700",
                        item.level === "warning" && "bg-amber-100 text-amber-700",
                        item.level === "info" && "bg-blue-100 text-blue-700",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-charcoal">{safeTitle}</p>
                        {eventPresentation.showSystemBadge ? (
                          <span className="inline-flex shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
                            System
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-600">{safeMessage}</p>
                      <p className="mt-2 text-xs text-zinc-500">{item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!item.read && (
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onArchiveClick(item);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-800 transition hover:bg-amber-100"
                      aria-label={`Archive notification ${safeTitle || item.id}`}
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>Archive</span>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteClick(item);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 transition hover:bg-rose-50"
                      aria-label={`Delete notification ${safeTitle || item.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {activeHasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadMoreActive}
            disabled={isActiveLoadingMore}
            className="inline-flex h-10 items-center rounded-lg border border-subtle bg-white px-4 text-sm text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isActiveLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}

      {showActiveEmptyState ? (
        <div className="py-10 text-center text-zinc-500">
          <Bell className="mx-auto mb-3 h-7 w-7 text-zinc-400" />
          <p>No notifications yet.</p>
        </div>
      ) : null}
    </>
  );
}

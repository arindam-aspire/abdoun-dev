"use client";

import { authApi } from "@/lib/http/clients";
import type { NotificationItem, NotificationLevel } from "@/features/notifications/notificationsSlice";
import {
  levelFromEventType,
  normalizeNotification,
  normalizeNotificationActionUrl,
} from "@/features/notifications/normalizeNotification";

type NotificationApiItem = {
  id: string | number;
  title?: string | null;
  message?: string | null;
  event_type?: string | null;
  eventType?: string | null;
  metadata?: unknown;
  action_url?: string | null;
  actionUrl?: string | null;
  data?: {
    action_url?: string | null;
    actionUrl?: string | null;
    url?: string | null;
    link?: string | null;
  } | null;
  payload?: {
    action_url?: string | null;
    actionUrl?: string | null;
    url?: string | null;
    link?: string | null;
  } | null;
  created_at?: string | null;
  createdAt?: string | null;
  archived_at?: string | null;
  archivedAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  is_read?: boolean | null;
  isRead?: boolean | null;
  level?: NotificationLevel | null;
};

type NotificationsListEnvelope =
  | {
      items?: NotificationApiItem[] | null;
      next_cursor?: string | null;
      has_more?: boolean | null;
    }
  | {
      data?: NotificationApiItem[] | null;
      page?: number | null;
      pageSize?: number | null;
      total?: number | null;
      hasNext?: boolean | null;
    };

type StandardApiEnvelope<T> = {
  success?: boolean;
  message?: string | null;
  data?: T;
  error?: unknown;
  meta?: {
    pagination?: {
      total?: number;
      page?: number;
      pageSize?: number;
      totalPages?: number;
      hasNext?: boolean;
      hasPrevious?: boolean;
    } | null;
  } | null;
};

type UnreadCountEnvelope = {
  unread_count?: number | null;
  data?: {
    unread_count?: number | null;
    unreadCount?: number | null;
  } | null;
  unreadCount?: number | null;
};

const toNotificationItem = (raw: NotificationApiItem): NotificationItem => {
  const canonical = normalizeNotification(raw as unknown);
  const eventTypeForLevel =
    canonical?.eventType ??
    (typeof raw.event_type === "string" ? raw.event_type : null) ??
    (typeof raw.eventType === "string" ? raw.eventType : null) ??
    null;
  const level =
    raw.level === "success" || raw.level === "warning"
      ? raw.level
      : levelFromEventType(eventTypeForLevel, raw.level);

  const actionFromCanonical = canonical?.actionUrl ?? null;
  const actionFallback =
    raw.action_url ??
    raw.actionUrl ??
    raw.data?.action_url ??
    raw.data?.actionUrl ??
    raw.data?.url ??
    raw.data?.link ??
    raw.payload?.action_url ??
    raw.payload?.actionUrl ??
    raw.payload?.url ??
    raw.payload?.link ??
    null;

  const metadata =
    canonical && Object.keys(canonical.metadata).length > 0 ? canonical.metadata : undefined;

  return {
    id: String(raw.id),
    title: canonical?.title ?? raw.title ?? "",
    message: canonical?.message ?? raw.message ?? "",
    actionUrl: normalizeNotificationActionUrl(actionFromCanonical ?? actionFallback),
    eventType: canonical?.eventType ?? eventTypeForLevel,
    metadata,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    archivedAt: raw.archived_at ?? raw.archivedAt ?? null,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
    read: Boolean(raw.is_read ?? raw.isRead),
    level,
  };
};

export async function listNotifications(params?: {
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
}): Promise<{
  items: NotificationItem[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const response = await authApi.get<
    NotificationsListEnvelope | NotificationApiItem[] | StandardApiEnvelope<NotificationsListEnvelope>
  >(
    "/notifications",
    {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        includeArchived: params?.includeArchived ?? false,
      },
    },
  );
  const envelopeData = response.data;
  const data =
    envelopeData &&
    typeof envelopeData === "object" &&
    "data" in envelopeData &&
    (envelopeData as StandardApiEnvelope<NotificationsListEnvelope>).data
      ? (envelopeData as StandardApiEnvelope<NotificationsListEnvelope>).data!
      : (envelopeData as NotificationsListEnvelope | NotificationApiItem[]);
  if (Array.isArray(data)) {
    return { items: data.map(toNotificationItem), nextCursor: null, hasMore: false };
  }

  const itemsSource = Array.isArray((data as { items?: NotificationApiItem[] }).items)
    ? (data as { items: NotificationApiItem[] }).items
    : Array.isArray((data as { data?: NotificationApiItem[] }).data)
      ? (data as { data: NotificationApiItem[] }).data
      : [];
  const items = itemsSource.map(toNotificationItem);

  const envelope = data as {
    next_cursor?: string | null;
    has_more?: boolean | null;
    hasNext?: boolean | null;
    page?: number | null;
    pageSize?: number | null;
    total?: number | null;
  };
  const metaPagination =
    envelopeData &&
    typeof envelopeData === "object" &&
    "meta" in envelopeData
      ? (envelopeData as StandardApiEnvelope<NotificationsListEnvelope>).meta?.pagination
      : undefined;
  const page = envelope.page ?? params?.page ?? 1;
  const pageSize = envelope.pageSize ?? params?.pageSize ?? 20;
  const total = envelope.total ?? metaPagination?.total ?? null;
  const hasMoreFromPagination =
    typeof total === "number" ? page * pageSize < total : undefined;
  return {
    items,
    nextCursor: envelope.next_cursor ?? null,
    hasMore:
      typeof envelope.has_more === "boolean"
        ? envelope.has_more
        : typeof envelope.hasNext === "boolean"
          ? envelope.hasNext
        : typeof metaPagination?.hasNext === "boolean"
          ? metaPagination.hasNext
        : hasMoreFromPagination ?? items.length >= pageSize,
  };
}

export async function getNotificationsUnreadCount(): Promise<number> {
  const response = await authApi.get<UnreadCountEnvelope | number>("/notifications/unread-count");
  const data = response.data;
  if (typeof data === "number") return Math.max(0, data);
  return Math.max(
    0,
    data?.unread_count ??
      data?.unreadCount ??
      data?.data?.unread_count ??
      data?.data?.unreadCount ??
      0,
  );
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await authApi.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await authApi.put("/notifications/read-all");
}

export async function archiveNotificationById(id: string): Promise<void> {
  await authApi.post(`/notifications/${id}/archive`);
}

export async function unarchiveNotificationById(id: string): Promise<void> {
  await authApi.post(`/notifications/${id}/unarchive`);
}

export async function deleteNotificationById(id: string): Promise<void> {
  await authApi.delete(`/notifications/${id}`);
}

export async function getNotificationSettings<TSettings = Record<string, unknown>>(): Promise<TSettings> {
  const response = await authApi.get<TSettings>("/notification-settings");
  return response.data;
}

export async function updateNotificationSettings<TSettings = Record<string, unknown>>(
  payload: TSettings,
): Promise<TSettings> {
  const response = await authApi.put<TSettings>("/notification-settings", payload);
  return response.data;
}

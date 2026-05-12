import type { NotificationItem, NotificationLevel } from "@/features/notifications/notificationsSlice";

/** Canonical, version-tolerant shape after parsing any backend notification payload. */
export type NormalizedWebSocketNotification = {
  id: string | number;
  title: string;
  message: string;
  eventType: string | null;
  actionUrl: string | null;
  metadata: Record<string, unknown>;
  unreadCount: number;
};

/** Public alias for the normalized websocket / REST notification shape. */
export type NormalizedNotification = NormalizedWebSocketNotification;

const coerceNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const coerceString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "";
};

const pickActionUrl = (source: Record<string, unknown>): string | null => {
  const nested = [source.data, source.payload].filter(
    (entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry),
  );
  const candidates: unknown[] = [
    source.action_url,
    source.actionUrl,
    ...nested.flatMap((obj) => [obj.action_url, obj.actionUrl, obj.url, obj.link]),
  ];
  for (const candidate of candidates) {
    const s = coerceNonEmptyString(candidate);
    if (s) return normalizeNotificationActionUrl(s);
  }
  return null;
};

/** Same path alias rules as REST client (`notifications.api`). */
export function normalizeNotificationActionUrl(url: string | null): string | null {
  if (!url) return null;
  if (url === "/favorites") return "/favourites";
  if (url === "favorites") return "favourites";
  return url;
}

const coerceMetadata = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return { ...(value as Record<string, unknown>) };
};

const coerceUnreadCount = (source: Record<string, unknown>): number => {
  const keys = ["unread_count", "unreadCount"] as const;
  for (const key of keys) {
    const raw = source[key];
    if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
  }
  for (const nested of [source.data, source.payload]) {
    if (!nested || typeof nested !== "object" || Array.isArray(nested)) continue;
    const obj = nested as Record<string, unknown>;
    for (const key of keys) {
      const raw = obj[key];
      if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
    }
  }
  return 0;
};

const normalizeLevel = (level?: unknown): NotificationLevel => {
  if (level === "success" || level === "warning") return level;
  return "info";
};

/**
 * Maps optional `event_type` to default icon/level when API did not send `level`.
 * Unknown types keep API/default styling — never throws.
 */
export const levelFromEventType = (
  eventType: string | null,
  apiLevel: unknown,
): NotificationLevel => {
  const base = normalizeLevel(apiLevel);
  if (!eventType) return base;
  if (eventType === "lead.created") return "success";
  if (eventType === "lead.updated") return base;
  if (eventType.startsWith("system.")) return "warning";
  return base;
};

export type NotificationEventPresentation = {
  kind: "lead-created" | "lead-updated" | "system" | "default";
  showSystemBadge: boolean;
};

export function getNotificationEventPresentation(
  eventType: string | null | undefined,
): NotificationEventPresentation {
  const et = typeof eventType === "string" ? eventType : "";
  if (et === "lead.created") return { kind: "lead-created", showSystemBadge: false };
  if (et === "lead.updated") return { kind: "lead-updated", showSystemBadge: false };
  if (et.startsWith("system.")) return { kind: "system", showSystemBadge: true };
  return { kind: "default", showSystemBadge: false };
}

/**
 * Version-soft entry: branch only when we intentionally differ per version later.
 * Unknown `version` values use the same tolerant parser as v1.
 */
export function normalizeNotification(payload: unknown): NormalizedWebSocketNotification | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const raw = payload as Record<string, unknown>;

  if (raw.version === 2) {
    // Reserved for a future v2 envelope; parsing stays identical for now.
    void raw.version;
  }

  const id = raw.id;
  if (typeof id !== "string" && typeof id !== "number") return null;

  const eventType =
    coerceNonEmptyString(raw.event_type) ??
    coerceNonEmptyString(raw.eventType) ??
    null;

  const title = coerceString(raw.title);
  const message = coerceString(raw.message);

  const actionUrl = pickActionUrl(raw);
  const metadata = coerceMetadata(raw.metadata);
  const unreadCount = coerceUnreadCount(raw);

  return {
    id,
    title,
    message,
    eventType,
    actionUrl,
    metadata,
    unreadCount,
  };
}

/**
 * Builds a Redux `NotificationItem` from any WS/REST-shaped payload using `normalizeNotification`
 * plus defensive reads for dates, read flag, and level.
 */
export function notificationItemFromPayload(payload: unknown): NotificationItem | null {
  const normalized = normalizeNotification(payload);
  if (!normalized) return null;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const source = payload as Record<string, unknown>;

  const createdAt =
    coerceNonEmptyString(source.created_at) ??
    coerceNonEmptyString(source.createdAt) ??
    new Date().toISOString();
  const updatedAt =
    coerceNonEmptyString(source.updated_at) ?? coerceNonEmptyString(source.updatedAt) ?? null;
  const archivedAt =
    coerceNonEmptyString(source.archived_at) ?? coerceNonEmptyString(source.archivedAt) ?? null;

  const read = Boolean(source.is_read ?? source.isRead ?? source.read);
  const level = levelFromEventType(normalized.eventType, source.level);

  return {
    id: String(normalized.id),
    title: normalized.title,
    message: normalized.message,
    actionUrl: normalized.actionUrl,
    createdAt,
    updatedAt,
    archivedAt,
    read,
    level,
    eventType: normalized.eventType,
    metadata: Object.keys(normalized.metadata).length > 0 ? normalized.metadata : undefined,
  };
}

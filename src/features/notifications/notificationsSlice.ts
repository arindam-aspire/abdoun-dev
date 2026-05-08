import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

export type NotificationLevel = "info" | "success" | "warning";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  read: boolean;
  level: NotificationLevel;
};

type NotificationsState = {
  itemsById: Record<string, NotificationItem>;
  orderedIds: string[];
  archivedItemsById: Record<string, NotificationItem>;
  archivedOrderedIds: string[];
  archivedStatus: "idle" | "loading" | "ready" | "error";
  archivedError: string | null;
  unreadCount: number;
  nextCursor: string | null;
  hasMore: boolean;
  status: "idle" | "loading" | "ready" | "error";
  isRealtimeConnected: boolean;
  isPollingFallbackActive: boolean;
  reconnectAttempts: number;
  desyncDetected: boolean;
};

const initialState: NotificationsState = {
  itemsById: {},
  orderedIds: [],
  archivedItemsById: {},
  archivedOrderedIds: [],
  archivedStatus: "idle",
  archivedError: null,
  unreadCount: 0,
  nextCursor: null,
  hasMore: true,
  status: "idle",
  isRealtimeConnected: false,
  isPollingFallbackActive: false,
  reconnectAttempts: 0,
  desyncDetected: false,
};

const toEpoch = (value?: string | null): number => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const shouldReplace = (existing: NotificationItem | undefined, next: NotificationItem): boolean => {
  if (!existing) return true;
  const existingUpdated = toEpoch(existing.updatedAt ?? existing.createdAt);
  const nextUpdated = toEpoch(next.updatedAt ?? next.createdAt);
  if (nextUpdated > existingUpdated) return true;
  if (nextUpdated < existingUpdated) return false;
  return toEpoch(next.createdAt) >= toEpoch(existing.createdAt);
};

const sortByNewest = (a: NotificationItem, b: NotificationItem): number => {
  const timeDiff = toEpoch(b.createdAt) - toEpoch(a.createdAt);
  if (timeDiff !== 0) return timeDiff;
  return b.id.localeCompare(a.id);
};

const recalculateUnreadCount = (state: NotificationsState): void => {
  state.unreadCount = state.orderedIds.reduce(
    (total, id) => total + (state.itemsById[id]?.read ? 0 : 1),
    0,
  );
};

const sortIds = (state: NotificationsState): void => {
  state.orderedIds.sort((left, right) =>
    sortByNewest(state.itemsById[left], state.itemsById[right]),
  );
};

const upsertMany = (state: NotificationsState, items: NotificationItem[]): void => {
  let hasAnyInsertOrUpdate = false;
  for (const item of items) {
    const normalized: NotificationItem = {
      ...item,
      id: String(item.id),
    };
    const current = state.itemsById[normalized.id];
    if (!shouldReplace(current, normalized)) continue;
    state.itemsById[normalized.id] = normalized;
    if (!current) state.orderedIds.push(normalized.id);
    hasAnyInsertOrUpdate = true;
  }

  if (hasAnyInsertOrUpdate) {
    sortIds(state);
    recalculateUnreadCount(state);
  }
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    resetNotificationsState: () => initialState,
    setNotificationsLoading(state) {
      state.status = "loading";
    },
    mergeNotificationsPage(
      state,
      action: PayloadAction<{
        items: NotificationItem[];
        nextCursor: string | null;
        hasMore: boolean;
        replace?: boolean;
      }>,
    ) {
      const { items, nextCursor, hasMore, replace = false } = action.payload;
      if (replace) {
        state.itemsById = {};
        state.orderedIds = [];
      }
      upsertMany(state, items);
      state.nextCursor = nextCursor;
      state.hasMore = hasMore;
      state.status = "ready";
      state.desyncDetected = false;
    },
    upsertRealtimeNotification(state, action: PayloadAction<NotificationItem>) {
      upsertMany(state, [action.payload]);
      state.status = "ready";
    },
    markNotificationRead(state, action: PayloadAction<{ id: string }>) {
      const id = String(action.payload.id);
      const item = state.itemsById[id];
      if (!item || item.read) return;
      item.read = true;
      recalculateUnreadCount(state);
    },
    archiveNotification(state, action: PayloadAction<{ id: string }>) {
      const id = String(action.payload.id);
      const existing = state.itemsById[id];
      if (!existing) return;
      state.archivedItemsById[id] = {
        ...existing,
        archivedAt: new Date().toISOString(),
      };
      if (!state.archivedOrderedIds.includes(id)) state.archivedOrderedIds.push(id);
      state.archivedOrderedIds.sort((left, right) =>
        sortByNewest(state.archivedItemsById[left], state.archivedItemsById[right]),
      );
      delete state.itemsById[id];
      state.orderedIds = state.orderedIds.filter((entry) => entry !== id);
      recalculateUnreadCount(state);
    },
    setArchivedNotificationsLoading(state) {
      state.archivedStatus = "loading";
      state.archivedError = null;
    },
    setArchivedNotificationsError(state, action: PayloadAction<string>) {
      state.archivedStatus = "error";
      state.archivedError = action.payload;
    },
    replaceArchivedNotifications(state, action: PayloadAction<NotificationItem[]>) {
      state.archivedItemsById = {};
      state.archivedOrderedIds = [];
      for (const item of action.payload) {
        const id = String(item.id);
        state.archivedItemsById[id] = { ...item, id };
        state.archivedOrderedIds.push(id);
      }
      state.archivedOrderedIds.sort((left, right) =>
        sortByNewest(state.archivedItemsById[left], state.archivedItemsById[right]),
      );
      state.archivedStatus = "ready";
      state.archivedError = null;
    },
    removeArchivedNotification(state, action: PayloadAction<{ id: string }>) {
      const id = String(action.payload.id);
      if (!state.archivedItemsById[id]) return;
      delete state.archivedItemsById[id];
      state.archivedOrderedIds = state.archivedOrderedIds.filter((entry) => entry !== id);
    },
    deleteNotification(state, action: PayloadAction<{ id: string }>) {
      const id = String(action.payload.id);
      if (state.itemsById[id]) {
        delete state.itemsById[id];
        state.orderedIds = state.orderedIds.filter((entry) => entry !== id);
        recalculateUnreadCount(state);
      }
      if (state.archivedItemsById[id]) {
        delete state.archivedItemsById[id];
        state.archivedOrderedIds = state.archivedOrderedIds.filter((entry) => entry !== id);
      }
    },
    markAllNotificationsRead(state) {
      state.orderedIds.forEach((id) => {
        if (state.itemsById[id]) state.itemsById[id].read = true;
      });
      state.unreadCount = 0;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = Math.max(0, action.payload);
    },
    setRealtimeConnected(state, action: PayloadAction<boolean>) {
      state.isRealtimeConnected = action.payload;
    },
    setPollingFallbackActive(state, action: PayloadAction<boolean>) {
      state.isPollingFallbackActive = action.payload;
    },
    setReconnectAttempts(state, action: PayloadAction<number>) {
      state.reconnectAttempts = Math.max(0, action.payload);
    },
    flagNotificationsDesync(state) {
      state.desyncDetected = true;
    },
  },
});

export const {
  resetNotificationsState,
  setNotificationsLoading,
  mergeNotificationsPage,
  upsertRealtimeNotification,
  markNotificationRead,
  archiveNotification,
  setArchivedNotificationsLoading,
  setArchivedNotificationsError,
  replaceArchivedNotifications,
  removeArchivedNotification,
  deleteNotification,
  markAllNotificationsRead,
  setUnreadCount,
  setRealtimeConnected,
  setPollingFallbackActive,
  setReconnectAttempts,
  flagNotificationsDesync,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

export const selectNotificationsState = (state: RootState) => state.notifications;
export const selectNotificationItems = createSelector(
  [selectNotificationsState],
  (state) => state.orderedIds.map((id) => state.itemsById[id]).filter(Boolean),
);
export const selectNotificationUnreadCount = createSelector(
  [selectNotificationsState],
  (state) => state.unreadCount,
);
export const selectArchivedNotificationItems = createSelector(
  [selectNotificationsState],
  (state) =>
    state.archivedOrderedIds
      .map((id) => state.archivedItemsById[id])
      .filter(Boolean),
);
export const selectArchivedNotificationsMeta = createSelector(
  [selectNotificationsState],
  (state) => ({ status: state.archivedStatus, error: state.archivedError }),
);

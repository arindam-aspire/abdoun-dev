import notificationsReducer, {
  archiveNotification,
  markNotificationRead,
  mergeNotificationsPage,
  setUnreadCount,
  upsertRealtimeNotification,
} from "@/features/notifications/notificationsSlice";

describe("notificationsSlice", () => {
  it("upserts created notifications and keeps newest-first ordering", () => {
    const state = notificationsReducer(
      undefined,
      mergeNotificationsPage({
        items: [
          {
            id: "1",
            title: "Old",
            message: "Old",
            createdAt: "2026-01-01T00:00:00.000Z",
            read: false,
            level: "info",
          },
        ],
        nextCursor: null,
        hasMore: false,
        replace: true,
      }),
    );
    const next = notificationsReducer(
      state,
      upsertRealtimeNotification({
        id: "2",
        title: "New",
        message: "New",
        createdAt: "2026-01-02T00:00:00.000Z",
        read: false,
        level: "info",
      }),
    );

    expect(next.orderedIds[0]).toBe("2");
    expect(next.orderedIds[1]).toBe("1");
    expect(next.unreadCount).toBe(2);
  });

  it("handles read and archive events idempotently", () => {
    const initial = notificationsReducer(
      undefined,
      mergeNotificationsPage({
        items: [
          {
            id: "1",
            title: "Hello",
            message: "World",
            createdAt: "2026-01-01T00:00:00.000Z",
            read: false,
            level: "info",
          },
        ],
        nextCursor: null,
        hasMore: false,
        replace: true,
      }),
    );
    const readState = notificationsReducer(initial, markNotificationRead({ id: "1" }));
    const archivedState = notificationsReducer(readState, archiveNotification({ id: "1" }));
    const idempotentState = notificationsReducer(
      archivedState,
      archiveNotification({ id: "1" }),
    );

    expect(readState.unreadCount).toBe(0);
    expect(archivedState.orderedIds).toEqual([]);
    expect(idempotentState.orderedIds).toEqual([]);
  });

  it("updates unread count from server push", () => {
    const state = notificationsReducer(undefined, setUnreadCount(7));
    expect(state.unreadCount).toBe(7);
  });
});

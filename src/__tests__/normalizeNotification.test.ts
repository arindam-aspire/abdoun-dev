import {
  getNotificationEventPresentation,
  normalizeNotification,
  notificationItemFromPayload,
} from "@/features/notifications/normalizeNotification";

describe("normalizeNotification", () => {
  it("parses legacy minimal payloads without throwing", () => {
    expect(
      normalizeNotification({
        id: "n1",
        title: "Hello",
        message: "World",
        unread_count: 3,
      }),
    ).toEqual({
      id: "n1",
      title: "Hello",
      message: "World",
      eventType: null,
      actionUrl: null,
      metadata: {},
      unreadCount: 3,
    });
  });

  it("supports new snake_case fields and metadata", () => {
    const meta = { lead_id: 9 };
    expect(
      normalizeNotification({
        id: 42,
        event_type: "lead.created",
        title: "Lead",
        message: "New",
        action_url: "/leads",
        metadata: meta,
        unreadCount: 1,
      }),
    ).toEqual({
      id: 42,
      title: "Lead",
      message: "New",
      eventType: "lead.created",
      actionUrl: "/leads",
      metadata: meta,
      unreadCount: 1,
    });
  });

  it("returns null for invalid payloads instead of throwing", () => {
    expect(normalizeNotification(null)).toBeNull();
    expect(normalizeNotification(undefined)).toBeNull();
    expect(normalizeNotification("x")).toBeNull();
    expect(normalizeNotification([])).toBeNull();
    expect(normalizeNotification({})).toBeNull();
    expect(normalizeNotification({ title: "x" })).toBeNull();
  });

  it("defaults missing strings and coerces numeric titles safely", () => {
    expect(
      normalizeNotification({
        id: 1,
        unread_count: 0,
      }),
    ).toMatchObject({
      id: 1,
      title: "",
      message: "",
      unreadCount: 0,
    });
    expect(
      normalizeNotification({
        id: 2,
        title: 404,
        message: true,
      }),
    ).toMatchObject({
      title: "404",
      message: "true",
    });
  });
});

describe("notificationItemFromPayload", () => {
  it("maps websocket payloads into NotificationItem", () => {
    const item = notificationItemFromPayload({
      id: "a",
      event_type: "system.maintenance",
      title: "Upcoming",
      message: "Window",
      action_url: "/notifications",
      is_read: false,
    });
    expect(item).toMatchObject({
      id: "a",
      title: "Upcoming",
      message: "Window",
      eventType: "system.maintenance",
      actionUrl: "/notifications",
      read: false,
      level: "warning",
    });
  });
});

describe("getNotificationEventPresentation", () => {
  it("never throws and returns a default bucket for unknown types", () => {
    expect(getNotificationEventPresentation(undefined)).toEqual({
      kind: "default",
      showSystemBadge: false,
    });
    expect(getNotificationEventPresentation("custom.unknown")).toEqual({
      kind: "default",
      showSystemBadge: false,
    });
    expect(getNotificationEventPresentation("system.alert")).toEqual({
      kind: "system",
      showSystemBadge: true,
    });
  });
});

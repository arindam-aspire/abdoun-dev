import {
  NotificationsRealtime,
  resolveNotificationsSocketUrl,
} from "@/features/notifications/realtime/notificationsRealtime";

type MockSocketInstance = {
  url: string;
  readyState: number;
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: ((error: unknown) => void) | null;
  onclose: ((event: { code: number }) => void) | null;
  close: jest.Mock<void, [number?, string?]>;
};

describe("NotificationsRealtime", () => {
  const originalWebSocket = global.WebSocket;
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const originalWsUrl = process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL;

  let sockets: MockSocketInstance[] = [];

  beforeEach(() => {
    jest.useFakeTimers();
    sockets = [];
    class MockWebSocket {
      static OPEN = 1;
      static CONNECTING = 0;
      public readyState = MockWebSocket.CONNECTING;
      public onopen: (() => void) | null = null;
      public onmessage: ((event: { data: string }) => void) | null = null;
      public onerror: ((error: unknown) => void) | null = null;
      public onclose: ((event: { code: number }) => void) | null = null;
      public close = jest.fn<void, [number?, string?]>();
      constructor(public readonly url: string) {
        sockets.push(this as unknown as MockSocketInstance);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.WebSocket = MockWebSocket as any;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL = originalWsUrl;
    global.WebSocket = originalWebSocket;
  });

  it("connects using /ws/notifications with token query parameter", () => {
    const onOpen = jest.fn();
    const realtime = new NotificationsRealtime({
      callbacks: {
        onOpen,
        onClose: jest.fn(),
        onReconnectAttempt: jest.fn(),
        onNotificationCreated: jest.fn(),
        onNotificationRead: jest.fn(),
        onNotificationArchived: jest.fn(),
        onUnreadCount: jest.fn(),
        onPing: jest.fn(),
        onSessionInvalid: jest.fn(),
        onError: jest.fn(),
      },
      getAccessToken: () => "abc",
      getSocketUrl: () => "ws://localhost:8000/ws/notifications",
    });

    realtime.connect();
    expect(sockets).toHaveLength(1);
    expect(sockets[0].url).toBe("ws://localhost:8000/ws/notifications?token=abc");

    sockets[0].onopen?.();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("dispatches backend event callbacks from websocket messages", () => {
    const onCreated = jest.fn();
    const onRead = jest.fn();
    const onArchived = jest.fn();
    const onUnreadCount = jest.fn();
    const onPing = jest.fn();
    const realtime = new NotificationsRealtime({
      callbacks: {
        onOpen: jest.fn(),
        onClose: jest.fn(),
        onReconnectAttempt: jest.fn(),
        onNotificationCreated: onCreated,
        onNotificationRead: onRead,
        onNotificationArchived: onArchived,
        onUnreadCount,
        onPing,
        onSessionInvalid: jest.fn(),
        onError: jest.fn(),
      },
      getAccessToken: () => "abc",
      getSocketUrl: () => "ws://localhost:8000/ws/notifications",
    });

    realtime.connect();
    const ws = sockets[0];
    ws.onmessage?.({
      data: JSON.stringify({
        event: "notification.created",
        notification: { id: "n1" },
        unread_count: 2,
      }),
    });
    ws.onmessage?.({
      data: JSON.stringify({ event: "notification.read", data: { notification_id: "n1" } }),
    });
    ws.onmessage?.({
      data: JSON.stringify({ event: "notification.archived", data: { id: "n2" } }),
    });
    ws.onmessage?.({
      data: JSON.stringify({ event: "unread_count.updated", unread_count: 5 }),
    });
    ws.onmessage?.({
      data: JSON.stringify({ event: "ping" }),
    });

    expect(onCreated).toHaveBeenCalledWith({ id: "n1" });
    expect(onRead).toHaveBeenCalledWith({ notification_id: "n1" });
    expect(onArchived).toHaveBeenCalledWith({ id: "n2" });
    expect(onUnreadCount).toHaveBeenCalledWith(2);
    expect(onUnreadCount).toHaveBeenCalledWith(5);
    expect(onPing).toHaveBeenCalledTimes(1);
  });

  it("treats legacy root notification objects as notification.created", () => {
    const onCreated = jest.fn();
    const onUnreadCount = jest.fn();
    const realtime = new NotificationsRealtime({
      callbacks: {
        onOpen: jest.fn(),
        onClose: jest.fn(),
        onReconnectAttempt: jest.fn(),
        onNotificationCreated: onCreated,
        onNotificationRead: jest.fn(),
        onNotificationArchived: jest.fn(),
        onUnreadCount,
        onPing: jest.fn(),
        onSessionInvalid: jest.fn(),
        onError: jest.fn(),
      },
      getAccessToken: () => "abc",
      getSocketUrl: () => "ws://localhost:8000/ws/notifications",
    });

    realtime.connect();
    const ws = sockets[0];
    ws.onmessage?.({
      data: JSON.stringify({
        id: "legacy-1",
        title: "Ping",
        message: "You have mail",
        unread_count: 4,
      }),
    });

    expect(onUnreadCount).toHaveBeenCalledWith(4);
    expect(onCreated).toHaveBeenCalledWith({
      id: "legacy-1",
      title: "Ping",
      message: "You have mail",
      unread_count: 4,
    });
  });

  it("reconnects with backoff after unexpected disconnect", () => {
    const onReconnectAttempt = jest.fn();
    const realtime = new NotificationsRealtime({
      callbacks: {
        onOpen: jest.fn(),
        onClose: jest.fn(),
        onReconnectAttempt,
        onNotificationCreated: jest.fn(),
        onNotificationRead: jest.fn(),
        onNotificationArchived: jest.fn(),
        onUnreadCount: jest.fn(),
        onPing: jest.fn(),
        onSessionInvalid: jest.fn(),
        onError: jest.fn(),
      },
      getAccessToken: () => "abc",
      getSocketUrl: () => "ws://localhost:8000/ws/notifications",
      baseDelayMs: 100,
      maxDelayMs: 1000,
      maxRetries: 2,
    });

    realtime.connect();
    sockets[0].onclose?.({ code: 1006 });

    expect(onReconnectAttempt).toHaveBeenCalledWith(1);
    jest.runOnlyPendingTimers();
    expect(sockets).toHaveLength(2);
  });

  it("builds default ws endpoint from API base URL origin", () => {
    process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL = "";
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000/api/v1";
    expect(resolveNotificationsSocketUrl()).toBe("ws://localhost:8000/ws/notifications");
  });
});

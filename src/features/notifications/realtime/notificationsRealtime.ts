"use client";

type RealtimeCallbacks = {
  onOpen: () => void;
  onClose: (meta: { expected: boolean; attempts: number; maxRetriesReached: boolean }) => void;
  onReconnectAttempt: (attempt: number) => void;
  onNotificationCreated: (payload: unknown) => void;
  onNotificationRead: (payload: unknown) => void;
  onNotificationArchived: (payload: unknown) => void;
  onUnreadCount: (count: number) => void;
  onPing: () => void;
  onSessionInvalid: () => void;
  onError: (error: unknown) => void;
};

type RealtimeOptions = {
  callbacks: RealtimeCallbacks;
  getAccessToken: () => string | null;
  getSocketUrl: () => string | null;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

type MessagePayload = {
  type?: string;
  event?: string;
  data?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  unread_count?: number;
  notification?: unknown;
};

export class NotificationsRealtime {
  private readonly callbacks: RealtimeCallbacks;
  private readonly getAccessToken: () => string | null;
  private readonly getSocketUrl: () => string | null;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private shouldStayConnected = false;

  constructor(options: RealtimeOptions) {
    this.callbacks = options.callbacks;
    this.getAccessToken = options.getAccessToken;
    this.getSocketUrl = options.getSocketUrl;
    this.maxRetries = options.maxRetries ?? 8;
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.maxDelayMs = options.maxDelayMs ?? 30_000;
  }

  public connect(): void {
    if (typeof window === "undefined") return;
    this.shouldStayConnected = true;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.openSocket();
  }

  public disconnect(): void {
    this.shouldStayConnected = false;
    this.clearReconnectTimer();
    if (!this.socket) return;
    const current = this.socket;
    this.socket = null;
    if (current.readyState === WebSocket.OPEN || current.readyState === WebSocket.CONNECTING) {
      current.close(1000, "normal-closure");
    }
  }

  private openSocket(): void {
    const baseUrl = this.getSocketUrl();
    const token = this.getAccessToken();
    if (!baseUrl || !token) return;

    const url = this.withToken(baseUrl, token);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.callbacks.onReconnectAttempt(0);
      this.callbacks.onOpen();
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as MessagePayload;
        const type = parsed.type ?? parsed.event ?? "";
        const eventData =
          (parsed.data as Record<string, unknown> | undefined) ??
          (parsed.payload as Record<string, unknown> | undefined) ??
          {};

        if (type === "session_invalid") {
          this.callbacks.onSessionInvalid();
          return;
        }
        if (type === "ping") this.callbacks.onPing();

        const unreadCount =
          typeof parsed.unread_count === "number"
            ? parsed.unread_count
            : typeof eventData.unread_count === "number"
              ? eventData.unread_count
              : undefined;
        if (typeof unreadCount === "number") this.callbacks.onUnreadCount(unreadCount);

        if (type === "notification.created") {
          this.callbacks.onNotificationCreated(parsed.notification ?? eventData.notification ?? eventData);
          return;
        }
        if (type === "notification.read") {
          this.callbacks.onNotificationRead(eventData);
          return;
        }
        if (type === "notification.archived") {
          this.callbacks.onNotificationArchived(eventData);
          return;
        }
        if (type === "unread_count.updated" && typeof unreadCount === "number") return;
      } catch (error) {
        this.callbacks.onError(error);
      }
    };

    this.socket.onerror = (error) => {
      this.callbacks.onError(error);
    };

    this.socket.onclose = (event) => {
      const expected = !this.shouldStayConnected || event.code === 1000;
      this.socket = null;
      const maxRetriesReached = this.reconnectAttempt >= this.maxRetries;
      this.callbacks.onClose({
        expected,
        attempts: this.reconnectAttempt,
        maxRetriesReached,
      });
      if (!expected && this.shouldStayConnected) this.scheduleReconnect();
    };
  }

  private withToken(baseUrl: string, token: string): string {
    if (baseUrl.includes("{token}")) {
      return baseUrl.replace("{token}", encodeURIComponent(token));
    }
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempt >= this.maxRetries) return;
    this.reconnectAttempt += 1;
    this.callbacks.onReconnectAttempt(this.reconnectAttempt);
    const jitter = 0.85 + Math.random() * 0.3;
    const exponentialDelay = Math.min(
      this.maxDelayMs,
      this.baseDelayMs * 2 ** (this.reconnectAttempt - 1),
    );
    const delay = Math.floor(exponentialDelay * jitter);
    this.clearReconnectTimer();
    this.reconnectTimer = window.setTimeout(() => {
      if (!this.shouldStayConnected) return;
      this.openSocket();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) return;
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
}

export const resolveNotificationsSocketUrl = (): string | null => {
  const direct = process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL;
  if (direct) return direct;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) return null;

  try {
    const parsed = new URL(apiBase);
    const wsProtocol = parsed.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${parsed.host}/ws/notifications`;
  } catch {
    return null;
  }
};

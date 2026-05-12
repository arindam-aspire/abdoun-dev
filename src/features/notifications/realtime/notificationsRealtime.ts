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
  unreadCount?: number;
  notification?: unknown;
  id?: string | number;
  title?: unknown;
  message?: unknown;
  version?: number | string;
};

function extractUnreadCountFromMessage(parsed: Record<string, unknown>, eventData: Record<string, unknown>): number | undefined {
  const candidates: unknown[] = [
    parsed.unread_count,
    parsed.unreadCount,
    eventData.unread_count,
    eventData.unreadCount,
  ];
  const nested = parsed.notification;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const n = nested as Record<string, unknown>;
    candidates.push(n.unread_count, n.unreadCount);
  }
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  }
  return undefined;
}

function looksLikeLegacyRootNotification(parsed: Record<string, unknown>): boolean {
  const routingKey = `${parsed.type ?? parsed.event ?? ""}`.trim();
  if (routingKey.length > 0) return false;
  const id = parsed.id;
  if (typeof id !== "string" && typeof id !== "number") return false;
  return (
    "title" in parsed ||
    "message" in parsed ||
    "event_type" in parsed ||
    "eventType" in parsed ||
    "action_url" in parsed ||
    "actionUrl" in parsed ||
    "metadata" in parsed
  );
}

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
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;

        const type = `${parsed.type ?? parsed.event ?? ""}`.trim();
        const eventData =
          (parsed.data as Record<string, unknown> | undefined) ??
          (parsed.payload as Record<string, unknown> | undefined) ??
          {};

        if (type === "session_invalid") {
          this.callbacks.onSessionInvalid();
          return;
        }
        if (type === "ping") this.callbacks.onPing();

        const unreadCount = extractUnreadCountFromMessage(parsed as Record<string, unknown>, eventData);
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

        // Legacy: bare notification object at root (no routing `type` / `event`), e.g. { id, title, message, unread_count }.
        if (looksLikeLegacyRootNotification(parsed as Record<string, unknown>)) {
          this.callbacks.onNotificationCreated(parsed);
          return;
        }
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
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) return null;
  try {
    const parsed = new URL(apiBase);
    const isHttps = parsed.protocol === "https:";
    // If HTTPS, prefer explicit WS URL from env
    if (isHttps) {
      return process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL || null;
    }
    // Otherwise derive from API base
    const wsProtocol = "ws:";
    return `${wsProtocol}//${parsed.host}/ws/notifications`;
  } catch {
    return null;
  }
};

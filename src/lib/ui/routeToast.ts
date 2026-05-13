export type RouteToastPayload = {
  kind: "info" | "error" | "success";
  message: string;
};

export const ROUTE_TOAST_STORAGE_KEY = "abdoun:route-toast";
export const ROUTE_TOAST_EVENT = "abdoun:route-toast";

export function queueRouteToast(toast: RouteToastPayload): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(ROUTE_TOAST_STORAGE_KEY, JSON.stringify(toast));
  window.dispatchEvent(new Event(ROUTE_TOAST_EVENT));
}

/** Removes a queued route toast before the next navigation or retry (avoids stale messages). */
export function clearPendingRouteToast(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ROUTE_TOAST_STORAGE_KEY);
  } catch {
    // ignore quota / private mode
  }
}

export function consumeRouteToast(): RouteToastPayload | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(ROUTE_TOAST_STORAGE_KEY);
  if (!raw) return null;

  window.sessionStorage.removeItem(ROUTE_TOAST_STORAGE_KEY);

  try {
    const parsed = JSON.parse(raw) as Partial<RouteToastPayload>;
    if (
      (parsed.kind === "info" || parsed.kind === "error" || parsed.kind === "success") &&
      typeof parsed.message === "string" &&
      parsed.message.trim()
    ) {
      return { kind: parsed.kind, message: parsed.message.trim() };
    }
  } catch {
    return null;
  }

  return null;
}

import {
  clearPendingRouteToast,
  queueRouteToast,
  type RouteToastPayload,
} from "@/lib/ui/routeToast";

const DEDUPE_MS = 2800;

let lastQueued: { key: string; at: number } | null = null;

function makeKey(payload: RouteToastPayload) {
  return `${payload.kind}:${payload.message}`;
}

/** Clears queued route toast + dedupe memory. Call when switching auth views or starting a new API attempt. */
export function clearAuthApiToasts(): void {
  lastQueued = null;
  clearPendingRouteToast();
}

/** Queue a global toast for auth API feedback, suppressing identical bursts (rapid double-submit). */
export function showAuthApiToast(payload: RouteToastPayload): void {
  const key = makeKey(payload);
  const now = Date.now();
  if (lastQueued && lastQueued.key === key && now - lastQueued.at < DEDUPE_MS) {
    return;
  }
  lastQueued = { key, at: now };
  queueRouteToast(payload);
}

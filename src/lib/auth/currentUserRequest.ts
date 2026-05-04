import type { AuthUser } from "@/features/auth/api/authService";
import { getCurrentUser as getCurrentUserRaw } from "@/features/auth/api/authService";

let inFlight: Promise<AuthUser> | null = null;
let lastResult: AuthUser | null = null;
let lastFetchedAt = 0;

const DEFAULT_TTL_MS = 3000;

/**
 * Deduplicates concurrent `GET /auth/me` calls and optionally serves a very short TTL cache.
 * Use `{ force: true }` after mutations (profile update, password set) so the response is never stale.
 */
export async function getCurrentUserDeduped(options?: {
  force?: boolean;
  ttlMs?: number;
}): Promise<AuthUser> {
  const force = options?.force ?? false;
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;

  if (!force && lastResult !== null && Date.now() - lastFetchedAt < ttlMs) {
    return lastResult;
  }

  if (!force && inFlight) {
    return inFlight;
  }

  if (force) {
    const user = await getCurrentUserRaw();
    lastResult = user;
    lastFetchedAt = Date.now();
    return user;
  }

  inFlight = (async () => {
    try {
      const user = await getCurrentUserRaw();
      lastResult = user;
      lastFetchedAt = Date.now();
      return user;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

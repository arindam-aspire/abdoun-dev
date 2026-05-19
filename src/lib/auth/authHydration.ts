/**
 * Client auth bootstrap gate. UiProvider calls `markAuthHydrationComplete` when
 * vault tokens are readable (or no auth is needed). Property pages use `isAuthLoading`
 * from context to avoid fetching before that point. Does not block authApi interceptors
 * (would deadlock /auth/me during bootstrap).
 */

let hydrationComplete = typeof window === "undefined";
const waiters: Array<() => void> = [];

export function isAuthHydrationComplete(): boolean {
  return hydrationComplete;
}

export function markAuthHydrationComplete(): void {
  if (hydrationComplete) return;
  hydrationComplete = true;
  waiters.splice(0).forEach((resolve) => resolve());
}

export function waitForAuthHydration(): Promise<void> {
  if (hydrationComplete) return Promise.resolve();
  return new Promise((resolve) => {
    waiters.push(resolve);
  });
}

/** @internal Test-only reset */
export function resetAuthHydrationForTests(): void {
  hydrationComplete = typeof window === "undefined";
  waiters.length = 0;
}

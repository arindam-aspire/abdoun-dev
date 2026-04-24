"use client";

import { useSyncExternalStore } from "react";

/** True after the client has mounted (avoids SSR/client auth mismatch in guards). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const id = window.requestAnimationFrame(onStoreChange);
      return () => window.cancelAnimationFrame(id);
    },
    () => true,
    () => false,
  );
}

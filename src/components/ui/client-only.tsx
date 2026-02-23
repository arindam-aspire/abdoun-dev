"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after mount. Use to avoid hydration mismatches when
 * browser extensions (e.g. password managers) inject attributes into the DOM
 * before React hydrates (e.g. fdprocessedid on buttons/inputs).
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

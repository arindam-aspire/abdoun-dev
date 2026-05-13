"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * Tracks optional `lock_until` from the backend and exposes countdown UI.
 * Does not enforce security rules — only reflects server-provided expiry.
 */
export function useLoginLockoutCountdown() {
  const [lockUntilMs, setLockUntilMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (lockUntilMs == null || lockUntilMs <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [lockUntilMs]);

  const isLockedOut = lockUntilMs != null && now < lockUntilMs;

  const countdownLabel = useMemo(() => {
    if (!isLockedOut || lockUntilMs == null) return null;
    const sec = Math.max(0, Math.ceil((lockUntilMs - now) / 1000));
    return `Try again in ${formatMmSs(sec)}`;
  }, [isLockedOut, lockUntilMs, now]);

  const beginLockout = useCallback((untilMs: number | null) => {
    if (untilMs == null || !Number.isFinite(untilMs)) {
      setLockUntilMs(null);
      return;
    }
    setLockUntilMs(untilMs > Date.now() ? untilMs : null);
  }, []);

  const clearLockout = useCallback(() => {
    setLockUntilMs(null);
  }, []);

  return {
    isLockedOut,
    countdownLabel,
    beginLockout,
    clearLockout,
  };
}

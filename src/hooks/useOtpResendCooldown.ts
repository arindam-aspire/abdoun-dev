"use client";

import { useCallback, useEffect, useState } from "react";

export const OTP_RESEND_COOLDOWN_MS = 60_000;

/**
 * After each successful OTP / verification send, call `startCooldown()`.
 * Resend UI should stay disabled while `resendLocked` is true (`secondsLeft` countdown).
 */
export function useOtpResendCooldown(isOpen: boolean) {
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setBlockedUntil(null);
      setSecondsLeft(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || blockedUntil === null) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isOpen, blockedUntil]);

  const startCooldown = useCallback(() => {
    setBlockedUntil(Date.now() + OTP_RESEND_COOLDOWN_MS);
  }, []);

  return {
    startCooldown,
    secondsLeft,
    resendLocked: secondsLeft > 0,
  };
}

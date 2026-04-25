"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { DialogRoot, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OtpSixDigitInput } from "@/components/ui/OtpSixDigitInput";
import {
  getIdentityErrorMessage,
  getProfileRequestRetryAfterSeconds,
  isProfileRequestRateLimited,
  requestPhoneOtp,
  verifyPhoneOtp,
  type ProfileRequestExtras,
} from "@/lib/profileApi";
import { formatPhoneDialHyphenNational } from "@/lib/phoneDisplay";
import { useOtpResendCooldown } from "@/hooks/useOtpResendCooldown";

function rateLimitMessage(
  err: unknown,
  t: (key: string, values?: Record<string, string | number>) => string,
): string {
  const sec = getProfileRequestRetryAfterSeconds(err);
  if (sec != null && sec > 0) {
    return t("profileRequestRateLimitedRetryIn", { seconds: sec });
  }
  return t("profileRequestRateLimited");
}

export interface PhoneOtpModalProps {
  open: boolean;
  onClose: () => void;
  phone: string;
  /** Latest `dev_phone_otp` from the parent’s first PATCH, when the server exposes it. */
  initialDevPhoneOtp?: string | null;
  /** Repeat on resend: same PATCH body as the initial request (e.g. pending `full_name`). */
  requestExtras?: ProfileRequestExtras;
  /** Parent already called `requestPhoneOtp` — skip auto-send on open. */
  assumeOtpAlreadySent?: boolean;
  /** Called when an OTP was successfully sent (initial or resend). */
  onOtpSent?: () => void;
  onVerified: () => void | Promise<void>;
}

export function PhoneOtpModal({
  open,
  onClose,
  phone,
  initialDevPhoneOtp = null,
  requestExtras,
  assumeOtpAlreadySent = false,
  onOtpSent,
  onVerified,
}: PhoneOtpModalProps) {
  const t = useTranslations("profile");
  const phoneForIntro = useMemo(() => formatPhoneDialHyphenNational(phone), [phone]);
  const { startCooldown: startResendCooldown, secondsLeft: resendSecondsLeft, resendLocked } =
    useOtpResendCooldown(open);
  const [otp, setOtp] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devPhoneOtp, setDevPhoneOtp] = useState<string | null>(null);

  /** PATCH /auth/me/profile/request — initial send, resend, and auto-open send use the same call. */
  const sendChallengePatch = useCallback(async () => {
    const res = await requestPhoneOtp(phone, requestExtras);
    setDevPhoneOtp(res.dev_phone_otp ?? null);
    return res;
  }, [phone, requestExtras]);

  const sendOtp = useCallback(async () => {
    setError(null);
    setRequestingOtp(true);
    try {
      await sendChallengePatch();
      setOtpSent(true);
      setOtp("");
      startResendCooldown();
      onOtpSent?.();
    } catch (e) {
      setError(
        isProfileRequestRateLimited(e)
          ? rateLimitMessage(e, t)
          : getIdentityErrorMessage(e, t("identityGenericError")),
      );
    } finally {
      setRequestingOtp(false);
    }
  }, [sendChallengePatch, onOtpSent, startResendCooldown, t]);

  useEffect(() => {
    if (!open) {
      setOtp("");
      setOtpSent(false);
      setError(null);
      setRequestingOtp(false);
      setVerifyingOtp(false);
      setDevPhoneOtp(null);
      return;
    }
    if (assumeOtpAlreadySent) {
      setOtpSent(true);
      setOtp("");
      setRequestingOtp(false);
      setError(null);
      setDevPhoneOtp(initialDevPhoneOtp ?? null);
      startResendCooldown();
      return;
    }
    let cancelled = false;
    setError(null);
    setRequestingOtp(true);
    void requestPhoneOtp(phone, requestExtras)
      .then((res) => {
        if (!cancelled) {
          setDevPhoneOtp(res.dev_phone_otp ?? null);
          setOtpSent(true);
          setOtp("");
          startResendCooldown();
          onOtpSent?.();
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            isProfileRequestRateLimited(e)
              ? rateLimitMessage(e, t)
              : getIdentityErrorMessage(e, t("identityGenericError")),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setRequestingOtp(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, phone, assumeOtpAlreadySent, initialDevPhoneOtp, requestExtras, onOtpSent, startResendCooldown, t]);

  const handleVerify = useCallback(async () => {
    setError(null);
    setVerifyingOtp(true);
    try {
      await verifyPhoneOtp({ phone_number: phone, phone_otp: otp.trim() });
      await Promise.resolve(onVerified());
      setOtp("");
      setOtpSent(false);
      onClose();
    } catch (e) {
      setError(getIdentityErrorMessage(e, t("identityGenericError")));
      setOtp("");
    } finally {
      setVerifyingOtp(false);
    }
  }, [otp, phone, onVerified, onClose, t]);

  const handleClose = useCallback(() => {
    setOtp("");
    setOtpSent(false);
    setError(null);
    setDevPhoneOtp(null);
    onClose();
  }, [onClose]);

  return (
    <DialogRoot open={open} onClose={handleClose} className="dark:bg-zinc-900">
      <DialogTitle>{t("verifyPhoneTitle")}</DialogTitle>
      <DialogDescription className="dark:text-zinc-400">
        {t("verifyPhoneIntro", { phone: phoneForIntro })}
      </DialogDescription>

      {otpSent ? (
        <p className="mt-3 text-size-sm text-emerald-700 dark:text-emerald-400">{t("otpSentHint")}</p>
      ) : null}

      {devPhoneOtp ? (
        <p
          className="mt-2 text-size-sm font-medium text-amber-900 dark:text-amber-200"
          role="status"
        >
          {t("devPhoneOtpHint", { code: devPhoneOtp })}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-size-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4">
        <Label htmlFor="profile-phone-otp-0" className="mb-2 block">
          {t("otpLabel")}
        </Label>
        <OtpSixDigitInput
          idPrefix="profile-phone-otp"
          groupLabel={t("otpLabel")}
          value={otp}
          onChange={setOtp}
          disabled={verifyingOtp || requestingOtp || !otpSent}
          invalid={!!error}
          autoFocus={otpSent}
        />
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={handleClose} disabled={verifyingOtp}>
          {t("cancel")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void sendOtp()}
          disabled={requestingOtp || verifyingOtp || resendLocked}
        >
          {requestingOtp ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("sending")}
            </>
          ) : resendLocked ? (
            t("resendOtpAvailableIn", { seconds: resendSecondsLeft })
          ) : (
            t("resendOtp")
          )}
        </Button>
        <Button
          type="button"
          onClick={() => void handleVerify()}
          disabled={otp.length !== 6 || verifyingOtp || requestingOtp || !otpSent}
        >
          {verifyingOtp ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("verifying")}
            </>
          ) : (
            t("verify")
          )}
        </Button>
      </DialogFooter>
    </DialogRoot>
  );
}

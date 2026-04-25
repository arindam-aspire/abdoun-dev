"use client";

import { useCallback, useEffect, useState } from "react";
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
  requestEmailChange,
  verifyEmail,
  type ProfileRequestExtras,
} from "@/lib/profileApi";
import { useOtpResendCooldown } from "@/hooks/useOtpResendCooldown";

type Step = "send" | "sent";

export interface EmailVerifyModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  /** Repeat on resend: same PATCH body as the initial request (e.g. pending `full_name`). */
  requestExtras?: ProfileRequestExtras;
  /** Parent already called `requestEmailChange` — show verify step only (no second send). */
  assumeVerificationEmailAlreadySent?: boolean;
  /** Called when the verification email was sent from inside this modal (send step). */
  onVerificationSent?: () => void;
  /** After user completes OTP verification and parent refreshes session */
  onVerified: () => void | Promise<void>;
}

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

export function EmailVerifyModal({
  open,
  onClose,
  email,
  requestExtras,
  assumeVerificationEmailAlreadySent = false,
  onVerificationSent,
  onVerified,
}: EmailVerifyModalProps) {
  const t = useTranslations("profile");
  const { startCooldown: startResendCooldown, secondsLeft: resendSecondsLeft, resendLocked } =
    useOtpResendCooldown(open);
  const [step, setStep] = useState<Step>("send");
  const [emailOtp, setEmailOtp] = useState("");
  const [requestingEmail, setRequestingEmail] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResentCheckInboxBanner, setShowResentCheckInboxBanner] = useState(false);

  const resetState = useCallback(() => {
    setStep("send");
    setEmailOtp("");
    setRequestingEmail(false);
    setVerifying(false);
    setError(null);
    setShowResentCheckInboxBanner(false);
  }, []);

  useEffect(() => {
    if (!open) {
      setShowResentCheckInboxBanner(false);
      return;
    }
    if (assumeVerificationEmailAlreadySent) {
      setStep("sent");
      setEmailOtp("");
      setRequestingEmail(false);
      setVerifying(false);
      setError(null);
      setShowResentCheckInboxBanner(false);
      startResendCooldown();
      return;
    }
    resetState();
  }, [open, assumeVerificationEmailAlreadySent, resetState, startResendCooldown]);

  const handleOpenChange = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const patchRequest = useCallback(async () => {
    return requestEmailChange(email, requestExtras);
  }, [email, requestExtras]);

  const handleSend = useCallback(async () => {
    setError(null);
    setRequestingEmail(true);
    try {
      await patchRequest();
      setEmailOtp("");
      setStep("sent");
      setShowResentCheckInboxBanner(false);
      startResendCooldown();
      onVerificationSent?.();
    } catch (e) {
      setError(
        isProfileRequestRateLimited(e)
          ? rateLimitMessage(e, t)
          : getIdentityErrorMessage(e, t("identityGenericError")),
      );
    } finally {
      setRequestingEmail(false);
    }
  }, [patchRequest, onVerificationSent, startResendCooldown, t]);

  /** Resend = same PATCH /auth/me/profile/request again (replaces previous challenge). */
  const handleResend = useCallback(async () => {
    setError(null);
    setRequestingEmail(true);
    try {
      await patchRequest();
      setEmailOtp("");
      setShowResentCheckInboxBanner(true);
      startResendCooldown();
      onVerificationSent?.();
    } catch (e) {
      setError(
        isProfileRequestRateLimited(e)
          ? rateLimitMessage(e, t)
          : getIdentityErrorMessage(e, t("identityGenericError")),
      );
    } finally {
      setRequestingEmail(false);
    }
  }, [patchRequest, onVerificationSent, startResendCooldown, t]);

  const handleVerify = useCallback(async () => {
    setError(null);
    setVerifying(true);
    try {
      await verifyEmail({ email, emailOtp: emailOtp.trim() });
      await Promise.resolve(onVerified());
      resetState();
      onClose();
    } catch (e) {
      setError(getIdentityErrorMessage(e, t("identityGenericError")));
      setEmailOtp("");
    } finally {
      setVerifying(false);
    }
  }, [email, emailOtp, onVerified, onClose, resetState, t]);

  return (
    <DialogRoot open={open} onClose={handleOpenChange} className="dark:bg-zinc-900">
      <DialogTitle>{t("verifyEmailTitle")}</DialogTitle>
      <DialogDescription className="dark:text-zinc-400">
        {t("verifyEmailIntro", { email })}
      </DialogDescription>

      {error ? (
        <p className="mt-3 text-size-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {step === "send" ? (
        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={handleOpenChange} disabled={requestingEmail}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={() => void handleSend()} disabled={requestingEmail}>
            {requestingEmail ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {t("sending")}
              </>
            ) : (
              t("sendVerificationEmail")
            )}
          </Button>
        </DialogFooter>
      ) : null}

      {step === "sent" ? (
        <div className="mt-4 space-y-4">
          <p className="text-size-sm text-emerald-700 dark:text-emerald-400">{t("emailSentCheckInbox")}</p>
          {showResentCheckInboxBanner ? (
            <p className="text-size-sm font-medium text-sky-800 dark:text-sky-300" role="status">
              {t("verificationChallengeResentCheckEmail")}
            </p>
          ) : null}
          <p className="text-size-sm text-zinc-600 dark:text-zinc-400">{t("emailOtpSentHint")}</p>
          <div>
            <Label htmlFor="profile-email-otp-0" className="mb-2 block">
              {t("otpLabel")}
            </Label>
            <OtpSixDigitInput
              idPrefix="profile-email-otp"
              groupLabel={t("otpLabel")}
              value={emailOtp}
              onChange={setEmailOtp}
              disabled={verifying || requestingEmail}
              invalid={!!error}
              autoFocus
            />
          </div>
          <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={handleOpenChange} disabled={verifying}>
              {t("close")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleResend()}
              disabled={requestingEmail || verifying || resendLocked}
            >
              {requestingEmail ? (
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
              disabled={emailOtp.length !== 6 || verifying || requestingEmail}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t("verifying")}
                </>
              ) : (
                t("verify")
              )}
            </Button>
          </DialogFooter>
        </div>
      ) : null}
    </DialogRoot>
  );
}

"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { EmailVerifyModal } from "@/features/profile/components/modals/EmailVerifyModal";
import { useProfile } from "@/features/profile/hooks/useProfile";
import {
  getIdentityErrorMessage,
  getProfileRequestRetryAfterSeconds,
  isProfileRequestRateLimited,
  requestEmailChange,
} from "@/lib/profileApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ChangeEmailFormProps = {
  currentEmailMasked: string;
  /** Plain current address for “same as current” validation (PATCH profile flow). */
  currentEmailPlain?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  className?: string;
};

export function ChangeEmailForm({
  currentEmailMasked,
  currentEmailPlain = "",
  onSuccess,
  onError,
  className,
}: ChangeEmailFormProps) {
  const t = useTranslations("settings");
  const tp = useTranslations("profile");
  const profileBundle = useProfile();

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newError, setNewError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [assumeEmailSent, setAssumeEmailSent] = useState(false);

  const trimmedNew = newEmail.trim();
  const trimmedConfirm = confirmEmail.trim();
  const trimmedCurrentPlain = currentEmailPlain.trim();

  const showConfirmMismatch =
    trimmedConfirm.length > 0 &&
    trimmedNew.length > 0 &&
    trimmedNew.toLowerCase() !== trimmedConfirm.toLowerCase();

  const isReadyToSubmit = useMemo(() => {
    if (!trimmedNew || !EMAIL_RE.test(trimmedNew)) return false;
    if (trimmedCurrentPlain && trimmedNew.toLowerCase() === trimmedCurrentPlain.toLowerCase()) {
      return false;
    }
    if (!trimmedConfirm) return false;
    return trimmedNew.toLowerCase() === trimmedConfirm.toLowerCase();
  }, [trimmedConfirm, trimmedCurrentPlain, trimmedNew]);

  const validate = useCallback(
    (next: string, confirm: string) => {
      if (!next.trim()) {
        setNewError(t("emailRequired"));
        return false;
      }
      if (!EMAIL_RE.test(next.trim())) {
        setNewError(t("emailInvalid"));
        return false;
      }
      const plain = currentEmailPlain.trim();
      if (plain && next.trim().toLowerCase() === plain.toLowerCase()) {
        setNewError(tp("identitySameEmail"));
        return false;
      }
      setNewError(null);
      if (!confirm.trim()) {
        setConfirmError(t("emailRequired"));
        return false;
      }
      if (next.trim().toLowerCase() !== confirm.trim().toLowerCase()) {
        setConfirmError(t("emailMismatch"));
        return false;
      }
      setConfirmError(null);
      return true;
    },
    [currentEmailPlain, t, tp],
  );

  const handleModalClose = useCallback(() => {
    setEmailModalOpen(false);
    setAssumeEmailSent(false);
    void profileBundle?.refreshProfile();
  }, [profileBundle]);

  const handleVerified = useCallback(async () => {
    await profileBundle?.refreshProfile();
    onSuccess?.();
    setNewEmail("");
    setConfirmEmail("");
  }, [onSuccess, profileBundle]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate(newEmail, confirmEmail)) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await requestEmailChange(newEmail.trim());
      if (!res.requires_verification) {
        await profileBundle?.refreshProfile();
        onSuccess?.();
        setNewEmail("");
        setConfirmEmail("");
        return;
      }
      setPendingEmail(newEmail.trim());
      setAssumeEmailSent(true);
      setEmailModalOpen(true);
    } catch (err) {
      if (isProfileRequestRateLimited(err)) {
        const sec = getProfileRequestRetryAfterSeconds(err);
        onError?.(
          sec != null && sec > 0
            ? tp("profileRequestRateLimitedRetryIn", { seconds: sec })
            : tp("profileRequestRateLimited"),
        );
      } else {
        onError?.(getIdentityErrorMessage(err, t("toastError")));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className={cn("space-y-4", className)}
        noValidate
      >
        <div>
          <Label htmlFor="settings-current-email" className="mb-1.5 block">
            {t("currentEmail")}
          </Label>
          <Input
            id="settings-current-email"
            type="text"
            readOnly
            disabled
            value={currentEmailMasked}
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="settings-new-email" className="mb-1.5 block">
            {t("newEmail")}
          </Label>
          <Input
            id="settings-new-email"
            type="email"
            name="newEmail"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              if (newError) setNewError(null);
            }}
            autoComplete="email"
            aria-invalid={newError != null}
            aria-describedby={newError ? "settings-new-email-error" : undefined}
          />
          {newError ? (
            <p id="settings-new-email-error" className="mt-1 text-sm text-red-600" role="alert">
              {newError}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="settings-confirm-email" className="mb-1.5 block">
            {t("confirmEmail")}
          </Label>
          <Input
            id="settings-confirm-email"
            type="email"
            name="confirmEmail"
            value={confirmEmail}
            onChange={(e) => {
              setConfirmEmail(e.target.value);
              if (confirmError) setConfirmError(null);
            }}
            autoComplete="email"
            aria-invalid={confirmError != null || showConfirmMismatch}
            aria-describedby={
              confirmError || showConfirmMismatch ? "settings-confirm-email-error" : undefined
            }
          />
          {confirmError || showConfirmMismatch ? (
            <p id="settings-confirm-email-error" className="mt-1 text-sm text-red-600" role="alert">
              {confirmError ?? t("emailMismatch")}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isSubmitting || !isReadyToSubmit}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? t("updatingEmail") : t("submitEmail")}
        </Button>
      </form>
      <EmailVerifyModal
        open={emailModalOpen}
        onClose={handleModalClose}
        email={pendingEmail}
        assumeVerificationEmailAlreadySent={assumeEmailSent}
        onVerified={handleVerified}
      />
    </>
  );
}

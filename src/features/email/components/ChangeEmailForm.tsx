"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useChangeEmail } from "@/features/email/hooks/useChangeEmail";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ChangeEmailFormProps = {
  currentEmailMasked: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  className?: string;
};

export function ChangeEmailForm({
  currentEmailMasked,
  onSuccess,
  onError,
  className,
}: ChangeEmailFormProps) {
  const t = useTranslations("settings");
  const { updateEmail, isSubmitting } = useChangeEmail();
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newError, setNewError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

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
    [t],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate(newEmail, confirmEmail)) {
      return;
    }
    try {
      await updateEmail({
        newEmail: newEmail,
        confirmEmail: confirmEmail,
      });
      onSuccess?.();
      setNewEmail("");
      setConfirmEmail("");
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : t("toastError");
      onError?.(message);
    }
  };

  return (
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
          aria-invalid={confirmError != null}
          aria-describedby={confirmError ? "settings-confirm-email-error" : undefined}
        />
        {confirmError ? (
          <p id="settings-confirm-email-error" className="mt-1 text-sm text-red-600" role="alert">
            {confirmError}
          </p>
        ) : null}
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? t("updatingEmail") : t("submitEmail")}
      </Button>
    </form>
  );
}

"use client";

import { useMemo, useState, useCallback, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { PasswordPolicyHelper } from "@/components/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type PasswordChecks = {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

function validatePasswordStrength(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

const MIN_LEN = 8;

export type SettingsPasswordFormProps = {
  onSubmit: (args: { currentPassword: string; newPassword: string }) => Promise<void>;
  /** When true (e.g. social-only account), form is not shown. */
  disabled?: boolean;
  disabledMessage?: string;
  className?: string;
};

export function SettingsPasswordForm({
  onSubmit,
  disabled = false,
  disabledMessage,
  className,
}: SettingsPasswordFormProps) {
  const t = useTranslations("settings");
  const tp = useTranslations("profile");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checks = useMemo(() => validatePasswordStrength(next), [next]);
  const policyMet = useMemo(
    () => Object.values(validatePasswordStrength(next)).every(Boolean),
    [next],
  );

  const runSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (disabled) return;
      setFormError(null);
      if (!current.trim()) {
        setFormError(t("currentPasswordRequired"));
        return;
      }
      if (next.length < MIN_LEN) {
        setFormError(t("passwordMinLength"));
        return;
      }
      if (!policyMet) {
        setFormError(t("passwordPolicyNotMet"));
        return;
      }
      if (next !== confirm) {
        setFormError(t("passwordConfirmMismatch"));
        return;
      }
      setLoading(true);
      try {
        await onSubmit({ currentPassword: current, newPassword: next });
        setCurrent("");
        setNext("");
        setConfirm("");
      } catch (err) {
        setFormError(
          err instanceof Error && err.message ? err.message : t("toastError"),
        );
      } finally {
        setLoading(false);
      }
    },
    [confirm, current, disabled, next, onSubmit, policyMet, t],
  );

  if (disabled) {
    return (
      <p
        className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        role="status"
      >
        {disabledMessage ?? t("passwordOAuthOnly")}
      </p>
    );
  }

  return (
    <form onSubmit={(ev) => void runSubmit(ev)} className={cn("space-y-4", className)} noValidate>
      <div>
        <Label htmlFor="settings-pw-current" className="mb-1.5 block">
          {tp("currentPassword")}
        </Label>
        <div className="relative">
          <Input
            id="settings-pw-current"
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800"
            onClick={() => setShowCurrent((s) => !s)}
            aria-label={showCurrent ? "Hide" : "Show"}
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <Label htmlFor="settings-pw-new" className="mb-1.5 block">
          {tp("newPassword")}
        </Label>
        <div className="relative">
          <Input
            id="settings-pw-new"
            type={showNew ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            className="pr-10"
            aria-describedby="settings-pw-policy"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800"
            onClick={() => setShowNew((s) => !s)}
            aria-label={showNew ? "Hide" : "Show"}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div id="settings-pw-policy" className="mt-2">
          <PasswordPolicyHelper checks={checks} />
        </div>
      </div>
      <div>
        <Label htmlFor="settings-pw-confirm" className="mb-1.5 block">
          {tp("confirmNewPassword")}
        </Label>
        <Input
          id="settings-pw-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {tp("updatePassword")}
      </Button>
    </form>
  );
}

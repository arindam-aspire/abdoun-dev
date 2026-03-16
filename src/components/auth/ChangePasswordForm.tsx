 "use client";

import { useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { IconButton, Input, LoadingButton } from "@/components/ui";
import { PasswordPolicyHelper } from "@/components/auth";
import { Label } from "@/components/ui/label";

type PasswordChecks = {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

function validatePassword(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*(),.?\":{}|<>]/.test(password),
  };
}

export interface ChangePasswordFormProps {
  /** Called with (lastPassword, newPassword). Throw or reject to surface an error. */
  onSubmit: (lastPassword: string, newPassword: string) => Promise<void>;
  /** Optional initial loading state. */
  initialLoading?: boolean;
}

export function ChangePasswordForm({ onSubmit, initialLoading = false }: ChangePasswordFormProps) {
  const [lastPassword, setLastPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [lastPasswordError, setLastPasswordError] = useState<string | undefined>();
  const [newPasswordError, setNewPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(initialLoading);

  const [touchedLast, setTouchedLast] = useState(false);
  const [touchedNew, setTouchedNew] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const [showLastPassword, setShowLastPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const passwordChecks = useMemo(() => validatePassword(newPassword), [newPassword]);

  const validateLastPassword = (value: string) =>
    value.trim() ? undefined : "Last password is required.";

  const validateNewPasswordField = (value: string) =>
    Object.values(validatePassword(value)).every(Boolean)
      ? undefined
      : "Password does not meet policy.";

  const validateConfirmPasswordField = (newPwd: string, confirmPwd: string) =>
    confirmPwd === newPwd ? undefined : "Passwords do not match.";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    setTouchedLast(true);
    setTouchedNew(true);
    setTouchedConfirm(true);

    const nextLastError = validateLastPassword(lastPassword);
    const nextNewError = validateNewPasswordField(newPassword);
    const nextConfirmError = validateConfirmPasswordField(newPassword, confirmPassword);

    setLastPasswordError(nextLastError);
    setNewPasswordError(nextNewError);
    setConfirmPasswordError(nextConfirmError);

    if (nextLastError || nextNewError || nextConfirmError) return;

    try {
      setLoading(true);
      await onSubmit(lastPassword, newPassword);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to change password. Please try again.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-1.5">
        <Label
          htmlFor="change-password-last"
          className="mb-1 text-size-base fw-semibold text-zinc-800"
        >
          Last Password
        </Label>
        <Input
          id="change-password-last"
          type={showLastPassword ? "text" : "password"}
          placeholder="Enter your current password"
          value={lastPassword}
          error={lastPasswordError}
          onChange={(event) => {
            const value = event.target.value;
            setLastPassword(value);
            if (touchedLast) {
              setLastPasswordError(validateLastPassword(value));
            }
          }}
          onFocus={() => {
            setTouchedLast(true);
            setLastPasswordError(validateLastPassword(lastPassword));
          }}
          className="h-14 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-5 text-size-base text-zinc-900 placeholder:text-zinc-500 focus:border-primary focus:ring-2 focus:ring-[rgba(26,59,92,0.2)] focus:ring-offset-0"
          rightAdornment={
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowLastPassword((prev) => !prev)}
              className="h-8 w-8 rounded-full p-0 text-zinc-500 hover:text-zinc-700"
              aria-label={showLastPassword ? "Hide password" : "Show password"}
            >
              {showLastPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </IconButton>
          }
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label
          htmlFor="change-password-new"
          className="mb-1 text-size-base fw-semibold text-zinc-800"
        >
          New Password
        </Label>
        <Input
          id="change-password-new"
          type={showNewPassword ? "text" : "password"}
          placeholder="Enter new password"
          value={newPassword}
          error={newPasswordError}
          onChange={(event) => {
            const value = event.target.value;
            setNewPassword(value);
            if (touchedNew) {
              setNewPasswordError(validateNewPasswordField(value));
            }
            if (touchedConfirm) {
              setConfirmPasswordError(
                validateConfirmPasswordField(value, confirmPassword),
              );
            }
          }}
          onFocus={() => {
            setTouchedNew(true);
            setNewPasswordError(validateNewPasswordField(newPassword));
          }}
          className="h-14 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-5 text-size-base text-zinc-900 placeholder:text-zinc-500 focus:border-primary focus:ring-2 focus:ring-[rgba(26,59,92,0.2)] focus:ring-offset-0"
          rightAdornment={
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="h-8 w-8 rounded-full p-0 text-zinc-500 hover:text-zinc-700"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </IconButton>
          }
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <Label
          htmlFor="change-password-confirm"
          className="mb-1 text-size-base fw-semibold text-zinc-800"
        >
          Confirm New Password
        </Label>
        <Input
          id="change-password-confirm"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          error={confirmPasswordError}
          onChange={(event) => {
            const value = event.target.value;
            setConfirmPassword(value);
            if (touchedConfirm) {
              setConfirmPasswordError(
                validateConfirmPasswordField(newPassword, value),
              );
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
          }}
          onFocus={() => {
            setTouchedConfirm(true);
            setConfirmPasswordError(
              validateConfirmPasswordField(newPassword, confirmPassword),
            );
          }}
          className="h-14 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-5 text-size-base text-zinc-900 placeholder:text-zinc-500 focus:border-primary focus:ring-2 focus:ring-[rgba(26,59,92,0.2)] focus:ring-offset-0"
        />
      </div>

      <PasswordPolicyHelper checks={passwordChecks} />

      {submitError ? (
        <p className="text-size-sm text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}

      <LoadingButton
        type="submit"
        variant="accent"
        size="lg"
        className="h-12 w-full rounded-full"
        loading={loading}
      >
        Update password
      </LoadingButton>
    </form>
  );
}


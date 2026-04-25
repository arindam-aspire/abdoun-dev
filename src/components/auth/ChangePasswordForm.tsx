"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthPopupField, PasswordPolicyHelper } from "@/components/auth";
import { AUTH_POPUP_PRIMARY_BUTTON } from "@/components/auth/authPopupStyles";
import { LoadingButton } from "@/components/ui";

type PasswordChecks = {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

const CHANGE_PASSWORD_POLICY_REGION_ID = "change-password-new-policy";

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
  /** Called with the new password. Throw or reject to surface an error. */
  onSubmit: (newPassword: string) => Promise<void>;
  /** Optional initial loading state. */
  initialLoading?: boolean;
}

export function ChangePasswordForm({ onSubmit, initialLoading = false }: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [newPasswordError, setNewPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(initialLoading);

  const [touchedNew, setTouchedNew] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const passwordChecks = useMemo(() => validatePassword(newPassword), [newPassword]);

  const validateNewPasswordField = (value: string) =>
    Object.values(validatePassword(value)).every(Boolean)
      ? undefined
      : "Password does not meet policy.";

  const validateConfirmPasswordField = (newPwd: string, confirmPwd: string) =>
    confirmPwd === newPwd ? undefined : "Passwords do not match.";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    setTouchedNew(true);
    setTouchedConfirm(true);

    const nextNewError = validateNewPasswordField(newPassword);
    const nextConfirmError = validateConfirmPasswordField(newPassword, confirmPassword);

    setNewPasswordError(nextNewError);
    setConfirmPasswordError(nextConfirmError);

    if (nextNewError || nextConfirmError) return;

    try {
      setLoading(true);
      await onSubmit(newPassword);
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
      <div className="space-y-2">
        <AuthPopupField
          id="change-password-new"
          type={showNewPassword ? "text" : "password"}
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          error={newPasswordError}
          ariaDescribedBy={CHANGE_PASSWORD_POLICY_REGION_ID}
          onChange={(value) => {
            setNewPassword(value);
            if (touchedNew) {
              setNewPasswordError(validateNewPasswordField(value));
            }
            if (touchedConfirm) {
              setConfirmPasswordError(validateConfirmPasswordField(value, confirmPassword));
            }
          }}
          onFocus={() => {
            setTouchedNew(true);
            setNewPasswordError(validateNewPasswordField(newPassword));
          }}
          rightAdornment={(
            <button
              type="button"
              className="cursor-pointer text-zinc-500 hover:text-zinc-700"
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        />
        <div id={CHANGE_PASSWORD_POLICY_REGION_ID} role="region" aria-label="Password requirements">
          <PasswordPolicyHelper checks={passwordChecks} password={newPassword} />
        </div>
      </div>

      <AuthPopupField
        id="change-password-confirm"
        type="password"
        label="Confirm New Password"
        placeholder="Re-enter new password"
        value={confirmPassword}
        error={confirmPasswordError}
        onChange={(value) => {
          setConfirmPassword(value);
          if (touchedConfirm) {
            setConfirmPasswordError(validateConfirmPasswordField(newPassword, value));
          }
        }}
        onFocus={() => {
          setTouchedConfirm(true);
          setConfirmPasswordError(validateConfirmPasswordField(newPassword, confirmPassword));
        }}
      />

      {submitError ? (
        <p className="text-size-sm text-red-600" role="alert">
          {submitError}
        </p>
      ) : null}

      <LoadingButton
        type="submit"
        variant="accent"
        size="lg"
        className={AUTH_POPUP_PRIMARY_BUTTON}
        loading={loading}
      >
        Update password
      </LoadingButton>
    </form>
  );
}


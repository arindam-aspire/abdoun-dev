"use client";

import { useState, useCallback, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneNumberInputField } from "@/components/ui/PhoneNumberInputField";
import { cn } from "@/lib/cn";

export interface SignInSecurityTabProps {
  email: string;
  phone: string;
  /** Mock last sign-in text for display. */
  lastSignInText?: string;
  onPhoneUpdate?: (phone: string) => Promise<void>;
  onPasswordChange?: (currentPassword: string, newPassword: string) => Promise<void>;
  isRtl?: boolean;
  className?: string;
}

export function SignInSecurityTab({
  email,
  phone,
  lastSignInText,
  onPhoneUpdate,
  onPasswordChange,
  isRtl = false,
  className,
}: SignInSecurityTabProps) {
  const t = useTranslations("profile");
  const [showEmail, setShowEmail] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState(phone);

  useEffect(() => {
    setPhoneValue(phone);
  }, [phone]);

  const maskedEmail =
    email && email.length > 3
      ? `${email.slice(0, 2)}***${email.slice(email.indexOf("@"))}`
      : "•••@•••";

  const handleUpdatePassword = useCallback(async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (!onPasswordChange) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      return;
    }
    setLoading(true);
    try {
      await onPasswordChange(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }, [newPassword, confirmPassword, currentPassword, onPasswordChange]);

  const handleSavePhone = useCallback(
    async () => {
      if (!onPhoneUpdate) return;
      if (!phoneValue?.trim()) {
        setPhoneError("Phone number is required.");
        return;
      }
      setPhoneError(null);
      await onPhoneUpdate(phoneValue);
    },
    [onPhoneUpdate, phoneValue],
  );

  return (
    <div
      className={cn("space-y-6", className)}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Email */}
      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <Mail className="h-4 w-4 shrink-0 text-zinc-500" />
          {t("emailUsedForSignIn")}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
            {showEmail ? email : maskedEmail}
          </span>
          <button
            type="button"
            onClick={() => setShowEmail((prev) => !prev)}
            className="rounded px-2 py-1 text-xs font-medium text-primary hover:underline"
          >
            {showEmail ? t("close") : t("viewEmail")}
          </button>
        </div>
      </section>

      {/* Phone */} 
      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <Phone className="h-4 w-4 shrink-0 text-zinc-500" />
          {t("phoneNumber")}
        </div>
        <PhoneNumberInputField
          value={phoneValue || undefined}
          onChange={(v) => setPhoneValue(v ?? "")}
          placeholder={t("phonePlaceholder")}
          showFlag={true}
          showCountryCode={true}
          showDialCode={true}
        />
        <Button type="button" size="sm" className="mt-3 text-white" onClick={() => void handleSavePhone()}>
          {t("save")}
        </Button>
        {phoneError ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {phoneError}
          </p>
        ) : null}
      </section>

      {/* Password */}
      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <Lock className="h-4 w-4 shrink-0 text-zinc-500" />
          {t("changePassword")}
        </div>
        {!showPasswordForm ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setShowPasswordForm(true)}
          >
            {t("changePassword")}
          </Button>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("currentPassword")}
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showCurrentPassword ? "Hide" : "Show"}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("newPassword")}
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  aria-label={showNewPassword ? "Hide" : "Show"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("confirmNewPassword")}
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400" role="status">
                {t("passwordUpdated")}
              </p>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleUpdatePassword}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            >
              {loading ? "..." : t("updatePassword")}
            </Button>
          </div>
        )}
      </section>

      {/* Last sign-in (mock) */}
      {lastSignInText && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("lastSignIn")}: {lastSignInText}
        </p>
      )}
    </div>
  );
}

import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button, LoadingButton } from "@/components/ui";
import { AuthPopupField } from "@/components/auth";
import {
  AUTH_POPUP_DIVIDER,
  AUTH_POPUP_FOOTER,
  AUTH_POPUP_FOOTER_CAPTION,
  AUTH_POPUP_FOOTER_LINK,
  AUTH_POPUP_OUTLINE_BUTTON,
  AUTH_POPUP_PRIMARY_BUTTON,
  AUTH_POPUP_STEP_STACK,
  AUTH_POPUP_TEXT_LINK,
} from "@/components/auth/authPopupStyles";
import type { useTranslations } from "@/hooks/useTranslations";

interface AuthPopupEmailStepProps {
  t: ReturnType<typeof useTranslations>;
  locale: string;
  loading: boolean;
  /** When true, password login is blocked until server lock expires (optional countdown). */
  loginDisabledByLock?: boolean;
  lockCountdownLabel?: string | null;
  showPassword: boolean;
  emailIdentifier: string;
  password: string;
  emailError?: string;
  passwordError?: string;
  onChangeEmailIdentifier: (value: string) => void;
  onChangePassword: (value: string) => void;
  onFocusEmailIdentifier?: () => void;
  onFocusPassword?: () => void;
  onTogglePasswordVisibility: () => void;
  onForgotPassword: () => void;
  onSubmit: () => void;
  onGoOneTimeCode: () => void;
  onGoSignup: () => void;
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
}

export function AuthPopupEmailStep({
  t,
  locale,
  loading,
  loginDisabledByLock = false,
  lockCountdownLabel,
  showPassword,
  emailIdentifier,
  password,
  emailError,
  passwordError,
  onChangeEmailIdentifier,
  onChangePassword,
  onFocusEmailIdentifier,
  onFocusPassword,
  onTogglePasswordVisibility,
  onForgotPassword,
  onSubmit,
  onGoOneTimeCode,
  onGoSignup,
  rememberMe,
  onRememberMeChange,
}: AuthPopupEmailStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginDisabledByLock) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={AUTH_POPUP_STEP_STACK}>
      <AuthPopupField
        id="auth-email-or-phone"
        label={t("emailOrPhoneIncludingCountryCode")}
        placeholder={t("emailOrPhoneIncludingCountryCode")}
        value={emailIdentifier}
        onChange={onChangeEmailIdentifier}
        onFocus={onFocusEmailIdentifier}
        error={emailError}
        disabled={loading}
      />
      <AuthPopupField
        id="auth-password"
        type={showPassword ? "text" : "password"}
        label={t("password")}
        placeholder={t("passwordPlaceholder")}
        value={password}
        onChange={onChangePassword}
        onFocus={onFocusPassword}
        error={passwordError}
        disabled={loading}
        rightAdornment={(
          <button
            type="button"
            disabled={loading}
            className="cursor-pointer text-zinc-500 hover:text-zinc-700 disabled:pointer-events-none disabled:opacity-40"
            onClick={onTogglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      />
      <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <label className="flex min-w-0 cursor-pointer items-center gap-2.5 text-sm text-slate-700 select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            disabled={loading}
          />
          <span className="truncate">{t("rememberMe")}</span>
        </label>
        <button
          type="button"
          className={`shrink-0 ${AUTH_POPUP_TEXT_LINK}`}
          onClick={onForgotPassword}
        >
          {t("forgotPassword")}
        </button>
      </div>
      <LoadingButton
        type="submit"
        className={AUTH_POPUP_PRIMARY_BUTTON}
        loading={loading}
        disabled={loginDisabledByLock}
      >
        {t("logIn")}
      </LoadingButton>

      {lockCountdownLabel ? (
        <p className="text-center text-xs font-medium text-amber-800" role="status">
          {lockCountdownLabel}
        </p>
      ) : null}

      <p className="px-1 text-center text-xs leading-6 text-slate-600">
        {t("signInTermsPrefix")}{" "}
        <Link
          href={`/${locale}/terms`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-600 underline decoration-slate-600 underline-offset-2 hover:text-slate-900 hover:decoration-slate-900"
        >
          {t("termsAndConditions")}
        </Link>{" "}
        {t("and")}{" "}
        <Link
          href={`/${locale}/privacy`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-600 underline decoration-slate-600 underline-offset-2 hover:text-slate-900 hover:decoration-slate-900"
        >
          {t("privacyPolicy")}
        </Link>
      </p>

      <div className={AUTH_POPUP_DIVIDER}>
        {t("or")}
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={AUTH_POPUP_OUTLINE_BUTTON}
        disabled={loading}
        onClick={onGoOneTimeCode}
      >
        <ShieldCheck className="h-5 w-5" /> {t("loginWithCode")}
      </Button>
      <button
        type="button"
        className={`w-full cursor-pointer ${AUTH_POPUP_FOOTER}`}
        onClick={onGoSignup}
      >
        <span className={AUTH_POPUP_FOOTER_CAPTION}>
          New to Abdoun Real Estate?
        </span>
        <span className={AUTH_POPUP_FOOTER_LINK}>
          Create an account
        </span>
      </button>
    </form>
  );
}



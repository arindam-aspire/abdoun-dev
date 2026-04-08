import { Eye, EyeOff, ShieldCheck } from "lucide-react";
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
  loading: boolean;
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
}

export function AuthPopupEmailStep({
  t,
  loading,
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
}: AuthPopupEmailStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={AUTH_POPUP_STEP_STACK}>
      <AuthPopupField
        id="auth-email-or-phone"
        label={t("emailOrPhone")}
        placeholder={t("emailOrPhone")}
        value={emailIdentifier}
        onChange={onChangeEmailIdentifier}
        onFocus={onFocusEmailIdentifier}
        error={emailError}
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
        rightAdornment={(
          <button
            type="button"
            className="cursor-pointer text-zinc-500 hover:text-zinc-700"
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
      <button
        type="button"
        className={AUTH_POPUP_TEXT_LINK}
        onClick={onForgotPassword}
      >
        {t("forgotPassword")}
      </button>
      <LoadingButton
        type="submit"
        className={AUTH_POPUP_PRIMARY_BUTTON}
        loading={loading}
      >
        {t("logIn")}
      </LoadingButton>

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



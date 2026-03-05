import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthPopupField } from "@/components/auth";
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
  return (
    <div className="space-y-5">
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
            className="text-zinc-500"
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
        className="text-size-sm text-sky-800 hover:underline"
        onClick={onForgotPassword}
      >
        {t("forgotPassword")}
      </button>
      <Button
        type="button"
        variant="accent"
        size="lg"
        className="h-12 w-full rounded-full"
        disabled={loading}
        onClick={onSubmit}
      >
        {loading ? "Logging in..." : t("logIn")}
      </Button>

      <div className="py-1 text-center text-size-base text-zinc-700 sm:text-size-base">
        {t("or")}
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full border-sky-500 justify-center rounded-full bg-white text-zinc-800 hover:bg-zinc-50 sm:h-12"
        disabled={loading}
        onClick={onGoOneTimeCode}
      >
        <ShieldCheck className="h-5 w-5" /> {t("loginWithCode")}
      </Button>
      <button
        type="button"
        className="mt-2 w-full cursor-pointer text-center text-size-base fw-semibold text-black sm:mt-3 sm:text-size-base"
        onClick={onGoSignup}
      >
        {t.rich("newHereCreate", {
          action: (chunks) => <span className="text-secondary hover:underline">{chunks}</span>,
        })}
      </button>
    </div>
  );
}



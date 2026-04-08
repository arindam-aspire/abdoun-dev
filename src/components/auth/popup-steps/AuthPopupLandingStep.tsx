import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthProviderLogo } from "@/components/auth/popup-steps/AuthProviderLogo";
import {
  AUTH_POPUP_DIVIDER,
  AUTH_POPUP_FOOTER,
  AUTH_POPUP_FOOTER_CAPTION,
  AUTH_POPUP_FOOTER_LINK,
  AUTH_POPUP_OUTLINE_BUTTON,
  AUTH_POPUP_STEP_STACK,
} from "@/components/auth/authPopupStyles";
import type { useTranslations } from "@/hooks/useTranslations";

interface AuthPopupLandingStepProps {
  t: ReturnType<typeof useTranslations>;
  loading: boolean;
  onSocial: (provider: "google" | "facebook" | "apple") => void;
  onGoEmail: () => void;
  onGoOneTimeCode: () => void;
  onGoSignup: () => void;
}

export function AuthPopupLandingStep({
  t,
  loading,
  onSocial,
  onGoEmail,
  onGoOneTimeCode,
  onGoSignup,
}: AuthPopupLandingStepProps) {
  return (
    <div className={AUTH_POPUP_STEP_STACK}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={AUTH_POPUP_OUTLINE_BUTTON}
        disabled={loading}
        onClick={() => onSocial("google")}
      >
        <AuthProviderLogo
          src="/svg/google_logo.svg"
          alt="Google"
          className="bg-white"
        />{" "}
        {t("continueWithGoogle")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={AUTH_POPUP_OUTLINE_BUTTON}
        disabled={loading}
        onClick={() => onSocial("facebook")}
      >
        <AuthProviderLogo src="/svg/facebook_logo.svg" alt="Facebook" className="bg-white" />{" "}
        {t("loginWithFacebook")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={AUTH_POPUP_OUTLINE_BUTTON}
        disabled={loading}
        onClick={() => onSocial("apple")}
      >
        <AuthProviderLogo src="/svg/apple_logo.svg" alt="Apple" className="bg-white" />{" "}
        {t("loginWithApple")}
      </Button>

      <div className={AUTH_POPUP_DIVIDER}>
        {t("or")}
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className={AUTH_POPUP_OUTLINE_BUTTON}
        disabled={loading}
        onClick={onGoEmail}
      >
        <Mail className="h-5 w-5" /> {t("loginWithEmail")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={AUTH_POPUP_OUTLINE_BUTTON}
        disabled={loading}
        onClick={onGoOneTimeCode}
      >
        <ShieldCheck className="h-5 w-5" /> {t("loginWithOneTimeCode")}
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
    </div>
  );
}



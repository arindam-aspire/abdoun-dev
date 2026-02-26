import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthProviderLogo } from "@/components/auth/popup-steps/AuthProviderLogo";
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
    <div className="space-y-2.5 sm:space-y-2.5">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full border-sky-500 justify-center rounded-full bg-white text-zinc-800 hover:bg-zinc-50 sm:h-12"
        disabled={loading}
        onClick={() => onSocial("google")}
      >
        <AuthProviderLogo
          text="G"
          className="bg-white border-sky-500 text-red-500 shadow-sm"
        />{" "}
        {t("continueWithGoogle")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full border-sky-500 justify-center rounded-full bg-white text-zinc-800 hover:bg-zinc-50 sm:h-12"
        disabled={loading}
        onClick={() => onSocial("facebook")}
      >
        <AuthProviderLogo text="f" className="bg-blue-600 text-white" />{" "}
        {t("loginWithFacebook")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full border-sky-500 justify-center rounded-full bg-white text-zinc-800 hover:bg-zinc-50 sm:h-12"
        disabled={loading}
        onClick={() => onSocial("apple")}
      >
        <AuthProviderLogo text="A" className="bg-black text-white" />{" "}
        {t("loginWithApple")}
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
        onClick={onGoEmail}
      >
        <Mail className="h-5 w-5" /> {t("loginWithEmail")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full border-sky-500 justify-center rounded-full bg-white text-zinc-800 hover:bg-zinc-50 sm:h-12"
        disabled={loading}
        onClick={onGoOneTimeCode}
      >
        <ShieldCheck className="h-5 w-5" /> {t("loginWithOneTimeCode")}
      </Button>

      <button
        type="button"
        className="mt-2 w-full cursor-pointer text-center text-size-base fw-semibold text-sky-800 hover:text-sky-900 sm:mt-4 sm:text-size-base"
        onClick={onGoSignup}
      >
        {t("newHereCreate")}
      </button>
    </div>
  );
}



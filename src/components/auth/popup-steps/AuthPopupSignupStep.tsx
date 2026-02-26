import { Mail } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthPopupField, OTPVerificationBlock, PasswordPolicyHelper } from "@/components/auth";
import { AuthProviderLogo } from "@/components/auth/popup-steps/AuthProviderLogo";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import type { SignupFlowState } from "@/components/auth/popup-steps/types";
import type { useTranslations } from "@/hooks/useTranslations";

interface AuthPopupSignupStepProps {
  t: ReturnType<typeof useTranslations>;
  loading: boolean;
  signup: SignupFlowState;
  onSocial: (provider: "google" | "facebook" | "apple") => void;
  onBackToLogin: () => void;
  onFocusFullName?: () => void;
  onFocusEmail?: () => void;
  onFocusPhone?: () => void;
  onFocusPassword?: () => void;
}

export function AuthPopupSignupStep({
  t,
  loading,
  signup,
  onSocial,
  onBackToLogin,
  onFocusFullName,
  onFocusEmail,
  onFocusPhone,
  onFocusPassword,
}: AuthPopupSignupStepProps) {
  return (
    <div className="space-y-4">
      {signup.screen === "landing" ? (
        <>
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
              className="bg-white text-red-500 shadow-sm"
            />{" "}
            {t("joinWithGoogle")}
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
            {t("joinWithFacebook")}
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
            onClick={signup.actions.goManual}
          >
            <Mail className="h-5 w-5" /> {t("joinWithEmail")}
          </Button>

          <p className="px-2 text-center text-size-sm text-zinc-700">
            {t("signupTermsPrefix")}{" "}
            <span className="fw-semibold underline">
              {t("termsAndConditions")}
            </span>{" "}
            {t("and")}{" "}
            <span className="fw-semibold underline">
              {t("privacyPolicy")}
            </span>
          </p>

          <button
            type="button"
            className="mt-2 cursor-pointer w-full text-center text-size-base fw-semibold text-sky-800 hover:text-sky-900 sm:mt-4 sm:text-size-base"
            onClick={onBackToLogin}
          >
            {t("alreadyHaveAccountLogin")}
          </button>
        </>
      ) : null}

      {signup.screen === "manual" ? (
        <>
          <AuthPopupField
            id="signup-name"
            label={t("fullName")}
            placeholder={t("fullNamePlaceholder")}
            value={signup.fields.fullName}
            onChange={signup.actions.setFullName}
            onFocus={onFocusFullName}
            error={signup.errors.fullName}
          />
          <AuthPopupField
            id="signup-email"
            type="email"
            label={t("emailAddress")}
            placeholder={t("emailPlaceholder")}
            value={signup.fields.email}
            onChange={signup.actions.setEmail}
            onFocus={onFocusEmail}
            error={signup.errors.email}
          />
          <PhoneNumberInput
            idPrefix="signup"
            label={t("phonePlaceholder")}
            countryCode={signup.fields.phoneCountryCode}
            localNumber={signup.fields.phoneLocalNumber}
            onCountryCodeChange={signup.actions.setPhoneCountryCode}
            onLocalNumberChange={signup.actions.setPhoneLocalNumber}
            onFocus={onFocusPhone}
            placeholder={t("phonePlaceholder")}
            error={signup.errors.phone}
            required
            rowClassName="grid-cols-[10rem_1fr]"
            selectClassName="h-14 rounded-full border-2 border-[rgba(43,91,166,0.35)] px-4 text-base focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[rgba(26,59,92,0.2)] focus:ring-offset-0"
            inputClassName="h-14 rounded-full border-2 border-[rgba(43,91,166,0.35)] bg-white px-5 text-base text-zinc-900 placeholder:text-zinc-500 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[rgba(26,59,92,0.2)] focus:ring-offset-0"
            labelClassName="text-base font-semibold text-zinc-800"
          />
          <AuthPopupField
            id="signup-password"
            type="password"
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            value={signup.fields.password}
            onChange={signup.actions.setPassword}
            onFocus={onFocusPassword}
            error={signup.errors.password}
          />
          <PasswordPolicyHelper checks={signup.passwordChecks} />
          <Button
            type="button"
            variant="accent"
            size="lg"
            className="h-12 w-full rounded-full"
            disabled={signup.loading}
            onClick={signup.actions.submitManualSignup}
          >
            {signup.loading ? "Sending OTP..." : t("submitSignup")}
          </Button>
          <button
            type="button"
            className="mt-2 w-full cursor-pointer text-center text-size-base fw-semibold text-sky-800 hover:text-sky-900 sm:mt-4 sm:text-size-base"
            onClick={onBackToLogin}
          >
            {t("alreadyHaveAccountLogin")}
          </button>
        </>
      ) : null}

      {signup.screen === "otp" ? (
        <>
          {signup.debugOtp ? (
            <p className="rounded bg-zinc-100 px-3 py-2 text-size-xs">
              Demo OTP: {signup.debugOtp}
            </p>
          ) : null}
          <OTPVerificationBlock
            otp={signup.fields.otp}
            otpError={signup.errors.otp}
            secondsLeft={signup.timer.secondsLeft}
            canResend={signup.timer.canResend}
            loading={signup.loading}
            onChangeOtp={signup.actions.setOtp}
            onVerify={signup.actions.verifySignupOtp}
            onResend={signup.actions.resendSignupOtp}
          />
        </>
      ) : null}
    </div>
  );
}



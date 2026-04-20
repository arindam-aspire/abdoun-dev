import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthPopupField, OTPVerificationBlock, PasswordPolicyHelper } from "@/components/auth";
import { AuthProviderLogo } from "@/components/auth/popup-steps/AuthProviderLogo";
import {
  AUTH_POPUP_DIVIDER,
  AUTH_POPUP_FOOTER,
  AUTH_POPUP_FOOTER_CAPTION,
  AUTH_POPUP_FOOTER_LINK,
  AUTH_POPUP_OUTLINE_BUTTON,
  AUTH_POPUP_PRIMARY_BUTTON,
  AUTH_POPUP_STEP_STACK,
} from "@/components/auth/authPopupStyles";
import type { SignupFlowState } from "@/components/auth/popup-steps/types";
import type { useTranslations } from "@/hooks/useTranslations";

interface AuthPopupSignupStepProps {
  t: ReturnType<typeof useTranslations>;
  loading: boolean;
  signup: SignupFlowState;
  showPassword: boolean;
  onTogglePasswordVisibility: () => void;
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
  showPassword,
  onTogglePasswordVisibility,
  onSocial,
  onBackToLogin,
  onFocusFullName,
  onFocusEmail,
  onFocusPhone,
  onFocusPassword,
}: AuthPopupSignupStepProps) {
  return (
    <div className={AUTH_POPUP_STEP_STACK}>
      {signup.screen === "landing" ? (
        <>
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
            {t("joinWithGoogle")}
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
            {t("joinWithFacebook")}
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
            onClick={signup.actions.goManual}
          >
            <Mail className="h-5 w-5" /> {t("joinWithEmail")}
          </Button>

          <p className="px-2 text-center text-xs leading-6 text-slate-600">
            {t("signupTermsPrefix")}{" "}
            <span className="font-semibold underline">
              {t("termsAndConditions")}
            </span>{" "}
            {t("and")}{" "}
            <span className="font-semibold underline">
              {t("privacyPolicy")}
            </span>
          </p>

          <button
            type="button"
            className={`w-full cursor-pointer text-sm font-semibold text-[#0a84ff] hover:text-[#0668c7] ${AUTH_POPUP_FOOTER}`}
            onClick={onBackToLogin}
          >
            <span className={AUTH_POPUP_FOOTER_CAPTION}>
              {t("haveAccountSignIn")}
            </span>
            <span className={AUTH_POPUP_FOOTER_LINK}>
              {t("loginTitle")}
            </span>
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
          <AuthPopupField
            id="signup-phone"
            label={t("phonePlaceholder")}
            type="phone"
            showFlag={true}
            showCountryCode={true}
            showDialCode={false}
            placeholder={t("phonePlaceholder")}
            value={signup.fields.phone}
            onChange={signup.actions.setPhone}
            onFocus={onFocusPhone}
            error={signup.errors.phone}
            rightAdornment={<Phone className="h-5 w-5" />}
          />
          <AuthPopupField
            id="signup-password"
            type={showPassword ? "text" : "password"}
            label={t("password")}
            placeholder={t("passwordPlaceholder")}
            value={signup.fields.password}
            onChange={signup.actions.setPassword}
            onFocus={onFocusPassword}
            error={signup.errors.password}
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
          <PasswordPolicyHelper checks={signup.passwordChecks} />
          <Button
            type="button"
            variant="accent"
            size="lg"
            className={AUTH_POPUP_PRIMARY_BUTTON}
            disabled={signup.loading}
            onClick={signup.actions.submitManualSignup}
          >
            {signup.loading ? "Sending OTP..." : t("submitSignup")}
          </Button>
          <button
            type="button"
            className={`w-full cursor-pointer text-sm font-semibold text-[#0a84ff] hover:text-[#0668c7] ${AUTH_POPUP_FOOTER}`}
            onClick={onBackToLogin}
          >
            <span className={AUTH_POPUP_FOOTER_CAPTION}>
              {t("haveAccountSignIn")}
            </span>
            <span className={AUTH_POPUP_FOOTER_LINK}>
              {t("loginTitle")}
            </span>
          </button>
        </>
      ) : null}

      {signup.screen === "otp" ? (
        <>
          {signup.debugOtp ? (
            <p className="rounded-[0.7rem] bg-slate-100 px-3 py-2 text-xs text-slate-600">
              OTP: {signup.debugOtp}
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



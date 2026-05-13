"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";
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
import { getPasswordPolicyChecks } from "@/components/auth/passwordPolicyShared";
import type { SignupManualFormValues } from "@/hooks/useAuthForms";
import type { SignupFlowState } from "@/components/auth/popup-steps/types";
import type { useTranslations } from "@/hooks/useTranslations";

const SIGNUP_EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignupFullName(value: string): string | undefined {
  const message =
    "Full Name must contain at least 2 alphabetic characters and only letters are allowed.";
  const trimmed = value.trim();
  if (!trimmed) return message;
  if (!/^[A-Za-z\s]+$/.test(trimmed)) return message;
  if ((trimmed.match(/[A-Za-z]/g) ?? []).length < 2) return message;
  return undefined;
}

function validateSignupEmailFormat(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Enter a valid email.";
  return SIGNUP_EMAIL_FORMAT_REGEX.test(trimmed) ? undefined : "Enter a valid email.";
}

interface AuthPopupSignupStepProps {
  t: ReturnType<typeof useTranslations>;
  loading: boolean;
  signup: SignupFlowState;
  showPassword: boolean;
  onTogglePasswordVisibility: () => void;
  onSocial: (provider: "google" | "facebook" | "apple") => void;
  onBackToLogin: () => void;
}

export function AuthPopupSignupStep({
  t,
  loading,
  signup,
  showPassword,
  onTogglePasswordVisibility,
  onSocial,
  onBackToLogin,
}: AuthPopupSignupStepProps) {
  const locale = useLocale();
  const manualForm = useForm<SignupManualFormValues>({
    defaultValues: { fullName: "", email: "", phone: "", password: "" },
    mode: "all",
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = manualForm;

  const fullNameW = watch("fullName");
  const emailW = watch("email");
  const phoneW = watch("phone");
  const passwordW = watch("password");

  useEffect(() => {
    reset({ fullName: "", email: "", phone: "", password: "" });
  }, [signup.signupGeneration, reset]);

  useEffect(() => {
    const trimmed = emailW.trim();
    if (signup.accountExistsEmail !== null && trimmed !== signup.accountExistsEmail) {
      signup.actions.clearSignupAccountConflict();
    }
  }, [emailW, signup.accountExistsEmail, signup.actions]);

  const passwordChecks = useMemo(() => getPasswordPolicyChecks(passwordW ?? ""), [passwordW]);

  const canSubmitManualSignup = useMemo(() => {
    if (signup.loading) return false;
    if (validateSignupFullName(fullNameW ?? "")) return false;
    if (validateSignupEmailFormat(emailW ?? "")) return false;
    const phone = (phoneW ?? "").trim();
    if (!phone || !isValidPhoneNumber(phone)) return false;
    if (!Object.values(passwordChecks).every(Boolean)) return false;
    const emailTrimmed = (emailW ?? "").trim();
    if (signup.accountExistsEmail !== null && signup.accountExistsEmail === emailTrimmed) return false;
    return true;
  }, [
    signup.loading,
    signup.accountExistsEmail,
    fullNameW,
    emailW,
    phoneW,
    passwordChecks,
  ]);

  const onManualSubmit = (data: SignupManualFormValues) => {
    const emailTrimmed = data.email.trim();
    if (signup.accountExistsEmail !== null && signup.accountExistsEmail === emailTrimmed) return;
    void signup.actions.submitManualSignup(data);
  };

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
        <form
          className={`${AUTH_POPUP_STEP_STACK} w-full`}
          onSubmit={handleSubmit(onManualSubmit)}
          noValidate
        >
          <Controller
            name="fullName"
            control={control}
            rules={{
              validate: (v) => validateSignupFullName(v ?? "") ?? true,
            }}
            render={({ field }) => (
              <AuthPopupField
                id="signup-name"
                label={t("fullName")}
                placeholder={t("fullNamePlaceholder")}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.fullName?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            rules={{
              validate: (v) => validateSignupEmailFormat(v ?? "") ?? true,
            }}
            render={({ field }) => (
              <AuthPopupField
                id="signup-email"
                type="email"
                label={t("emailAddress")}
                placeholder={t("emailPlaceholder")}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            rules={{
              validate: (v) => {
                const t0 = (v ?? "").trim();
                if (!t0 || !isValidPhoneNumber(t0)) return "Enter a valid phone.";
                return true;
              },
            }}
            render={({ field }) => (
              <AuthPopupField
                id="signup-phone"
                label={t("phonePlaceholder")}
                type="phone"
                placeholder={t("phonePlaceholder")}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.phone?.message}
                rightAdornment={<Phone className="h-5 w-5" />}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{
              validate: (v) => {
                const s = v ?? "";
                if (s.length > 20) return "Password must be at most 20 characters.";
                if (!Object.values(getPasswordPolicyChecks(s)).every(Boolean)) {
                  return "Password does not meet policy.";
                }
                return true;
              },
            }}
            render={({ field }) => (
              <AuthPopupField
                id="signup-password"
                type={showPassword ? "text" : "password"}
                label={t("password")}
                placeholder={t("passwordPlaceholder")}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                maxLength={20}
                error={errors.password?.message}
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
            )}
          />
          <PasswordPolicyHelper checks={passwordChecks} password={passwordW ?? ""} />
          <Button
            type="submit"
            variant="accent"
            size="lg"
            className={AUTH_POPUP_PRIMARY_BUTTON}
            disabled={signup.loading || !canSubmitManualSignup}
            aria-busy={signup.loading}
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
        </form>
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

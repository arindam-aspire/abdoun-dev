"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ArrowLeft } from "lucide-react";
import { DialogRoot } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import { AuthAlert, AuthPopupSection } from "@/components/auth";
import {
  AuthPopupEmailStep,
  AuthPopupForgotStep,
  AuthPopupLandingStep,
  AuthPopupOneTimeCodeStep,
  AuthPopupSignupStep,
} from "@/components/auth/popup-steps";
import { useForgotPasswordFlow, useOtpTimer, useSignupFlow } from "@/hooks/useAuthForms";
import { useTranslations } from "@/hooks/useTranslations";
import { persistAuthSession } from "@/lib/auth/sessionCookies";
import {
  mockAdminEmailPasswordLogin,
  mockAgentEmailPasswordLogin,
  mockManualLogin,
  mockSendOneTimeCode,
  mockVerifyOneTimeCode,
  mockResendOtp,
  mockSocialAuth,
} from "@/services/authMockService";
import { BrandLogo } from "../layout/brand-logo";

export type AuthPopupView = "landing" | "email" | "oneTimeCode" | "signup" | "forgot";

interface AuthPopupProps {
  open: boolean;
  locale: string;
  onClose: () => void;
  /** When set, popup opens directly to this view (e.g. "email" for agent login). */
  initialView?: AuthPopupView;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

function isEmailOrPhone(value: string) {
  const raw = value.trim();
  const cleaned = raw.replace(/[\s()-]/g, "");
  return EMAIL_REGEX.test(raw) || PHONE_REGEX.test(cleaned);
}

export function AuthPopup({ open, locale, onClose, initialView }: AuthPopupProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const t = useTranslations("auth");
  const signup = useSignupFlow(locale);
  const forgot = useForgotPasswordFlow();
  const isRTL = locale === "ar";

  const [view, setView] = useState<AuthPopupView>("landing");
  const [showPassword, setShowPassword] = useState(false);
  const [emailIdentifier, setEmailIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [emailIdentifierTouched, setEmailIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [otcIdentifier, setOtcIdentifier] = useState("");
  const [otcIdentifierTouched, setOtcIdentifierTouched] = useState(false);
  const [otcIdentifierError, setOtcIdentifierError] = useState<string | undefined>(undefined);
  const [otcStep, setOtcStep] = useState<"request" | "otp">("request");
  const [otcChallengeId, setOtcChallengeId] = useState("");
  const [otcOtp, setOtcOtp] = useState("");
  const [otcOtpError, setOtcOtpError] = useState<string | null>(null);
  const [otcDebugOtp, setOtcDebugOtp] = useState<string | null>(null);
  const [otcLoading, setOtcLoading] = useState(false);
  const otcTimer = useOtpTimer(60);

  useEffect(() => {
    if (open && (pathname === `/${locale}/dashboard` || pathname === `/${locale}/agent-dashboard`)) {
      onClose();
    }
  }, [locale, onClose, open, pathname]);

  useEffect(() => {
    if (open && initialView) {
      setView(initialView);
    }
  }, [open, initialView]);

  useEffect(() => {
    if (!open) {
      setView("landing");
      setShowPassword(false);
      setEmailIdentifier("");
      setPassword("");
      setEmailIdentifierTouched(false);
      setPasswordTouched(false);
      setEmailError(undefined);
      setPasswordError(undefined);
      setLoading(false);
      setMessage(null);
      setOtcIdentifier("");
      setOtcIdentifierTouched(false);
      setOtcIdentifierError(undefined);
      setOtcStep("request");
      setOtcChallengeId("");
      setOtcOtp("");
      setOtcOtpError(null);
      setOtcDebugOtp(null);
      setOtcLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && user) {
      onClose();
    }
  }, [onClose, open, user]);

  const completeAuth = (args?: { name?: string; email?: string; id?: string }) => {
    const nextUser = {
      id: args?.id ?? `mock_${Date.now()}`,
      name: args?.name ?? "Mock User",
      email: args?.email ?? "mock.user@abdoun",
      role: "user" as const,
    };

    persistAuthSession(nextUser);
    dispatch(login(nextUser));
    onClose();
  };

  const runSocial = async (provider: "google" | "facebook" | "apple") => {
    setLoading(true);
    setMessage(null);
    try {
      await mockSocialAuth(provider);
      completeAuth({
        id: `social_${provider}`,
        name: `${provider[0].toUpperCase()}${provider.slice(1)} User`,
        email: `${provider}.user@mock.abdoun`,
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Social login failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const runEmailLogin = async () => {
    setEmailIdentifierTouched(true);
    setPasswordTouched(true);
    const trimmedIdentifier = emailIdentifier.trim();
    const nextEmailError = !trimmedIdentifier
      ? "Email or phone is required."
      : !isEmailOrPhone(trimmedIdentifier)
        ? "Enter a valid email or phone."
        : undefined;
    const nextPasswordError = !password ? "Password is required." : undefined;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    setLoading(true);
    setMessage(null);
    try {
      if (trimmedIdentifier.includes("@")) {
        try {
          const agentUser = await mockAgentEmailPasswordLogin(
            trimmedIdentifier,
            password,
          );
          persistAuthSession(agentUser);
          dispatch(login(agentUser));
          onClose();
          router.push(`/${locale}/agent-dashboard`);
          return;
        } catch {
          // Not agent; try admin.
        }
        try {
          const adminUser = await mockAdminEmailPasswordLogin(
            trimmedIdentifier,
            password,
          );
          persistAuthSession(adminUser);
          dispatch(login(adminUser));
          onClose();
          router.push(`/${locale}/dashboard`);
          return;
        } catch {
          // Fall back to regular mock user login.
        }
      }

      await mockManualLogin(trimmedIdentifier, password);
      completeAuth({
        id: "manual_login",
        name: "Mock User",
        email: trimmedIdentifier.includes("@")
          ? trimmedIdentifier
          : "mock.user@abdoun",
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Invalid credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const validateEmailIdentifier = () => {
    setEmailIdentifierTouched(true);
    const trimmedIdentifier = emailIdentifier.trim();
    const nextEmailError = !trimmedIdentifier
      ? "Email or phone is required."
      : !isEmailOrPhone(trimmedIdentifier)
        ? "Enter a valid email or phone."
        : undefined;
    setEmailError(nextEmailError);
  };

  const validateEmailPassword = () => {
    setPasswordTouched(true);
    const nextPasswordError = !password ? "Password is required." : undefined;
    setPasswordError(nextPasswordError);
  };

  const runSendOneTimeCode = async () => {
    setOtcIdentifierTouched(true);
    const trimmedIdentifier = otcIdentifier.trim();
    const nextError = !trimmedIdentifier
      ? "Email or phone is required."
      : !isEmailOrPhone(trimmedIdentifier)
        ? "Enter a valid email or phone."
        : undefined;

    setOtcIdentifierError(nextError);
    if (nextError) return;

    setOtcLoading(true);
    setMessage(null);
    try {
      const result = await mockSendOneTimeCode(trimmedIdentifier);
      setOtcChallengeId(result.challengeId);
      setOtcDebugOtp(result.debugOtp ?? null);
      setMessage(result.message ?? "One-time code sent.");
      otcTimer.restart(result.expiresInSeconds);
      setOtcStep("otp");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to send code.",
      );
    } finally {
      setOtcLoading(false);
    }
  };

  const validateOtcIdentifier = () => {
    setOtcIdentifierTouched(true);
    const trimmedIdentifier = otcIdentifier.trim();
    const nextError = !trimmedIdentifier
      ? "Email or phone is required."
      : !isEmailOrPhone(trimmedIdentifier)
        ? "Enter a valid email or phone."
        : undefined;
    setOtcIdentifierError(nextError);
  };

  const runVerifyOneTimeCode = async () => {
    const otpValue = otcOtp.trim();
    if (!/^\d{6}$/.test(otpValue)) {
      setOtcOtpError("Enter a valid 6-digit OTP.");
      return;
    }
    setOtcLoading(true);
    setMessage(null);
    setOtcOtpError(null);
    try {
      await mockVerifyOneTimeCode(otcChallengeId, otpValue);
      completeAuth({
        id: `otp_${otcChallengeId}`,
        name: "OTP User",
        email: otcIdentifier.includes("@")
          ? otcIdentifier.trim()
          : "otp.user@mock.abdoun",
      });
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Invalid code. Try again.";
      setOtcOtpError(errMsg);
      setMessage(errMsg);
    } finally {
      setOtcLoading(false);
    }
  };

  const runResendOtc = async () => {
    setOtcLoading(true);
    setMessage(null);
    try {
      const result = await mockResendOtp(otcChallengeId);
      setOtcDebugOtp(result.debugOtp ?? null);
      otcTimer.restart(result.expiresInSeconds);
      setMessage("Code resent.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to resend.",
      );
    } finally {
      setOtcLoading(false);
    }
  };

  const handleBack = () => {
    if (view === "signup" && signup.screen !== "landing") {
      signup.actions.goLanding();
      return;
    }
    if (view === "oneTimeCode" && otcStep === "otp") {
      setOtcStep("request");
      setOtcOtp("");
      setOtcOtpError(null);
      setMessage(null);
      return;
    }
    setView("landing");
  };

  const showBackButton = view !== "landing";

  return (
    <DialogRoot
      open={open}
      onClose={onClose}
      containerClassName="p-0 sm:p-4"
      className="h-[100dvh] w-full max-w-none overflow-hidden rounded-none border border-subtle bg-gray-400 p-0 sm:h-[92dvh] sm:max-h-[760px] sm:max-w-[460px] sm:rounded-xl"
    >
      <div
        className="relative flex h-full flex-col bg-gradient-to-b from-white via-surface to-surface p-4 sm:p-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            {showBackButton ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1 text-size-sm fw-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} /> {t("back")}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-zinc-500 transition hover:text-zinc-900 cursor-pointer"
            aria-label="Close auth popup"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </div>

        <div className="flex justify-center">
          <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
        </div>

        <h2 className="mt-2 mb-4 text-center text-size-lg leading-tight fw-bold text-zinc-900 sm:mt-5 md:text-size-3xl">
          {view === "signup" ? t("signupLandingTitle") : t("loginTitle")}
        </h2>

        <AuthPopupSection>
          {message ? (
            <div className="mb-4">
              <AuthAlert kind="error" message={message} />
            </div>
          ) : null}

          {view === "landing" ? (
            <AuthPopupLandingStep
              t={t}
              loading={loading}
              onSocial={runSocial}
              onGoEmail={() => setView("email")}
              onGoOneTimeCode={() => setView("oneTimeCode")}
              onGoSignup={() => {
                signup.actions.goLanding();
                setView("signup");
              }}
            />
          ) : null}

          {view === "email" ? (
            <AuthPopupEmailStep
              t={t}
              loading={loading}
              showPassword={showPassword}
              emailIdentifier={emailIdentifier}
              password={password}
              emailError={emailError}
              passwordError={passwordError}
              onChangeEmailIdentifier={(value) => {
                setEmailIdentifier(value);
                if (emailIdentifierTouched) {
                  const trimmed = value.trim();
                  const nextEmailError = !trimmed
                    ? "Email or phone is required."
                    : !isEmailOrPhone(trimmed)
                      ? "Enter a valid email or phone."
                      : undefined;
                  setEmailError(nextEmailError);
                }
              }}
              onChangePassword={(value) => {
                setPassword(value);
                if (passwordTouched) {
                  setPasswordError(!value ? "Password is required." : undefined);
                }
              }}
              onFocusEmailIdentifier={validateEmailIdentifier}
              onFocusPassword={validateEmailPassword}
              onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
              onForgotPassword={() => setView("forgot")}
              onSubmit={runEmailLogin}
              onGoOneTimeCode={() => setView("oneTimeCode")}
              onGoSignup={() => {
                signup.actions.goLanding();
                setView("signup");
              }}
            />
          ) : null}

          {view === "oneTimeCode" ? (
            <AuthPopupOneTimeCodeStep
              t={t}
              otcStep={otcStep}
              otcIdentifier={otcIdentifier}
              otcIdentifierError={otcIdentifierError}
              otcOtp={otcOtp}
              otcOtpError={otcOtpError ?? undefined}
              otcDebugOtp={otcDebugOtp}
              otcLoading={otcLoading}
              secondsLeft={otcTimer.secondsLeft}
              canResend={otcTimer.canResend}
              onChangeOtcIdentifier={(value) => {
                setOtcIdentifier(value);
                if (otcIdentifierTouched) {
                  const trimmed = value.trim();
                  const nextError = !trimmed
                    ? "Email or phone is required."
                    : !isEmailOrPhone(trimmed)
                      ? "Enter a valid email or phone."
                      : undefined;
                  setOtcIdentifierError(nextError);
                }
              }}
              onFocusOtcIdentifier={validateOtcIdentifier}
              onChangeOtp={(value) => {
                setOtcOtp(value);
                if (otcOtpError) setOtcOtpError(null);
              }}
              onSendCode={runSendOneTimeCode}
              onVerifyCode={runVerifyOneTimeCode}
              onResendCode={runResendOtc}
            />
          ) : null}

          {view === "signup" ? (
            <AuthPopupSignupStep
              t={t}
              loading={loading}
              signup={signup}
              onSocial={runSocial}
              onBackToLogin={() => setView("landing")}
              onFocusFullName={() => signup.actions.validateField("fullName")}
              onFocusEmail={() => signup.actions.validateField("email")}
              onFocusPhone={() => signup.actions.validateField("phone")}
              onFocusPassword={() => signup.actions.validateField("password")}
            />
          ) : null}

          {view === "forgot" ? (
            <AuthPopupForgotStep
              t={t}
              forgot={forgot}
              onFocusIdentifier={() => forgot.actions.validateField("identifier")}
              onFocusNewPassword={() => forgot.actions.validateField("newPassword")}
              onFocusConfirmPassword={() => forgot.actions.validateField("confirmPassword")}
            />
          ) : null}
        </AuthPopupSection>
      </div>
    </DialogRoot>
  );
}




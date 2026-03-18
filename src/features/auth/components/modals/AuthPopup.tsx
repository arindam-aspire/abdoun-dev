"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ArrowLeft } from "lucide-react";
import { DialogRoot } from "@/components/ui/dialog";
import { useAppSelector } from "@/hooks/storeHooks";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { AuthPopupSection } from "@/components/auth";
import { LoadingScreen, Toast } from "@/components/ui";
import {
  AuthPopupEmailStep,
  AuthPopupForgotStep,
  AuthPopupLandingStep,
  AuthPopupOneTimeCodeStep,
  AuthPopupSignupStep,
} from "@/components/auth/popup-steps";
import { useForgotPasswordFlow, useOtpTimer, useSignupFlow } from "@/hooks/useAuthForms";
import { useTranslations } from "@/hooks/useTranslations";
import { selectCurrentUser } from "@/store/selectors";
import {
  MOCK_ADMIN_CREDENTIALS,
  MOCK_AGENT_CREDENTIALS,
} from "@/types/auth";
import {
  getCurrentUser,
  persistTokens,
  requestOtpLogin,
  setAuthUsername,
  toSessionUserForProfile,
  verifyOtpLogin,
} from "@/features/auth/api/auth.api";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { BrandLogo } from "@/components/layout/brand-logo";

export type AuthPopupView =
  | "landing"
  | "email"
  | "oneTimeCode"
  | "signup"
  | "forgot";

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
  const { loginAndPersist, persistSessionAndLogin } = useLogin();
  const user = useAppSelector(selectCurrentUser);
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
  const [toast, setToast] = useState<{ kind: "info" | "error" | "success"; message: string } | null>(null);
  const [redirectingToForceChange, setRedirectingToForceChange] = useState(false);

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
      setToast(null);
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

    persistSessionAndLogin(nextUser);
    onClose();
  };

  const runSocial = async (provider: "google" | "facebook" | "apple") => {
    setLoading(true);
    setMessage(null);
    try {
      await new Promise((r) => setTimeout(r, 800));
      if (provider === "facebook") {
        throw new Error("Provider email is not verified. Please sign up manually.");
      }
      completeAuth({
        id: `social_${provider}`,
        name: `${provider[0].toUpperCase()}${provider.slice(1)} User`,
        email: `${provider}.user@mock.abdoun`,
      });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error) });
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
        const normalizedEmail = trimmedIdentifier.toLowerCase();
        try {
          if (
            normalizedEmail === MOCK_AGENT_CREDENTIALS.email.toLowerCase() &&
            password === MOCK_AGENT_CREDENTIALS.password
          ) {
            const { sessionUser, requiresPasswordSet } = await loginAndPersist(
              trimmedIdentifier,
              password,
            );

            if (requiresPasswordSet) {
              setRedirectingToForceChange(true);
              router.push(`/${locale}/force-change-password`);
              return;
            }

            const withRole = { ...sessionUser, role: "agent" as const };
            persistSessionAndLogin(withRole);
            onClose();
            router.push(`/${locale}/agent-dashboard`);
            return;
          }
        } catch {
          // Not agent; try admin.
        }
        try {
          if (
            normalizedEmail === MOCK_ADMIN_CREDENTIALS.email.toLowerCase() &&
            password === MOCK_ADMIN_CREDENTIALS.password
          ) {
            const { sessionUser, requiresPasswordSet } = await loginAndPersist(
              trimmedIdentifier,
              password,
            );

            if (requiresPasswordSet) {
              setRedirectingToForceChange(true);
              router.push(`/${locale}/force-change-password`);
              return;
            }

            const withRole = { ...sessionUser, role: "admin" as const };
            persistSessionAndLogin(withRole);
            onClose();
            router.push(`/${locale}/dashboard`);
            return;
          }
        } catch {
          // Fall back to regular login.
        }
      }

      const { sessionUser, requiresPasswordSet } = await loginAndPersist(
        trimmedIdentifier,
        password,
      );

      if (requiresPasswordSet) {
        setRedirectingToForceChange(true);
        router.push(`/${locale}/force-change-password`);
        return;
      }

      persistSessionAndLogin(sessionUser);
      onClose();

      if (sessionUser.role === "admin") {
        setToast({ kind: "success", message: "Logged in as admin." });
        router.push(`/${locale}/dashboard`);
      } else if (sessionUser.role === "agent") {
        setToast({ kind: "success", message: "Logged in as agent." });
        router.push(`/${locale}/agent-dashboard`);
      } else {
        setToast({ kind: "success", message: "Logged in successfully." });
        router.push(`/${locale}`);
      }
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error) });
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
      const { session } = await requestOtpLogin({ username: trimmedIdentifier });
      setOtcChallengeId(session);
      setOtcDebugOtp(null);
      setToast({ kind: "success", message: "One-time code sent." });
      otcTimer.restart(60);
      setOtcStep("otp");
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error) });
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
      const tokens = await verifyOtpLogin({
        username: otcIdentifier.trim(),
        code: otpValue,
        session: otcChallengeId,
      });
      persistTokens(tokens);
      setAuthUsername(otcIdentifier.trim());
      const me = await getCurrentUser();
      if (me.requires_password_set) {
        onClose();
        router.push(`/${locale}/force-change-password`);
        return;
      }
      const sessionUser = toSessionUserForProfile(me);
      persistSessionAndLogin(sessionUser);
      onClose();
      router.push(`/${locale}`);
    } catch (error) {
      const errMsg = getApiErrorMessage(error);
      setOtcOtpError(errMsg);
      setToast({ kind: "error", message: errMsg });
    } finally {
      setOtcLoading(false);
    }
  };

  const runResendOtc = async () => {
    setOtcLoading(true);
    setMessage(null);
    try {
      const { session } = await requestOtpLogin({
        username: otcIdentifier.trim(),
      });
      setOtcChallengeId(session);
      setOtcDebugOtp(null);
      setOtcOtp("");
      setOtcOtpError(null);
      otcTimer.restart(60);
      setToast({ kind: "success", message: "Code resent." });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error) });
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
      setOtcOtpError(null);
      setMessage(null);
      return;
    }
    setView("landing");
  };

  const showBackButton = view !== "landing";

  return (
    <>
      {redirectingToForceChange ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <LoadingScreen
            title="Redirecting for security check"
            description="Please wait while we open the password change page."
            className="max-w-md w-full"
          />
        </div>
      ) : null}
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
                  <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />{" "}
                  {t("back")}
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
                showPassword={showPassword}
                onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
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

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      ) : null}
    </>
  );
}

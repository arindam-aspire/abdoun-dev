"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ArrowLeft } from "lucide-react";
import { DialogRoot } from "@/components/ui/dialog";
import { useAppSelector } from "@/hooks/storeHooks";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { AuthPopupSection } from "@/components/auth";
import { LoadingScreen } from "@/components/ui";
import {
  AuthPopupConfirmEmailStep,
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
  confirmSignup,
  isPasswordLoginUnconfirmed403,
  persistTokens,
  requestOtpLogin,
  resendConfirmation,
  setAuthUsername,
  toSessionUserForProfile,
  verifyOtpLogin,
} from "@/features/auth/api/auth.api";
import { getCurrentUserDeduped } from "@/lib/auth/currentUserRequest";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { BrandLogo } from "@/components/layout/brand-logo";
import { clearAuthApiToasts, showAuthApiToast } from "@/lib/ui/authApiToast";
import {
  ACCOUNT_TEMPORARILY_LOCKED_TOAST,
  classifyPasswordLoginFailure,
} from "@/features/auth/utils/passwordLoginFailure";
import { useLoginLockoutCountdown } from "@/features/auth/hooks/useLoginLockoutCountdown";
import {
  AUTH_API_TOAST_MESSAGES,
  authSignedInToastMessage,
} from "@/features/auth/constants/authApiToastMessages";

export type AuthPopupView =
  | "landing"
  | "email"
  | "confirmEmail"
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
  const forgot = useForgotPasswordFlow({
    onResetSuccess: () => setView("email"),
  });
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
  const [rememberMe, setRememberMe] = useState(false);

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
  const [redirectingToForceChange, setRedirectingToForceChange] = useState(false);

  const loginLockout = useLoginLockoutCountdown();

  const [confirmEmailFlow, setConfirmEmailFlow] = useState<{
    email: string;
    password: string;
    rememberMe: boolean;
  } | null>(null);
  const [confirmOtp, setConfirmOtp] = useState("");
  const [confirmEmailLoading, setConfirmEmailLoading] = useState(false);
  const confirmEmailTimer = useOtpTimer(60);
  const loginEmailAttemptIdRef = useRef(0);
  const loginPasswordSubmitInFlightRef = useRef(false);
  const confirmVerifyInFlightRef = useRef(false);
  const confirmResendInFlightRef = useRef(false);

  useEffect(() => {
    if (
      open &&
      (pathname === `/${locale}/admin-dashboard` ||
        pathname.startsWith(`/${locale}/admin-dashboard/`) ||
        pathname === `/${locale}/agent-dashboard` ||
        pathname.startsWith(`/${locale}/agent-dashboard/`))
    ) {
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
      setRememberMe(false);
      clearAuthApiToasts();
      setOtcIdentifier("");
      setOtcIdentifierTouched(false);
      setOtcIdentifierError(undefined);
      setOtcStep("request");
      setOtcChallengeId("");
      setOtcOtp("");
      setOtcOtpError(null);
      setOtcDebugOtp(null);
      setOtcLoading(false);
      signup.actions.resetSignupFlow();
      setConfirmEmailFlow(null);
      setConfirmOtp("");
      setConfirmEmailLoading(false);
      loginLockout.clearLockout();
    }
  }, [open]);

  useEffect(() => {
    if (view === "confirmEmail" && !confirmEmailFlow) {
      setView("email");
    }
  }, [view, confirmEmailFlow]);

  useEffect(() => {
    if (view !== "oneTimeCode") {
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
  }, [view]);

  useEffect(() => {
    clearAuthApiToasts();
    if (view !== "signup") {
      signup.actions.resetSignupFlow();
    }
    if (view !== "forgot") {
      forgot.actions.resetFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable flow resetters; avoid action identity churn.
  }, [view]);

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
    clearAuthApiToasts();
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
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.popupSocialLoginErrorFallback,
      });
    } finally {
      setLoading(false);
    }
  };

  async function completePasswordLoginSession(
    trimmedIdentifier: string,
    pwd: string,
    remember: boolean,
  ) {
    if (trimmedIdentifier.includes("@")) {
      const normalizedEmail = trimmedIdentifier.toLowerCase();
      try {
        if (
          normalizedEmail === MOCK_AGENT_CREDENTIALS.email.toLowerCase() &&
          pwd === MOCK_AGENT_CREDENTIALS.password
        ) {
          const { sessionUser, requiresPasswordSet } = await loginAndPersist(
            trimmedIdentifier,
            pwd,
            remember,
          );

          if (requiresPasswordSet) {
            setRedirectingToForceChange(true);
            router.push(`/${locale}/force-change-password`);
            return;
          }

          const withRole = { ...sessionUser, role: "agent" as const };
          persistSessionAndLogin(withRole);
          showAuthApiToast({
            kind: "success",
            message: AUTH_API_TOAST_MESSAGES.loginSignedInAsAgent,
          });
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
          pwd === MOCK_ADMIN_CREDENTIALS.password
        ) {
          const { sessionUser, requiresPasswordSet } = await loginAndPersist(
            trimmedIdentifier,
            pwd,
            remember,
          );

          if (requiresPasswordSet) {
            setRedirectingToForceChange(true);
            router.push(`/${locale}/force-change-password`);
            return;
          }

          const withRole = { ...sessionUser, role: "admin" as const };
          persistSessionAndLogin(withRole);
          showAuthApiToast({
            kind: "success",
            message: AUTH_API_TOAST_MESSAGES.loginSignedInAsAdmin,
          });
          onClose();
          router.push(`/${locale}/admin-dashboard`);
          return;
        }
      } catch {
        // Fall back to regular login.
      }
    }

    const { sessionUser, requiresPasswordSet } = await loginAndPersist(
      trimmedIdentifier,
      pwd,
      remember,
    );

    if (requiresPasswordSet) {
      setRedirectingToForceChange(true);
      router.push(`/${locale}/force-change-password`);
      return;
    }

    persistSessionAndLogin(sessionUser);
    showAuthApiToast({
      kind: "success",
      message: authSignedInToastMessage(
        sessionUser.role === "admin" ? "admin" : sessionUser.role === "agent" ? "agent" : "user",
      ),
    });
    onClose();

    if (sessionUser.role === "admin") {
      router.push(`/${locale}/admin-dashboard`);
    } else if (sessionUser.role === "agent") {
      router.push(`/${locale}/agent-dashboard`);
    } else {
      router.push(`/${locale}`);
    }
  }

  const runEmailLogin = async () => {
    if (loading || loginPasswordSubmitInFlightRef.current || loginLockout.isLockedOut) return;
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

    loginPasswordSubmitInFlightRef.current = true;
    const loginAttemptId = ++loginEmailAttemptIdRef.current;
    setLoading(true);
    clearAuthApiToasts();
    try {
      await completePasswordLoginSession(trimmedIdentifier, password, rememberMe);
      loginLockout.clearLockout();
      setEmailIdentifier("");
      setPassword("");
      setEmailError(undefined);
      setPasswordError(undefined);
      setEmailIdentifierTouched(false);
      setPasswordTouched(false);
      setRememberMe(false);
    } catch (error) {
      if (isPasswordLoginUnconfirmed403(error)) {
        if (!EMAIL_REGEX.test(trimmedIdentifier)) {
          if (loginAttemptId === loginEmailAttemptIdRef.current) {
            showAuthApiToast({
              kind: "error",
              message: AUTH_API_TOAST_MESSAGES.loginUnconfirmedPhoneNotSupported,
            });
          }
          return;
        }

        const emailForResend = trimmedIdentifier.toLowerCase();
        try {
          await resendConfirmation({ email: emailForResend });
          if (loginAttemptId !== loginEmailAttemptIdRef.current) return;
          setConfirmEmailFlow({ email: emailForResend, password, rememberMe });
          setConfirmOtp("");
          confirmEmailTimer.restart(60);
          setView("confirmEmail");
          window.setTimeout(() => {
            showAuthApiToast({
              kind: "success",
              message: AUTH_API_TOAST_MESSAGES.signupVerificationSent,
            });
          }, 0);
        } catch (resendErr) {
          if (loginAttemptId !== loginEmailAttemptIdRef.current) return;
          showAuthApiToast({
            kind: "error",
            message:
              getApiErrorMessage(resendErr) ||
              AUTH_API_TOAST_MESSAGES.signupResendCodeErrorFallback,
          });
        }
        return;
      }

      const outcome = classifyPasswordLoginFailure(error);
      if (outcome.kind === "account_temporarily_locked") {
        showAuthApiToast({ kind: "error", message: ACCOUNT_TEMPORARILY_LOCKED_TOAST });
        loginLockout.beginLockout(outcome.lockUntilMs);
      } else if (outcome.kind === "invalid_credentials") {
        showAuthApiToast({ kind: "error", message: outcome.toastMessage });
      } else if (outcome.kind === "server_error") {
        showAuthApiToast({
          kind: "error",
          message: outcome.toastMessage || AUTH_API_TOAST_MESSAGES.loginErrorFallback,
        });
      } else if (outcome.kind === "unconfirmed") {
        showAuthApiToast({
          kind: "error",
          message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.loginErrorFallback,
        });
      }
    } finally {
      loginPasswordSubmitInFlightRef.current = false;
      if (loginAttemptId === loginEmailAttemptIdRef.current) {
        setLoading(false);
      }
    }
  };

  const runConfirmEmailVerify = async () => {
    if (!confirmEmailFlow) return;
    if (confirmVerifyInFlightRef.current) return;
    const otpValue = confirmOtp.replace(/\s/g, "");
    if (!/^\d{6}$/.test(otpValue)) {
      showAuthApiToast({
        kind: "error",
        message: AUTH_API_TOAST_MESSAGES.otpCodeFormatInvalid,
      });
      return;
    }
    confirmVerifyInFlightRef.current = true;
    setConfirmEmailLoading(true);
    clearAuthApiToasts();
    try {
      try {
        await confirmSignup({ email: confirmEmailFlow.email, code: otpValue });
      } catch (error) {
        showAuthApiToast({
          kind: "error",
          message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.verifyOtpInvalidFallback,
        });
        return;
      }
      try {
        await completePasswordLoginSession(
          confirmEmailFlow.email,
          confirmEmailFlow.password,
          confirmEmailFlow.rememberMe,
        );
        loginLockout.clearLockout();
      } catch (error) {
        const outcome = classifyPasswordLoginFailure(error);
        if (outcome.kind === "account_temporarily_locked") {
          showAuthApiToast({ kind: "error", message: ACCOUNT_TEMPORARILY_LOCKED_TOAST });
          loginLockout.beginLockout(outcome.lockUntilMs);
        } else if (outcome.kind === "invalid_credentials") {
          showAuthApiToast({ kind: "error", message: outcome.toastMessage });
        } else if (outcome.kind === "server_error") {
          showAuthApiToast({
            kind: "error",
            message: outcome.toastMessage || AUTH_API_TOAST_MESSAGES.loginErrorFallback,
          });
        } else if (outcome.kind === "unconfirmed") {
          showAuthApiToast({
            kind: "error",
            message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.loginErrorFallback,
          });
        }
      }
    } finally {
      setConfirmEmailLoading(false);
      confirmVerifyInFlightRef.current = false;
    }
  };

  const runResendConfirmEmailOtp = async () => {
    if (!confirmEmailFlow) return;
    if (confirmResendInFlightRef.current) return;
    confirmResendInFlightRef.current = true;
    setConfirmEmailLoading(true);
    clearAuthApiToasts();
    try {
      await resendConfirmation({ email: confirmEmailFlow.email });
      confirmEmailTimer.restart(60);
      setConfirmOtp("");
      showAuthApiToast({
        kind: "success",
        message: AUTH_API_TOAST_MESSAGES.signupResendCodeSuccess,
      });
    } catch (error) {
      showAuthApiToast({
        kind: "error",
        message:
          getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.signupResendCodeErrorFallback,
      });
    } finally {
      setConfirmEmailLoading(false);
      confirmResendInFlightRef.current = false;
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
    clearAuthApiToasts();
    try {
      const { session, otp } = await requestOtpLogin({ username: trimmedIdentifier });
      setOtcChallengeId(session);
      setOtcDebugOtp(otp ?? null);
      showAuthApiToast({ kind: "success", message: AUTH_API_TOAST_MESSAGES.popupOtpSendSuccess });
      otcTimer.restart(60);
      setOtcStep("otp");
    } catch (error) {
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.popupOtpSendErrorFallback,
      });
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
    clearAuthApiToasts();
    setOtcOtpError(null);
    try {
      const tokens = await verifyOtpLogin({
        username: otcIdentifier.trim(),
        code: otpValue,
        session: otcChallengeId,
      });
      persistTokens(tokens, { rememberMe: false });
      setAuthUsername(otcIdentifier.trim(), false);
      const me = await getCurrentUserDeduped();
      if (me.requires_password_set) {
        onClose();
        router.push(`/${locale}/force-change-password`);
        return;
      }
      const sessionUser = toSessionUserForProfile(me);
      persistSessionAndLogin(sessionUser);
      showAuthApiToast({
        kind: "success",
        message: authSignedInToastMessage(
          sessionUser.role === "admin" ? "admin" : sessionUser.role === "agent" ? "agent" : "user",
        ),
      });
      onClose();

      if (sessionUser.role === "admin") {
        router.push(`/${locale}/admin-dashboard`);
      } else if (sessionUser.role === "agent") {
        router.push(`/${locale}/agent-dashboard`);
      } else {
        router.push(`/${locale}`);
      }
    } catch (error) {
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.verifyOtpInvalidFallback,
      });
    } finally {
      setOtcLoading(false);
    }
  };

  const runResendOtc = async () => {
    setOtcLoading(true);
    clearAuthApiToasts();
    try {
      const { session, otp } = await requestOtpLogin({
        username: otcIdentifier.trim(),
      });
      setOtcChallengeId(session);
      setOtcDebugOtp(otp ?? null);
      setOtcOtp("");
      setOtcOtpError(null);
      otcTimer.restart(60);
      showAuthApiToast({ kind: "success", message: AUTH_API_TOAST_MESSAGES.popupOtpResendSuccess });
    } catch (error) {
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.popupOtpResendErrorFallback,
      });
    } finally {
      setOtcLoading(false);
    }
  };

  const handleBack = () => {
    if (view === "confirmEmail") {
      setConfirmEmailFlow(null);
      setConfirmOtp("");
      setPassword("");
      setView("email");
      return;
    }
    if (view === "signup" && signup.screen !== "landing") {
      signup.actions.goLanding();
      return;
    }
    if (view === "oneTimeCode" && otcStep === "otp") {
      setOtcStep("request");
      setOtcOtpError(null);
      return;
    }
    setConfirmEmailFlow(null);
    setConfirmOtp("");
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
        containerClassName="p-4"
        className="w-full max-w-[430px] overflow-hidden rounded-[1.5rem] border-none bg-white p-0 shadow-[0_26px_60px_rgba(15,23,42,0.28)]"
      >
        <div
          className="relative flex h-full flex-col bg-white p-5 sm:p-6"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {showBackButton ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
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

          <div className="mt-3 flex justify-center">
            <BrandLogo locale={locale} variant="black" imageClassName="h-10 w-auto" />
          </div>

          <h2 className="mb-3 mt-6 text-center text-[1.85rem] font-semibold leading-[1.15] tracking-[-0.02em] text-slate-900">
            {view === "signup"
              ? t("signupLandingTitle")
              : view === "confirmEmail"
                ? t("verifyAccountTitle")
                : t("loginTitle")}
          </h2>

          <AuthPopupSection className="mt-2">
            {view === "landing" ? (
              <AuthPopupLandingStep
                t={t}
                loading={loading}
                onSocial={runSocial}
                onGoEmail={() => {
                  setConfirmEmailFlow(null);
                  setConfirmOtp("");
                  setView("email");
                }}
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
                locale={locale}
                loading={loading}
                loginDisabledByLock={loginLockout.isLockedOut}
                lockCountdownLabel={loginLockout.countdownLabel}
                showPassword={showPassword}
                emailIdentifier={emailIdentifier}
                password={password}
                emailError={emailError}
                passwordError={passwordError}
                rememberMe={rememberMe}
                onRememberMeChange={setRememberMe}
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
                onForgotPassword={() => {
                  setConfirmEmailFlow(null);
                  setConfirmOtp("");
                  setView("forgot");
                }}
                onSubmit={runEmailLogin}
                onGoOneTimeCode={() => {
                  setConfirmEmailFlow(null);
                  setConfirmOtp("");
                  setView("oneTimeCode");
                }}
                onGoSignup={() => {
                  setConfirmEmailFlow(null);
                  setConfirmOtp("");
                  signup.actions.goLanding();
                  setView("signup");
                }}
              />
            ) : null}

            {view === "confirmEmail" && confirmEmailFlow ? (
              <AuthPopupConfirmEmailStep
                t={t}
                email={confirmEmailFlow.email}
                otp={confirmOtp}
                secondsLeft={confirmEmailTimer.secondsLeft}
                canResend={confirmEmailTimer.canResend}
                loading={confirmEmailLoading}
                onChangeOtp={setConfirmOtp}
                onVerify={runConfirmEmailVerify}
                onResend={runResendConfirmEmailOtp}
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

    </>
  );
}

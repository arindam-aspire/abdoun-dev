"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useAppDispatch } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import { persistSession } from "@/lib/auth/sessionManager";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { clearAuthApiToasts, showAuthApiToast } from "@/lib/ui/authApiToast";
import type { SocialProvider } from "@/types/auth";
import {
  confirmForgotPassword,
  confirmSignup,
  loginWithPasswordAndPersist,
  requestForgotPassword,
  resendConfirmation,
  signup as apiSignup,
} from "@/features/auth/api/auth.api";
import { AxiosError } from "axios";
import { getPasswordPolicyChecks } from "@/components/auth/passwordPolicyShared";
import { AUTH_API_TOAST_MESSAGES } from "@/features/auth/constants/authApiToastMessages";
import { useLoginLockoutCountdown } from "@/features/auth/hooks/useLoginLockoutCountdown";
import {
  ACCOUNT_TEMPORARILY_LOCKED_TOAST,
  classifyPasswordLoginFailure,
} from "@/features/auth/utils/passwordLoginFailure";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignupManualFormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};
const FULL_NAME_ALLOWED_REGEX = /^[A-Za-z\s]+$/;

function isEmailOrPhone(value: string) {
  const trimmed = value.trim();
  const cleaned = trimmed.replace(/[\s()-]/g, "");

  if (!trimmed) return false;
  if (EMAIL_REGEX.test(trimmed)) return true;

  // Treat numbers with "+" as full international numbers, otherwise assume Jordan as default
  if (cleaned.startsWith("+")) {
    return isValidPhoneNumber(cleaned);
  }

  return isValidPhoneNumber(cleaned, "JO");
}

export function useOtpTimer(initialSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []); // Single interval for the component lifetime; functional setState always sees latest value

  const restart = (seconds = initialSeconds) => setSecondsLeft(seconds);

  return {
    secondsLeft,
    canResend: secondsLeft === 0,
    restart,
  };
}

export function useSignupFlow(locale: string) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [screen, setScreen] = useState<"landing" | "manual" | "otp">("landing");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  /** Email that returned 409 so the UI can block resubmit until the user changes it (no inline API copy). */
  const [accountExistsEmail, setAccountExistsEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupGeneration, setSignupGeneration] = useState(0);
  const timer = useOtpTimer(60);
  const manualSignupSubmitRef = useRef(false);
  const verifySignupSubmitRef = useRef(false);
  const signupRedirectDispatchedRef = useRef(false);
  const mountedRef = useRef(true);
  /** Password for post-OTP login; cleared from visible state after signup API for UX, but still required for `loginWithPasswordAndPersist`. */
  const signupPasswordForOtpRef = useRef("");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      manualSignupSubmitRef.current = false;
      verifySignupSubmitRef.current = false;
      setLoading(false);
    };
  }, []);

  const setFieldError = (key: string, error?: string) => {
    setErrors((prev) => {
      if (!error && !prev[key]) return prev;
      const next = { ...prev };
      if (error) next[key] = error;
      else delete next[key];
      return next;
    });
  };
  const validateFullName = (value: string) => {
    const message =
      "Name must contain at least 2 alphabetic characters and only letters are allowed.";
    const trimmed = value.trim();
    if (!trimmed) return message;
    if (!FULL_NAME_ALLOWED_REGEX.test(value)) return message;
    const letterCount = (value.match(/[A-Za-z]/g) ?? []).length;
    if (letterCount < 2) return message;
    return undefined;
  };
  const validateEmail = (value: string) =>
    EMAIL_REGEX.test(value.trim()) ? undefined : "Enter a valid email.";
  const validatePhone = (value: string) =>
    value.trim() && isValidPhoneNumber(value.trim()) ? undefined : "Enter a valid phone.";
  const validatePasswordField = (value: string) => {
    if (value.length > 20) {
      return "Password must be at most 20 characters.";
    }
    return Object.values(getPasswordPolicyChecks(value)).every(Boolean)
      ? undefined
      : "Password does not meet policy.";
  };
  const validateOtp = (value: string) =>
    /^\d{6}$/.test(value.trim()) ? undefined : "Enter a valid 6-digit OTP.";

  const resetSignupFlow = useCallback(
    (options?: { preservePostAuthRedirectGuard?: boolean }) => {
      setScreen("landing");
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setOtp("");
      setChallengeId("");
      setDebugOtp(null);
      setErrors({});
      setTouched({});
      setAccountExistsEmail(null);
      setLoading(false);
      manualSignupSubmitRef.current = false;
      verifySignupSubmitRef.current = false;
      signupPasswordForOtpRef.current = "";
      if (!options?.preservePostAuthRedirectGuard) {
        signupRedirectDispatchedRef.current = false;
      }
      timer.restart(60);
      setSignupGeneration((g) => g + 1);
    },
    [timer],
  );

  const goManual = () => {
    setScreen("manual");
    setErrors({});
    setTouched({});
    setAccountExistsEmail(null);
    clearAuthApiToasts();
  };

  const validateField = (
    field: "fullName" | "email" | "phone" | "password" | "otp",
    valueOverride?: string,
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "fullName") {
      setFieldError("fullName", validateFullName(valueOverride ?? fullName));
    } else if (field === "email") {
      setFieldError("email", validateEmail(valueOverride ?? email));
    } else if (field === "phone") {
      setFieldError("phone", validatePhone(valueOverride ?? phone));
    } else if (field === "password") {
      setFieldError("password", validatePasswordField(valueOverride ?? password));
    } else {
      setFieldError("otp", validateOtp(valueOverride ?? otp));
    }
  };

  const signupWithProvider = async (provider: SocialProvider) => {
    setLoading(true);
    clearAuthApiToasts();
    try {
      await new Promise((r) => setTimeout(r, 800));
      if (provider === "facebook") {
        throw new Error("Provider email is not verified. Please sign up manually.");
      }
      dispatch(
        login({
          id: `social_${provider}`,
          name: `${provider[0].toUpperCase()}${provider.slice(1)} User`,
          email: `${provider}.user@mock.abdoun`,
          phone: "+962600000000",
          role: "user",
        }),
      );
      router.push(`/${locale}`);
    } catch (error) {
      if (!mountedRef.current) return;
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.signupSocialErrorFallback,
      });
    } finally {
      setLoading(false);
    }
  };

  const submitManualSignup = async (values: SignupManualFormValues) => {
    if (manualSignupSubmitRef.current) return;
    manualSignupSubmitRef.current = true;
    setLoading(true);

    try {
      clearAuthApiToasts();
      setErrors({});
      setAccountExistsEmail(null);

      try {
        await apiSignup({
          full_name: values.fullName.trim(),
          email: values.email.trim(),
          phone_number: values.phone.trim(),
          password: values.password,
        });
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        if (axiosError?.response?.status === 409) {
          const emailVal = values.email.trim();
          setAccountExistsEmail(emailVal);
          showAuthApiToast({
            kind: "error",
            message: AUTH_API_TOAST_MESSAGES.signupAccountExists,
          });
          return;
        }
        throw err;
      }

      if (!mountedRef.current) return;

      const emailVal = values.email.trim();
      setEmail(emailVal);
      setChallengeId(emailVal);
      signupPasswordForOtpRef.current = values.password;
      setDebugOtp(null);
      timer.restart(60);
      setPassword("");
      setFullName("");
      setPhone("");
      setErrors({});
      setTouched({});
      setAccountExistsEmail(null);
      setScreen("otp");
      showAuthApiToast({
        kind: "success",
        message: AUTH_API_TOAST_MESSAGES.signupVerificationSent,
      });
    } catch (error) {
      if (!mountedRef.current) return;
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.signupGenericErrorFallback,
      });
    } finally {
      setLoading(false);
      manualSignupSubmitRef.current = false;
    }
  };

  const verifySignupOtp = async () => {
    if (verifySignupSubmitRef.current || signupRedirectDispatchedRef.current) return;
    setTouched((prev) => ({ ...prev, otp: true }));
    const otpError = validateOtp(otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    verifySignupSubmitRef.current = true;
    setLoading(true);
    setErrors({});
    clearAuthApiToasts();

    try {
      await confirmSignup({ email: challengeId, code: otp.trim() });
      if (!mountedRef.current) return;
      const { sessionUser } = await loginWithPasswordAndPersist(
        challengeId.trim(),
        signupPasswordForOtpRef.current,
        true,
      );
      if (!mountedRef.current) return;
      persistSession({ user: sessionUser });
      dispatch(login(sessionUser));
      showAuthApiToast({ kind: "success", message: AUTH_API_TOAST_MESSAGES.signupCompleteWelcome });

      if (signupRedirectDispatchedRef.current) return;
      signupRedirectDispatchedRef.current = true;

      resetSignupFlow({ preservePostAuthRedirectGuard: true });

      if (mountedRef.current) {
        router.push(`/${locale}`);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.verifyOtpInvalidFallback,
      });
    } finally {
      setLoading(false);
      verifySignupSubmitRef.current = false;
    }
  };

  const resendSignupOtp = async () => {
    setLoading(true);
    clearAuthApiToasts();

    try {
      await resendConfirmation({ email: challengeId });
      if (!mountedRef.current) return;
      setDebugOtp(null);
      timer.restart(60);
      showAuthApiToast({ kind: "success", message: AUTH_API_TOAST_MESSAGES.signupResendCodeSuccess });
    } catch (error) {
      if (!mountedRef.current) return;
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.signupResendCodeErrorFallback,
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const clearSignupAccountConflict = () => {
    setAccountExistsEmail(null);
  };

  return {
    screen,
    loading,
    signupGeneration,
    accountExistsEmail,
    errors,
    fields: {
      fullName,
      email,
      phone,
      password,
      otp,
    },
    debugOtp,
    timer,
    actions: {
      setFullName: (value: string) => {
        setFullName(value);
        if (touched.fullName) {
          setFieldError("fullName", validateFullName(value));
        }
      },
      setEmail: (value: string) => {
        setEmail(value);
        if (touched.email) {
          setFieldError("email", validateEmail(value));
        }
      },
      setPhone: (value: string) => {
        setPhone(value);
        if (touched.phone) {
          setFieldError("phone", validatePhone(value));
        }
      },
      setPassword: (value: string) => {
        setPassword(value);
        if (touched.password) {
          setFieldError("password", validatePasswordField(value));
        }
      },
      setOtp: (value: string) => {
        setOtp(value);
        if (touched.otp) {
          setFieldError("otp", validateOtp(value));
        }
      },
      goManual,
      signupWithProvider,
      submitManualSignup,
      verifySignupOtp,
      resendSignupOtp,
      validateField,
      resetSignupFlow,
      goLanding: resetSignupFlow,
      clearSignupAccountConflict,
    },
  };
}

export function useLoginFlow(locale: string) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const lockout = useLoginLockoutCountdown();
  const [tab, setTab] = useState<"manual" | "social">("manual");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitInFlightRef = useRef(false);

  const submitManualLogin = async () => {
    if (submitInFlightRef.current || loading || lockout.isLockedOut) return;
    if (!isEmailOrPhone(identifier)) {
      setError("Enter a valid email or phone.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    submitInFlightRef.current = true;
    setLoading(true);
    setError(null);
    clearAuthApiToasts();

    try {
      const { sessionUser, requiresPasswordSet } = await loginWithPasswordAndPersist(
        identifier,
        password,
        rememberMe,
      );
      persistSession({ user: sessionUser });
      dispatch(login(sessionUser));
      lockout.clearLockout();
      if (requiresPasswordSet) {
        router.push(`/${locale}/force-change-password`);
        return;
      }
      showAuthApiToast({ kind: "success", message: AUTH_API_TOAST_MESSAGES.loginSignedInSuccess });

      if (sessionUser.role === "admin") {
        router.push(`/${locale}/admin-dashboard`);
      } else if (sessionUser.role === "agent") {
        router.push(`/${locale}/agent-dashboard`);
      } else {
        router.push(`/${locale}`);
      }
      setIdentifier("");
      setPassword("");
      setRememberMe(false);
    } catch (err) {
      const outcome = classifyPasswordLoginFailure(err);
      if (outcome.kind === "unconfirmed") {
        showAuthApiToast({
          kind: "error",
          message: getApiErrorMessage(err) || AUTH_API_TOAST_MESSAGES.loginErrorFallback,
        });
      } else if (outcome.kind === "account_temporarily_locked") {
        showAuthApiToast({ kind: "error", message: ACCOUNT_TEMPORARILY_LOCKED_TOAST });
        lockout.beginLockout(outcome.lockUntilMs);
      } else if (outcome.kind === "invalid_credentials") {
        showAuthApiToast({ kind: "error", message: outcome.toastMessage });
      } else if (outcome.kind === "server_error") {
        showAuthApiToast({
          kind: "error",
          message: outcome.toastMessage || AUTH_API_TOAST_MESSAGES.loginErrorFallback,
        });
      }
    } finally {
      setLoading(false);
      submitInFlightRef.current = false;
    }
  };

  const submitSocialLogin = async (provider: SocialProvider) => {
    setLoading(true);
    setError(null);
    clearAuthApiToasts();
    try {
      await new Promise((r) => setTimeout(r, 800));
      if (provider === "facebook") {
        throw new Error("Provider email is not verified. Please sign up manually.");
      }
      dispatch(
        login({
          id: `social_${provider}`,
          name: `${provider[0].toUpperCase()}${provider.slice(1)} User`,
          email: `${provider}.user@mock.abdoun`,
          phone: "+962600000000",
          role: "user",
        }),
      );
      router.push(`/${locale}`);
    } catch (err) {
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(err) || AUTH_API_TOAST_MESSAGES.loginSocialProviderErrorFallback,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    tab,
    loading,
    error,
    rememberMe,
    loginLockedOut: lockout.isLockedOut,
    loginLockCountdownLabel: lockout.countdownLabel,
    fields: { identifier, password },
    actions: {
      setTab,
      setIdentifier,
      setPassword,
      setRememberMe,
      submitManualLogin,
      submitSocialLogin,
    },
  };
}

export type UseForgotPasswordFlowOptions = {
  /** Called after password reset succeeds (e.g. return user to sign-in). */
  onResetSuccess?: () => void;
};

export function useForgotPasswordFlow(options?: UseForgotPasswordFlowOptions) {
  const [step, setStep] = useState<"request" | "otp" | "reset">("request");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const timer = useOtpTimer(60);

  const passwordChecks = useMemo(() => getPasswordPolicyChecks(newPassword), [newPassword]);
  const setFieldError = (key: string, error?: string) => {
    setErrors((prev) => {
      if (!error && !prev[key]) return prev;
      const next = { ...prev };
      if (error) next[key] = error;
      else delete next[key];
      return next;
    });
  };

  const validateIdentifier = (value: string) =>
    isEmailOrPhone(value) ? undefined : "Enter a valid email or phone.";
  const validateNewPassword = (value: string) =>
    Object.values(getPasswordPolicyChecks(value)).every(Boolean)
      ? undefined
      : "Password does not meet policy.";
  const validateConfirmPassword = (newPwd: string, confirmPwd: string) =>
    confirmPwd === newPwd ? undefined : "Passwords do not match.";
  const validateOtp = (value: string) =>
    /^\d{6}$/.test(value.trim()) ? undefined : "Enter a valid 6-digit OTP.";

  const validateField = (
    field: "identifier" | "newPassword" | "confirmPassword" | "otp",
    valueOverride?: string,
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "identifier") {
      setFieldError("identifier", validateIdentifier(valueOverride ?? identifier));
    } else if (field === "newPassword") {
      setFieldError("newPassword", validateNewPassword(valueOverride ?? newPassword));
      if (touched.confirmPassword) {
        setFieldError(
          "confirmPassword",
          validateConfirmPassword(valueOverride ?? newPassword, confirmPassword),
        );
      }
    } else if (field === "confirmPassword") {
      setFieldError(
        "confirmPassword",
        validateConfirmPassword(newPassword, valueOverride ?? confirmPassword),
      );
    } else {
      setFieldError("otp", validateOtp(valueOverride ?? otp));
    }
  };

  const requestOtp = async () => {
    setTouched((prev) => ({ ...prev, identifier: true }));
    const nextErrors: Record<string, string> = {};
    const identifierError = validateIdentifier(identifier);
    if (identifierError) nextErrors.identifier = identifierError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    clearAuthApiToasts();

    try {
      await requestForgotPassword({ email: identifier.trim() });
      setChallengeId(identifier.trim());
      setDebugOtp(null);
      timer.restart(60);
      setStep("otp");
      showAuthApiToast({
        kind: "success",
        message: AUTH_API_TOAST_MESSAGES.forgotRequestSentInfo,
      });
    } catch (error) {
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.forgotRequestErrorFallback,
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setTouched((prev) => ({ ...prev, otp: true }));
    const otpError = validateOtp(otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setLoading(true);
    clearAuthApiToasts();
    setErrors({});

    try {
      setResetToken(challengeId);
      setStep("reset");
      showAuthApiToast({
        kind: "success",
        message: AUTH_API_TOAST_MESSAGES.forgotOtpAccepted,
      });
    } catch (error) {
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.forgotOtpVerifyErrorFallback,
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    clearAuthApiToasts();
    try {
      await requestForgotPassword({ email: challengeId });
      setDebugOtp(null);
      timer.restart(60);
      showAuthApiToast({ kind: "success", message: AUTH_API_TOAST_MESSAGES.forgotResendSuccess });
    } catch (error) {
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.forgotResendErrorFallback,
      });
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async () => {
    setTouched((prev) => ({
      ...prev,
      newPassword: true,
      confirmPassword: true,
    }));
    const nextErrors: Record<string, string> = {};
    const newPasswordError = validateNewPassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(newPassword, confirmPassword);
    if (newPasswordError) nextErrors.newPassword = newPasswordError;
    if (confirmPasswordError) nextErrors.confirmPassword = confirmPasswordError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    clearAuthApiToasts();

    try {
      await confirmForgotPassword({
        email: resetToken,
        code: otp.trim(),
        new_password: newPassword,
      });
      showAuthApiToast({
        kind: "success",
        message: AUTH_API_TOAST_MESSAGES.forgotPasswordUpdatedSuccess,
      });
      options?.onResetSuccess?.();
    } catch (error) {
      showAuthApiToast({
        kind: "error",
        message: getApiErrorMessage(error) || AUTH_API_TOAST_MESSAGES.forgotPasswordUpdateErrorFallback,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep("request");
    setIdentifier("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setChallengeId("");
    setResetToken("");
    setLoading(false);
    setErrors({});
    setTouched({});
    setDebugOtp(null);
    timer.restart(60);
  };

  return {
    step,
    loading,
    errors,
    debugOtp,
    timer,
    passwordChecks,
    fields: {
      identifier,
      otp,
      newPassword,
      confirmPassword,
    },
    actions: {
      setIdentifier: (value: string) => {
        setIdentifier(value);
        if (touched.identifier) {
          setFieldError("identifier", validateIdentifier(value));
        }
      },
      setOtp: (value: string) => {
        setOtp(value);
        if (touched.otp) {
          setFieldError("otp", validateOtp(value));
        }
      },
      setNewPassword: (value: string) => {
        setNewPassword(value);
        if (touched.newPassword) {
          setFieldError("newPassword", validateNewPassword(value));
        }
        if (touched.confirmPassword) {
          setFieldError(
            "confirmPassword",
            validateConfirmPassword(value, confirmPassword),
          );
        }
      },
      setConfirmPassword: (value: string) => {
        setConfirmPassword(value);
        if (touched.confirmPassword) {
          setFieldError("confirmPassword", validateConfirmPassword(newPassword, value));
        }
      },
      requestOtp,
      verifyOtp,
      resendOtp,
      setPassword,
      validateField,
      resetFlow,
    },
  };
}

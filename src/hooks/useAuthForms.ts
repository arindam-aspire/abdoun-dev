"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/storeHooks";
import { login } from "@/features/auth/authSlice";
import {
  mockForgotPasswordRequest,
  mockManualLogin,
  mockResendOtp,
  mockSetNewPassword,
  mockSignupWithManual,
  mockSocialAuth,
  mockVerifyResetOtp,
  mockVerifySignupOtp,
  type SocialProvider,
} from "@/services/authMockService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

function isEmailOrPhone(value: string) {
  const cleaned = value.replace(/[\s()-]/g, "").trim();
  return EMAIL_REGEX.test(value.trim()) || PHONE_REGEX.test(cleaned);
}

function validatePassword(password: string) {
  return {
    minLength: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*(),.?\":{}|<>]/.test(password),
  };
}

export function useOtpTimer(initialSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

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
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useOtpTimer(60);

  const passwordChecks = useMemo(() => validatePassword(password), [password]);
  const setFieldError = (key: string, error?: string) => {
    setErrors((prev) => {
      if (!error && !prev[key]) return prev;
      const next = { ...prev };
      if (error) next[key] = error;
      else delete next[key];
      return next;
    });
  };

  const validateFullName = (value: string) =>
    value.trim() ? undefined : "Full name is required.";
  const validateEmail = (value: string) =>
    EMAIL_REGEX.test(value.trim()) ? undefined : "Enter a valid email.";
  const validatePhone = (value: string) =>
    PHONE_REGEX.test(value.replace(/[\s()-]/g, "").trim())
      ? undefined
      : "Enter a valid phone.";
  const validatePasswordField = (value: string) =>
    Object.values(validatePassword(value)).every(Boolean)
      ? undefined
      : "Password does not meet policy.";
  const validateOtp = (value: string) =>
    /^\d{6}$/.test(value.trim()) ? undefined : "Enter a valid 6-digit OTP.";

  const goManual = () => {
    setScreen("manual");
    setErrors({});
    setTouched({});
    setMessage(null);
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
    setMessage(null);
    try {
      await mockSocialAuth(provider);
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
      setMessage(error instanceof Error ? error.message : "Social signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const submitManualSignup = async () => {
    setTouched((prev) => ({
      ...prev,
      fullName: true,
      email: true,
      phone: true,
      password: true,
    }));

    const nextErrors: Record<string, string> = {};
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePasswordField(password);

    if (fullNameError) nextErrors.fullName = fullNameError;
    if (emailError) nextErrors.email = emailError;
    if (phoneError) nextErrors.phone = phoneError;
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await mockSignupWithManual({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (result.nextStep === "login") {
        setMessage(result.message);
        router.push(`/${locale}/login`);
        return;
      }

      setChallengeId(result.challengeId);
      setDebugOtp(result.debugOtp);
      timer.restart(result.expiresInSeconds);
      setScreen("otp");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign up.");
    } finally {
      setLoading(false);
    }
  };

  const verifySignupOtp = async () => {
    setTouched((prev) => ({ ...prev, otp: true }));
    const otpError = validateOtp(otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setLoading(true);
    setErrors({});
    setMessage(null);

    try {
      await mockVerifySignupOtp(challengeId, otp.trim());
      setMessage("Signup completed. Redirecting...");
      dispatch(
        login({
          id: `signup_${challengeId}`,
          name: fullName.trim() || "New User",
          email: email.trim() || "new.user@mock.abdoun",
          phone: phone.trim() || undefined,
          role: "user",
        }),
      );
      router.push(`/${locale}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Invalid OTP.";
      setErrors({ otp: errMsg });
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const resendSignupOtp = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await mockResendOtp(challengeId);
      setDebugOtp(result.debugOtp);
      timer.restart(result.expiresInSeconds);
      setMessage("OTP resent successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return {
    screen,
    loading,
    message,
    errors,
    fields: {
      fullName,
      email,
      phone,
      password,
      otp,
    },
    passwordChecks,
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
      goLanding: () => setScreen("landing"),
    },
  };
}

export function useLoginFlow(locale: string) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<"manual" | "social">("manual");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitManualLogin = async () => {
    if (!isEmailOrPhone(identifier)) {
      setError("Enter a valid email or phone.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await mockManualLogin(identifier, password);
      dispatch(
        login({
          id: "manual_login",
          name: "Mock User",
          email: identifier.includes("@") ? identifier.trim() : "mock.user@abdoun",
          phone: identifier.includes("@") ? undefined : identifier.trim(),
          role: "user",
        }),
      );
      router.push(`/${locale}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const submitSocialLogin = async (provider: SocialProvider) => {
    setLoading(true);
    setError(null);
    try {
      await mockSocialAuth(provider);
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
      setError(err instanceof Error ? err.message : "Social login failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    tab,
    loading,
    error,
    fields: { identifier, password },
    actions: {
      setTab,
      setIdentifier,
      setPassword,
      submitManualLogin,
      submitSocialLogin,
    },
  };
}

export function useForgotPasswordFlow() {
  const [step, setStep] = useState<"request" | "otp" | "reset" | "success">("request");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const timer = useOtpTimer(60);

  const passwordChecks = useMemo(() => validatePassword(newPassword), [newPassword]);
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
    Object.values(validatePassword(value)).every(Boolean)
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
    setMessage(null);

    try {
      const result = await mockForgotPasswordRequest(identifier);
      setChallengeId(result.challengeId);
      setDebugOtp(result.debugOtp);
      setMessage(result.message);
      timer.restart(result.expiresInSeconds);
      setStep("otp");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to request OTP.");
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
    setErrors({});
    setMessage(null);

    try {
      const result = await mockVerifyResetOtp(challengeId, otp.trim());
      setResetToken(result.resetToken);
      setStep("reset");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Invalid OTP.";
      setErrors({ otp: errMsg });
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await mockResendOtp(challengeId);
      setDebugOtp(result.debugOtp);
      timer.restart(result.expiresInSeconds);
      setMessage("OTP resent successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resend OTP.");
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
    setMessage(null);

    try {
      await mockSetNewPassword(resetToken, newPassword);
      setStep("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    loading,
    message,
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
    },
  };
}

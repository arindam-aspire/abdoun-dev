/**
 * User-facing English copy for auth API outcomes shown via `showAuthApiToast` / route toast.
 * Centralize here so messaging stays consistent; swap for i18n keys later if needed.
 */

const VERIFY_OTP_INVALID_FALLBACK =
  "That verification code is not valid. Try again or resend a new code.";

const RESEND_CODE_ERROR_FALLBACK = "Could not resend the code. Try again shortly.";

export const AUTH_API_TOAST_MESSAGES = {
  signupSocialErrorFallback: "We could not sign you up with that provider. Try email instead.",
  signupAccountExists: "An account with this email already exists. Sign in or use a different email.",
  signupVerificationSent: "Verification code sent to your email.",
  signupGenericErrorFallback: "We could not complete sign-up. Check your details and try again.",
  signupCompleteWelcome: "Your account is ready. Welcome!",
  verifyOtpInvalidFallback: VERIFY_OTP_INVALID_FALLBACK,
  signupResendCodeSuccess: "A new verification code has been sent.",
  signupResendCodeErrorFallback: RESEND_CODE_ERROR_FALLBACK,

  loginSignedInSuccess: "Signed in successfully.",
  loginSignedInAsAdmin: "Signed in as admin.",
  loginSignedInAsAgent: "Signed in as agent.",
  loginErrorFallback: "Sign-in failed. Check your email or phone and password.",
  loginSocialProviderErrorFallback: "We could not sign you in with that provider.",
  loginUnconfirmedPhoneNotSupported:
    "This account must be verified by email. Sign in using the email address on your account to receive a verification code.",
  otpCodeFormatInvalid: "Enter a valid 6-digit verification code.",

  popupSocialLoginErrorFallback: "We could not use that sign-in method. Try another option.",

  popupOtpSendSuccess: "We sent a one-time code to your email or phone.",
  popupOtpSendErrorFallback: "We could not send a code. Check your details and try again.",
  popupOtpResendSuccess: "A new one-time code has been sent.",
  popupOtpResendErrorFallback: RESEND_CODE_ERROR_FALLBACK,

  forgotRequestSentInfo: "If that account exists, we sent a reset code to the email on file.",
  forgotRequestErrorFallback: "We could not send a reset code. Try again shortly.",
  forgotOtpAccepted: "Code accepted. Enter and confirm your new password.",
  forgotOtpVerifyErrorFallback: VERIFY_OTP_INVALID_FALLBACK,
  forgotResendSuccess: "A new reset code has been sent.",
  forgotResendErrorFallback: RESEND_CODE_ERROR_FALLBACK,
  forgotPasswordUpdatedSuccess: "Your password was updated. You can sign in with the new password.",
  forgotPasswordUpdateErrorFallback: "We could not update your password. Try again.",
} as const;

export type AuthApiToastMessageKey = keyof typeof AUTH_API_TOAST_MESSAGES;

export function authSignedInToastMessage(role: "admin" | "agent" | "user"): string {
  if (role === "admin") return AUTH_API_TOAST_MESSAGES.loginSignedInAsAdmin;
  if (role === "agent") return AUTH_API_TOAST_MESSAGES.loginSignedInAsAgent;
  return AUTH_API_TOAST_MESSAGES.loginSignedInSuccess;
}

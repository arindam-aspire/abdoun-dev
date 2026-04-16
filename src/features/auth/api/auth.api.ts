/**
 * Auth feature API module. Wraps auth HTTP calls with same endpoints and payloads.
 * No API contract changes; single entry for auth-related network calls.
 */

export type {
  AuthTokens,
  AuthUser,
  ConfirmSignupPayload,
  ForgotPasswordConfirmPayload,
  ForgotPasswordRequestPayload,
  LoginWithPasswordApiData,
  LoginWithPasswordPayload,
  LoginWithPasswordResult,
  OtpRequestPayload,
  OtpVerifyPayload,
  PermissionsResponse,
  RefreshTokenPayload,
  ResendConfirmationPayload,
  SessionUser,
  SetPasswordPayload,
  SignupPayload,
} from "@/services/authService";

export {
  changePassword,
  confirmForgotPassword,
  confirmSignup,
  getCurrentUser,
  getCurrentUserPermissions,
  loginWithPassword,
  requestForgotPassword,
  requestOtpLogin,
  resendConfirmation,
  setPasswordAfterLogin,
  signup,
  refreshToken,
  verifyOtpLogin,
  toSessionUser,
  toSessionUserForProfile,
  persistTokens,
  setAuthUsername,
  loginWithPasswordAndPersist,
  logout,
} from "@/services/authService";

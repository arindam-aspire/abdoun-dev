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
  PersistTokensOptions,
  RefreshTokenPayload,
  ResendConfirmationPayload,
  SessionUser,
  SetPasswordPayload,
  SignupPayload,
} from "@/features/auth/api/authService";

export {
  changePassword,
  confirmForgotPassword,
  confirmSignup,
  getCurrentUser,
  getCurrentUserPermissions,
  isPasswordLoginUnconfirmed403,
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
} from "@/features/auth/api/authService";

import axios, { type AxiosError } from "axios";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { isPasswordLoginUnconfirmed403 } from "@/features/auth/api/authService";

/**
 * Password login error classification for `POST /auth/login/password`.
 *
 * Expected backend signals (any subset is supported):
 * - **Invalid credentials**: HTTP 401, or 400/422/403 with a `detail` string indicating wrong credentials
 *   (403 unconfirmed-email flow is handled separately via `isPasswordLoginUnconfirmed403`).
 * - **Temporary lock**: HTTP 423; or JSON `lock_until` / `locked_until` (ISO or unix s/ms); or
 *   `error`/`code` like `account_locked`; or 403/429 with lock-style `detail`.
 * - **Generic errors**: other HTTP errors or network failures → server_error with message from `getApiErrorMessage`.
 */

/** User-facing copy when the account is rate-locked after failed attempts (backend is source of truth). */
export const ACCOUNT_TEMPORARILY_LOCKED_TOAST =
  "Your account is temporarily locked due to multiple failed login attempts. Please try again after 15 minutes or use Forgot Password or OTP Login to continue.";

function detailStringFromResponseData(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail.trim();
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first === "object" && "msg" in first) {
      const m = (first as { msg?: unknown }).msg;
      if (typeof m === "string") return m.trim();
    }
  }
  return null;
}

/**
 * Reads optional lock expiry from API JSON (`lock_until`, `locked_until`, or camelCase).
 * Accepts ISO strings, unix seconds, or unix milliseconds.
 */
export function parseLockUntilMsFromResponseData(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const raw = o.lock_until ?? o.locked_until ?? o.lockUntil ?? o.lockedUntil;
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw < 1e12 ? Math.round(raw * 1000) : Math.round(raw);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const asNum = Number(trimmed);
    if (Number.isFinite(asNum) && asNum > 0) {
      return asNum < 1e12 ? Math.round(asNum * 1000) : Math.round(asNum);
    }
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function detailSuggestsTemporaryLock(detail: string | null): boolean {
  if (!detail) return false;
  return /temporarily locked|account.*locked|too many failed|locked.*try again|rate.?limit/i.test(detail);
}

function isAccountTemporarilyLockedResponse(error: AxiosError): boolean {
  const status = error.response?.status;
  const data = error.response?.data;
  if (status === 423) return true;
  if (parseLockUntilMsFromResponseData(data) != null) return true;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const code = o.error ?? o.code;
    if (typeof code === "string" && /account_locked|temporarily_locked|login_locked/i.test(code)) {
      return true;
    }
  }
  if (status === 403 || status === 429) {
    const detail = detailStringFromResponseData(data);
    if (detailSuggestsTemporaryLock(detail)) return !isPasswordLoginUnconfirmed403(error);
  }
  return false;
}

function sanitizeAuthToastDetail(detail: string | null, fallback: string): string {
  if (!detail) return fallback;
  const t = detail.trim();
  if (!t || t.length > 220) return fallback;
  if (/traceback|exception|internal server|stack trace/i.test(t)) return fallback;
  return t;
}

function isInvalidCredentialsResponse(error: AxiosError): boolean {
  const status = error.response?.status;
  if (status === 401) return true;
  const detail = detailStringFromResponseData(error.response?.data);
  if (!detail) return false;
  if (isPasswordLoginUnconfirmed403(error)) return false;
  if (status === 403 && /invalid|incorrect|wrong password|credentials|authentication failed/i.test(detail)) {
    return !detailSuggestsTemporaryLock(detail);
  }
  if ((status === 400 || status === 422) && /invalid|incorrect|wrong password|credentials/i.test(detail)) {
    return true;
  }
  return false;
}

export type PasswordLoginFailureClassification =
  | { kind: "unconfirmed" }
  | { kind: "account_temporarily_locked"; lockUntilMs: number | null }
  | { kind: "invalid_credentials"; toastMessage: string }
  | { kind: "server_error"; toastMessage: string };

/**
 * Maps password-login API errors to UX categories. Callers should branch on `unconfirmed` first
 * if they implement the email-confirmation flow; otherwise show `toastMessage` / lock handling.
 */
export function classifyPasswordLoginFailure(error: unknown): PasswordLoginFailureClassification {
  if (isPasswordLoginUnconfirmed403(error)) {
    return { kind: "unconfirmed" };
  }

  if (!axios.isAxiosError(error)) {
    return { kind: "server_error", toastMessage: getApiErrorMessage(error) };
  }

  const ax = error as AxiosError;
  if (!ax.response) {
    return { kind: "server_error", toastMessage: getApiErrorMessage(error) };
  }

  if (isAccountTemporarilyLockedResponse(ax)) {
    return {
      kind: "account_temporarily_locked",
      lockUntilMs: parseLockUntilMsFromResponseData(ax.response.data),
    };
  }

  if (isInvalidCredentialsResponse(ax)) {
    const detail = detailStringFromResponseData(ax.response.data);
    const fallback = "Invalid email or password.";
    return {
      kind: "invalid_credentials",
      toastMessage: sanitizeAuthToastDetail(detail, fallback),
    };
  }

  return {
    kind: "server_error",
    toastMessage: getApiErrorMessage(error),
  };
}

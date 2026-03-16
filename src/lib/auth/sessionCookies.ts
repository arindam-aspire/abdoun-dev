import type { AuthUser, UserRole } from "@/features/auth/authSlice";

export const AUTH_ROLE_COOKIE_NAME = "abdoun_role";
export const AUTH_USER_COOKIE_NAME = "abdoun_user";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split("; ");
  const pair = parts.find((item) => item.startsWith(encodedName));
  if (!pair) return null;

  return decodeURIComponent(pair.slice(encodedName.length));
}

function isValidRole(role: string): role is UserRole {
  return role === "user" || role === "agent" || role === "admin";
}

export function persistAuthSession(user: AuthUser): void {
  if (typeof document === "undefined") return;

  const role = encodeURIComponent(user.role);
  const payload = encodeURIComponent(
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive ?? null,
      isEmailVerified: user.isEmailVerified ?? null,
      isPhoneVerified: user.isPhoneVerified ?? null,
      requiresPasswordSet: user.requiresPasswordSet ?? null,
    }),
  );
  const baseAttributes = `path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;

  document.cookie = `${AUTH_ROLE_COOKIE_NAME}=${role}; ${baseAttributes}`;
  document.cookie = `${AUTH_USER_COOKIE_NAME}=${payload}; ${baseAttributes}`;
}

export function clearAuthSession(): void {
  if (typeof document === "undefined") return;

  const expired = "path=/; max-age=0; samesite=lax";
  document.cookie = `${AUTH_ROLE_COOKIE_NAME}=; ${expired}`;
  document.cookie = `${AUTH_USER_COOKIE_NAME}=; ${expired}`;
}

export function readAuthRoleFromBrowser(): UserRole | null {
  const role = getCookieValue(AUTH_ROLE_COOKIE_NAME);
  if (!role || !isValidRole(role)) return null;
  return role;
}

export function readAuthSessionFromBrowser(): AuthUser | null {
  const raw = getCookieValue(AUTH_USER_COOKIE_NAME);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      !parsed ||
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.role !== "string" ||
      !isValidRole(parsed.role)
    ) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
      role: parsed.role,
      isActive: parsed.isActive ?? null,
      isEmailVerified: parsed.isEmailVerified ?? null,
      isPhoneVerified: parsed.isPhoneVerified ?? null,
      requiresPasswordSet: parsed.requiresPasswordSet ?? null,
    };
  } catch {
    return null;
  }
}

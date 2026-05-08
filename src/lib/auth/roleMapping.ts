import type { UserRole } from "@/features/auth/authSlice";

export type ApiUserRole = "registered_user" | "agent" | "admin";

export function frontendRoleToApiRole(role: UserRole): ApiUserRole {
  if (role === "user") return "registered_user";
  return role;
}

export function apiRoleToFrontendRole(role: ApiUserRole): UserRole {
  if (role === "registered_user") return "user";
  return role;
}

export function isRegisteredFrontendUserRole(role: string | null | undefined): boolean {
  return role === "user" || role === "registered_user";
}

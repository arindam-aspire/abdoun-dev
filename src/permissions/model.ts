/**
 * Roles and permission derivation for route and UI guards.
 */
import type { AuthUser } from "@/features/auth/authSlice";

export type AppRole = "public" | "user" | "agent" | "admin";

/** Permission constants used by the app (extend as needed). */
export const PERMISSIONS = {
  VIEW_AGENT_DASHBOARD: "agent:dashboard:view",
  VIEW_ADMIN_DASHBOARD: "admin:dashboard:view",
  MANAGE_AGENTS: "admin:agents:manage",
  MANAGE_PROPERTIES: "admin:properties:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type SessionLike = { user: AuthUser | null; role: AuthUser["role"] | null } | null;

/**
 * Derives app role and permission set from session. Use for guards and UI.
 */
export function derivePermissionsFromSession(session: SessionLike): {
  role: AppRole;
  permissions: Set<Permission>;
} {
  if (!session?.user?.role) {
    return { role: "public", permissions: new Set() };
  }
  const role: AppRole = session.user.role;
  const permissions = new Set<Permission>();
  if (role === "agent") {
    permissions.add(PERMISSIONS.VIEW_AGENT_DASHBOARD);
  }
  if (role === "admin") {
    permissions.add(PERMISSIONS.VIEW_ADMIN_DASHBOARD);
    permissions.add(PERMISSIONS.MANAGE_AGENTS);
    permissions.add(PERMISSIONS.MANAGE_PROPERTIES);
  }
  return { role, permissions };
}

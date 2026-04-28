"use client";

import { createHttpClients } from "@/lib/http";

export type StandardApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  error?: string | null;
};

export type UserManagementPermission = {
  id: string;
  code: string;
  description?: string | null;
  created_at?: string;
};

export type UserManagementRole = {
  id: string;
  name: string;
  description?: string | null;
  permissions: UserManagementPermission[];
  created_at?: string;
};

export type UserManagementUser = {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  roles: UserManagementRole[];
  created_at: string;
};

export type ListUsersParams = {
  page?: number;
  pageSize?: number;
  /** e.g. `register_user` — scope returned rows on `GET /users`. */
  userType?: string;
  role_name?: string;
  search?: string;
  /** Filter by active flag when the backend supports it on `GET /users`. */
  is_active?: boolean;
};

export type ListUsersResult = {
  items: UserManagementUser[];
  /** Row count across all pages when the API sends it; otherwise `null`. */
  total: number | null;
};

export type UpdateUserPayload = {
  full_name?: string;
  phone_number?: string;
  is_active?: boolean;
};

type AssignRolePayload = {
  role_id: string;
};

export type PermissionListItem = {
  id: string;
  code: string;
  description?: string | null;
};

const { authApi } = createHttpClients();

const unwrap = <T,>(response: StandardApiResponse<T>): T => response.data;

function isStandardEnvelope(v: unknown): v is StandardApiResponse<unknown> {
  return (
    v != null &&
    typeof v === "object" &&
    "data" in v &&
    "success" in v &&
    typeof (v as StandardApiResponse<unknown>).success === "boolean"
  );
}

const USER_LIST_ARRAY_KEYS = [
  "data",
  "users",
  "items",
  "records",
  "list",
  "rows",
  "results",
  "content",
] as const;

const USER_LIST_TOTAL_KEYS = [
  "total",
  "total_count",
  "count",
  "totalItems",
  "total_records",
  "totalCount",
] as const;

function readTotalFromRecord(o: Record<string, unknown>): number | null {
  for (const key of USER_LIST_TOTAL_KEYS) {
    const totalRaw = o[key];
    if (typeof totalRaw === "number" && Number.isFinite(totalRaw)) {
      return totalRaw;
    }
    if (typeof totalRaw === "string") {
      const n = Number(totalRaw);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

/**
 * `GET /users` may return a bare array or a paginated envelope (`users`, `items`, nested `data`, …).
 */
function parseUserListPayload(payload: unknown): ListUsersResult {
  if (payload == null) return { items: [], total: null };
  if (Array.isArray(payload)) {
    return { items: payload as UserManagementUser[], total: null };
  }

  if (typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    const totalRoot = readTotalFromRecord(o);
    for (const key of USER_LIST_ARRAY_KEYS) {
      const v = o[key];
      if (Array.isArray(v)) {
        const t = readTotalFromRecord(o);
        return {
          items: v as UserManagementUser[],
          total: t != null ? Math.max(t, v.length) : null,
        };
      }
    }
    const nested = o.data;
    if (nested != null && typeof nested === "object" && !Array.isArray(nested)) {
      const inner = nested as Record<string, unknown>;
      const innerTotal = readTotalFromRecord(inner) ?? totalRoot;
      for (const key of USER_LIST_ARRAY_KEYS) {
        const v = inner[key];
        if (Array.isArray(v)) {
          const t = innerTotal ?? readTotalFromRecord(inner);
          return {
            items: v as UserManagementUser[],
            total: t != null ? Math.max(t, v.length) : null,
          };
        }
      }
    }
    return { items: [], total: totalRoot };
  }
  return { items: [], total: null };
}

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResult> {
  const response = await authApi.get<unknown>("/users", { params });
  const body = response.data as unknown;
  let totalFromEnvelope: number | null = null;
  if (isStandardEnvelope(body) && typeof body === "object" && body !== null) {
    totalFromEnvelope = readTotalFromRecord(body as Record<string, unknown>);
  }
  const inner = isStandardEnvelope(body) ? unwrap(body) : body;
  const parsed = parseUserListPayload(inner);
  if (parsed.total == null && totalFromEnvelope != null) {
    return {
      items: parsed.items,
      total: Math.max(totalFromEnvelope, parsed.items.length),
    };
  }
  return parsed;
}

export async function listRoles(): Promise<UserManagementRole[]> {
  const response = await authApi.get<StandardApiResponse<UserManagementRole[]>>(
    "/users/roles/list",
  );
  return unwrap(response.data);
}

export async function listPermissions(): Promise<PermissionListItem[]> {
  const response = await authApi.get<StandardApiResponse<PermissionListItem[]>>(
    "/users/permissions/list",
  );
  return unwrap(response.data);
}

export async function getUserById(userId: string): Promise<UserManagementUser> {
  const response = await authApi.get<StandardApiResponse<UserManagementUser>>(
    `/users/${userId}`,
  );
  return unwrap(response.data);
}

export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
): Promise<UserManagementUser> {
  const response = await authApi.patch<StandardApiResponse<UserManagementUser>>(
    `/users/${userId}`,
    payload,
  );
  return unwrap(response.data);
}

export async function assignRoleToUser(
  userId: string,
  roleId: string,
): Promise<boolean> {
  const response = await authApi.post<StandardApiResponse<boolean>>(
    `/users/${userId}/roles`,
    { role_id: roleId } satisfies AssignRolePayload,
  );
  return unwrap(response.data);
}

export async function removeRoleFromUser(
  userId: string,
  roleId: string,
): Promise<boolean> {
  const response = await authApi.delete<StandardApiResponse<boolean>>(
    `/users/${userId}/roles/${roleId}`,
  );
  return unwrap(response.data);
}

export async function softDeleteUser(userId: string): Promise<boolean> {
  const response = await authApi.delete<StandardApiResponse<boolean>>(
    `/users/${userId}`,
  );
  return unwrap(response.data);
}


"use client";

import { isFailedV1Envelope } from "@/lib/http/standardEnvelope";
import { authApi } from "@/lib/http/clients";
import { createPaginatedResult, type PaginatedResult } from "@/lib/api/pagination";

export type { StandardApiResponse } from "@/lib/http/standardApiResponse";

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
  /** Optional period/aggregation window when the backend supports it (e.g. weekly/monthly/yearly). */
  period?: "weekly" | "monthly" | "yearly";
};

export type ListUsersResult = PaginatedResult<UserManagementUser>;

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
function parseUserListPayload(
  payload: unknown,
  fallback: { page: number; pageSize: number },
): ListUsersResult {
  if (payload == null) return createPaginatedResult([], undefined, fallback);
  if (Array.isArray(payload)) {
    return createPaginatedResult(payload as UserManagementUser[], undefined, fallback);
  }

  if (typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    const totalRoot = readTotalFromRecord(o);
    for (const key of USER_LIST_ARRAY_KEYS) {
      const v = o[key];
      if (Array.isArray(v)) {
        return createPaginatedResult(v as UserManagementUser[], o, {
          ...fallback,
          total: totalRoot ?? undefined,
        });
      }
    }
    const nested = o.data;
    if (nested != null && typeof nested === "object" && !Array.isArray(nested)) {
      const inner = nested as Record<string, unknown>;
      const innerTotal = readTotalFromRecord(inner) ?? totalRoot;
      for (const key of USER_LIST_ARRAY_KEYS) {
        const v = inner[key];
        if (Array.isArray(v)) {
          return createPaginatedResult(v as UserManagementUser[], inner, {
            ...fallback,
            total: innerTotal ?? undefined,
          });
        }
      }
    }
    return createPaginatedResult([], o, {
      ...fallback,
      total: totalRoot ?? undefined,
    });
  }
  return createPaginatedResult([], undefined, fallback);
}

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResult> {
  const page =
    typeof params.page === "number" && Number.isFinite(params.page) && params.page >= 1
      ? Math.floor(params.page)
      : 1;
  const pageSize =
    typeof params.pageSize === "number" &&
    Number.isFinite(params.pageSize) &&
    params.pageSize >= 1
      ? Math.floor(params.pageSize)
      : 10;
  const userType =
    typeof params.userType === "string" && params.userType.trim()
      ? params.userType.trim()
      : undefined;
  const role_name =
    typeof params.role_name === "string" && params.role_name.trim()
      ? params.role_name.trim()
      : undefined;
  const search =
    typeof params.search === "string" && params.search.trim()
      ? params.search.trim()
      : undefined;
  const is_active =
    typeof params.is_active === "boolean" ? params.is_active : undefined;

  const period =
    params.period === "weekly" || params.period === "monthly" || params.period === "yearly"
      ? params.period
      : undefined;

  const response = await authApi.get<unknown>("/users", {
    params: {
      page,
      pageSize,
      ...(userType ? { userType } : {}),
      ...(role_name ? { role_name } : {}),
      ...(search ? { search } : {}),
      ...(is_active !== undefined ? { is_active } : {}),
      ...(period ? { period } : {}),
    },
  });
  const body = response.data as unknown;
  if (isFailedV1Envelope(body)) {
    return createPaginatedResult([], undefined, { page, pageSize });
  }
  return parseUserListPayload(body, { page, pageSize });
}

export async function listRoles(): Promise<UserManagementRole[]> {
  const response = await authApi.get<UserManagementRole[]>("/users/roles/list");
  return response.data;
}

export async function listPermissions(): Promise<PermissionListItem[]> {
  const response = await authApi.get<PermissionListItem[]>(
    "/users/permissions/list",
  );
  return response.data;
}

export async function getUserById(userId: string): Promise<UserManagementUser> {
  const response = await authApi.get<UserManagementUser>(`/users/${userId}`);
  return response.data;
}

export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
): Promise<UserManagementUser> {
  const response = await authApi.patch<UserManagementUser>(
    `/users/${userId}`,
    payload,
  );
  return response.data;
}

export async function assignRoleToUser(
  userId: string,
  roleId: string,
): Promise<boolean> {
  const response = await authApi.post<boolean>(
    `/users/${userId}/roles`,
    { role_id: roleId } satisfies AssignRolePayload,
  );
  return response.data;
}

export async function removeRoleFromUser(
  userId: string,
  roleId: string,
): Promise<boolean> {
  const response = await authApi.delete<boolean>(
    `/users/${userId}/roles/${roleId}`,
  );
  return response.data;
}

export async function softDeleteUser(userId: string): Promise<boolean> {
  const response = await authApi.delete<boolean>(`/users/${userId}`);
  return response.data;
}


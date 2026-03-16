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
  limit?: number;
  offset?: number;
  role_name?: string;
  search?: string;
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

export async function listUsers(
  params: ListUsersParams = {},
): Promise<UserManagementUser[]> {
  const response = await authApi.get<StandardApiResponse<UserManagementUser[]>>(
    "/users",
    { params },
  );
  return unwrap(response.data);
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


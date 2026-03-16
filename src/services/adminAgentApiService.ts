"use client";

import { normalizeAgentStatus, type AgentStatusValue } from "@/constants/agentStatus";
import { createHttpClients } from "@/lib/http";
import { type StandardApiResponse } from "@/services/userService";

export type AdminAgentStatus = AgentStatusValue;

export interface AdminAgent {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  status?: AdminAgentStatus;
  invitedAt?: string;
  invitedBy?: string;
}

type PaginatedAgentsApiPayload = {
  agents: unknown[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

type InviteAgentPayload = {
  email: string;
};

export type InviteAgentResponse = {
  id: string;
  email: string;
  status: string;
  inviteLink: string;
  invitedAt: string;
  invitedBy: string;
};

export type ValidateInviteTokenResponse = {
  id: string;
  email: string;
  status: string;
  alreadySubmitted: boolean;
  invitedAt: string;
  invitedBy: string;
};

export type ListAdminAgentsParams = {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "asc" | "desc";
  status?: string;
};

export type ListAdminAgentsResult = {
  items: AdminAgent[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
};

const { authApi } = createHttpClients();

const unwrap = <T,>(response: StandardApiResponse<T>): T => response.data;

export async function inviteAdminAgent(
  email: string,
): Promise<InviteAgentResponse> {
  const response = await authApi.post<StandardApiResponse<InviteAgentResponse>>(
    "/agents/invite",
    { email } satisfies InviteAgentPayload,
  );
  return unwrap(response.data);
}

export type ValidateInviteTokenResult = ValidateInviteTokenResponse & {
  message?: string | null;
};

export async function validateInviteToken(
  token: string,
): Promise<ValidateInviteTokenResult> {
  const response = await authApi.get<
    StandardApiResponse<ValidateInviteTokenResponse> & { message?: string | null }
  >("/agents/invite/validate", {
    params: { token },
  });
  const body = response.data;
  const payload = unwrap(body);
  const message = "message" in body && body.message != null ? body.message : undefined;
  return { ...payload, message };
}

export async function listAdminAgents(
  params: ListAdminAgentsParams = {},
): Promise<ListAdminAgentsResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const sort_by = params.sort_by ?? "invited_at";
  const order = params.order ?? "desc";
  const status = params.status;

  const response = await authApi.get<
    StandardApiResponse<PaginatedAgentsApiPayload>
  >("/agents", {
    params: {
      page,
      limit,
      sort_by,
      order,
      ...(status ? { status } : {}),
    },
  });

  const payload = unwrap(response.data);
  const rawItems = Array.isArray(payload.agents) ? payload.agents : [];

  const items: AdminAgent[] = rawItems.map((raw) => {
    const anyItem = raw as Record<string, unknown>;

    const status: AdminAgentStatus = normalizeAgentStatus(
      anyItem.status as string | undefined,
    );

    const fullName =
      (anyItem.fullName as string | undefined) ??
      (anyItem.name as string | undefined) ??
      "Agent";

    const invitedAt =
      (anyItem.invitedAt as string | undefined) ??
      (anyItem.invited_at as string | undefined) ??
      (anyItem.created_at as string | undefined) ??
      new Date().toISOString();

    const city =
      (anyItem.city as string | undefined) ??
      (anyItem.serviceArea as string | undefined) ??
      "N/A";

    const invitedBy =
      (anyItem.invitedBy as string | undefined)?.trim() ?? "N/A";

    return {
      id: String(anyItem.id ?? ""),
      fullName,
      email: (anyItem.email as string | undefined) ?? "",
      phone: (anyItem.phone as string | undefined) ?? "N/A",
      city,
      status,
      invitedAt,
      invitedBy,
    };
  });

  const pageFromApi = payload.pagination?.page ?? page;
  const limitFromApi = payload.pagination?.limit ?? limit;
  const totalItemsFromApi = payload.pagination?.totalItems ?? items.length;
  const totalPagesFromApi =
    payload.pagination?.totalPages ??
    Math.max(1, Math.ceil(totalItemsFromApi / limitFromApi));

  return {
    items,
    total: totalItemsFromApi,
    limit: limitFromApi,
    page: pageFromApi,
    totalPages: totalPagesFromApi,
  };
}

export async function approveAgent(agentId: string): Promise<boolean> {
  const response = await authApi.patch<StandardApiResponse<boolean>>(
    `/agents/${agentId}/accept`,
  );
  return unwrap(response.data) === true;
}

export async function declineAgent(agentId: string): Promise<boolean> {
  const response = await authApi.patch<StandardApiResponse<boolean>>(
    `/agents/${agentId}/decline`,
  );
  return unwrap(response.data) === true;
}

export async function setUserActive(userId: string, isActive: boolean): Promise<true> {
  const response = await authApi.patch<StandardApiResponse<unknown>>(`/users/${userId}`, {
    is_active: isActive,
  });
  unwrap(response.data);
  return true;
}

export async function deleteAgent(agentId: string): Promise<boolean> {
  const response = await authApi.delete<StandardApiResponse<boolean>>(
    `/agents/${agentId}`,
  );
  return unwrap(response.data) === true;
}

export async function grantAdminAccess(options: {
  adminId: string;
  agentId: string;
}): Promise<boolean> {
  const response = await authApi.post<StandardApiResponse<boolean>>("/agents/assign-agent", {
    admin_id: options.adminId,
    agent_id: options.agentId,
    can_inherit_privileges: true,
  });
  return unwrap(response.data) === true;
}

export async function agentOnboardingManually(agent: AdminAgent): Promise<boolean> {
  const response = await authApi.post<StandardApiResponse<boolean>>("/agents/manual-onboard", {
    fullName: agent.fullName,
    email: agent.email,
    phone: agent.phone,
    serviceArea: agent.city,
  });
  return unwrap(response.data) === true;
}

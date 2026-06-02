"use client";

import { normalizeAgentStatus, type AgentStatusValue } from "@/constants/agentStatus";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { readV1EnvelopeMessage } from "@/lib/http/standardEnvelope";
import { authApi } from "@/lib/http/clients";
import { createPaginatedResult, type PaginatedResult } from "@/lib/api/pagination";
import { StandardApiResponse } from "@/lib/http/standardApiResponse";


export type AdminAgentStatus = AgentStatusValue;

export interface AdminAgent {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  status?: AdminAgentStatus;
  invitedAt?: string;
  /** Set when the agent is approved (directory “activity” for active agents). */
  reviewedAt?: string | null;
  invitedBy?: string;
}

type PaginatedAgentsApiPayload = {
  agents: unknown[];
  pagination: {
    page: number;
    pageSize: number;
    /** Row count across all pages (replaces legacy `totalItems`). */
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    /** @deprecated Prefer `total`. */
    totalItems?: number;
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
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "ASC" | "DESC" | string;
  status?: string;
  /** Free-text search across agent name/email/phone/city (backend dependent). */
  search?: string;
  /** Optional time window filter when backend supports it. */
  period?: "weekly" | "monthly" | "yearly";
};

function toPositiveInt(value: unknown): number | undefined {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return undefined;
    const n = Math.floor(value);
    return n >= 1 ? n : undefined;
  }
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) && n >= 1 ? n : undefined;
  }
  return undefined;
}

function normalizeSortBy(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  // Accept both API conventions and normalize to backend snake_case.
  if (trimmed === "invitedAt") return "invited_at";
  if (trimmed === "reviewedAt") return "reviewed_at";
  // Keep known backend values as-is.
  if (trimmed === "invited_at" || trimmed === "reviewed_at" || trimmed === "created_at") {
    return trimmed;
  }
  // Unknown sort fields are ignored to avoid breaking the list endpoint.
  return undefined;
}

function normalizeSortOrder(raw: unknown): "asc" | "desc" | undefined {
  if (typeof raw !== "string") return undefined;
  const v = raw.trim().toLowerCase();
  if (v === "asc" || v === "desc") return v;
  return undefined;
}

function normalizePeriod(raw: unknown): ListAdminAgentsParams["period"] | undefined {
  if (typeof raw !== "string") return undefined;
  const v = raw.trim().toLowerCase();
  return v === "weekly" || v === "monthly" || v === "yearly"
    ? (v as ListAdminAgentsParams["period"])
    : undefined;
}

function normalizeListAdminAgentsParams(
  params: ListAdminAgentsParams | undefined,
): Required<Pick<ListAdminAgentsParams, "page" | "pageSize" | "sortBy" | "sortOrder">> &
  Pick<ListAdminAgentsParams, "status" | "search" | "period"> {
  const raw = params ?? {};

  const page = toPositiveInt(raw.page) ?? 1;
  const pageSize = toPositiveInt(raw.pageSize) ?? 20;
  const sortBy = normalizeSortBy(raw.sortBy) ?? "invited_at";
  const sortOrder = normalizeSortOrder(raw.sortOrder) ?? "desc";
  const status = typeof raw.status === "string" && raw.status.trim() ? raw.status.trim() : undefined;
  const search =
    typeof raw.search === "string" && raw.search.trim() ? raw.search.trim() : undefined;
  const period = normalizePeriod(raw.period);

  return { page, pageSize, sortBy, sortOrder, status, search, period };
}

export type ListAdminAgentsResult = PaginatedResult<AdminAgent>;

export type AdminAgentsSummaryLatestInvite = {
  isUsed: boolean;
  revokedAt: string | null;
  expiresAt: string;
  invitedAt: string;
  createdAt: string;
};

export type AdminAgentsSummaryLastAgentMetadata = {
  email: string;
  userCreatedAt: string;
  cognitoSub: string | null;
  serviceArea: string;
  statusReason: string | null;
  declineReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  formSubmittedAt: string | null;
  passwordSetAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
};

export type AdminAgentsSummaryLastAgent = {
  agentId: string;
  agentName: string;
  profileStatus: string;
  userIsActive: boolean;
  assignments: unknown[];
  latestInvite: AdminAgentsSummaryLatestInvite | null;
  metadata: AdminAgentsSummaryLastAgentMetadata;
};

export type AdminAgentsSummaryData = {
  totalAgents: number;
  activeAgents: number;
  pendingInvites: number;
  pendingReview: number;
  declined: number;
  lastFiveAgents: AdminAgentsSummaryLastAgent[];
};

const unwrap = <T,>(response: StandardApiResponse<T>): T => response.data;

export async function inviteAdminAgent(
  email: string,
): Promise<InviteAgentResponse> {
  const response = await authApi.post<InviteAgentResponse>("/agents/invite", {
    email,
  } satisfies InviteAgentPayload);
  return response.data;
}

export async function resendAdminAgentInvitation(
  agentId: string,
): Promise<InviteAgentResponse> {
  const response = await authApi.post<InviteAgentResponse>(
    `/agents/${agentId}/resend-invitation`,
  );
  return response.data;
}

export type ValidateInviteTokenResult = ValidateInviteTokenResponse & {
  message?: string | null;
};

export async function validateInviteToken(
  token: string,
): Promise<ValidateInviteTokenResult> {
  try {
    const response = await authApi.get<ValidateInviteTokenResponse>(
      "/agents/invite/validate",
      {
        params: { token },
      },
    );
    const payload = response.data;
    const message = readV1EnvelopeMessage(response);
    return { ...payload, message };
  } catch (error) {
    throw new Error(getApiErrorMessage(error), { cause: error });
  }
}

/**
 * `GET /agents` (e.g. `{base}/api/v1/agents?page=1&pageSize=10&sortBy=invited_at&sortOrder=desc`).
 * Expects `StandardApiResponse` with `agents[]` and `pagination.total`, `totalPages`, `hasNext`, `hasPrevious`.
 */
export async function listAdminAgents(
  params: ListAdminAgentsParams = {},
): Promise<ListAdminAgentsResult> {
  const { page, pageSize, sortBy, sortOrder, status, search, period } =
    normalizeListAdminAgentsParams(params);

  const response = await authApi.get<PaginatedAgentsApiPayload>("/agents", {
    params: {
      page,
      pageSize,
      sortBy,
      sortOrder,
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
      ...(period ? { period } : {}),
    },
  });

  const payload = response.data;
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

    const reviewedRaw = (anyItem.reviewedAt ?? anyItem.reviewed_at) as string | null | undefined;
    const reviewedAt =
      typeof reviewedRaw === "string" && reviewedRaw.trim() ? reviewedRaw : null;

    return {
      id: String(anyItem.id ?? ""),
      fullName,
      email: (anyItem.email as string | undefined) ?? "",
      phone: (anyItem.phone as string | undefined) ?? "N/A",
      city,
      status,
      invitedAt,
      reviewedAt,
      invitedBy,
    };
  });

  return createPaginatedResult(items, payload.pagination, { page, pageSize });
}

/**
 * `GET /agents/summary` — global counts and latest agents for the admin directory.
 */
export async function getAdminAgentsSummary(): Promise<AdminAgentsSummaryData> {
  const response = await authApi.get<AdminAgentsSummaryData>("/agents/summary");
  return response.data;
}

export async function approveAgent(agentId: string): Promise<boolean> {
  const response = await authApi.patch<boolean>(`/agents/${agentId}/accept`);
  return response.data === true;
}

export async function declineAgent(agentId: string): Promise<boolean> {
  const response = await authApi.patch<boolean>(`/agents/${agentId}/decline`);
  return response.data === true;
}

export type SetAgentStatusValue = "ACTIVE" | "INACTIVE";
export type SetAgentStatusResult = {
  id: string;
  status: string;
};

/**
 * Admin-only: activate/deactivate agent.
 * PATCH `/api/v1/agents/{agent_id}/status`
 *
 * Backend also flips `users.is_active` as part of this operation.
 */
export async function setAgentStatus(
  agentId: string,
  status: SetAgentStatusValue,
): Promise<SetAgentStatusResult> {
  const response = await authApi.patch<StandardApiResponse<SetAgentStatusResult>>(
    `/agents/${agentId}/status`,
    { status },
  );
  return unwrap(response.data);
}

export async function setUserActive(userId: string, isActive: boolean): Promise<true> {
  await authApi.patch<unknown>(`/users/${userId}`, {
    is_active: isActive,
  });
  return true;
}

export async function deleteAgent(agentId: string): Promise<boolean> {
  const response = await authApi.delete<boolean>(`/agents/${agentId}`);
  return response.data === true;
}

export async function grantAdminAccess(options: {
  adminId: string;
  agentId: string;
}): Promise<boolean> {
  const response = await authApi.post<boolean>("/agents/assign-agent", {
    admin_id: options.adminId,
    agent_id: options.agentId,
    can_inherit_privileges: true,
  });
  return response.data === true;
}

export type ManualOnboardedAgent = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  serviceArea: string;
  status: string;
  temporaryPassword?: string;
};

export type ManualOnboardedAgentResult = ManualOnboardedAgent & {
  message?: string | null;
};

export async function agentOnboardingManually(
  agent: AdminAgent,
): Promise<ManualOnboardedAgentResult> {
  // The Axios response interceptor (`peelV1EnvelopeForAxios`) already strips the
  // `{ success, data, message }` envelope, so `response.data` is the agent payload.
  // The original envelope `message` is stashed on the response for callers that need it.
  const response = await authApi.post<ManualOnboardedAgent>("/agents/manual-onboard", {
    fullName: agent.fullName,
    email: agent.email,
    phone: agent.phone,
    serviceArea: agent.city,
  });
  const message = readV1EnvelopeMessage(response);
  return { ...response.data, message };
}

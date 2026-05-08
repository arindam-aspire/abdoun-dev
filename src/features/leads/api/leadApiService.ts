"use client";

import { authApi, publicApi } from "@/lib/http/clients";
import type {
  AdminManualLeadCreatePayload,
  ContactFormLeadCreatePayload,
  Lead,
  LeadHistoryItem,
  LeadListParams,
  LeadListResponse,
  LeadMessage,
  LeadMessageCreatePayload,
  LeadNote,
  OfflineLeadCreatePayload,
  LeadNotePayload,
  LeadReassignPayload,
  LeadStatusUpdatePayload,
} from "@/types/lead";

export type LeadPropertySearchOption = {
  /** UI option key (can be numeric/hash based). */
  id: string;
  /** UUID accepted by lead create API; absent when backend does not provide it. */
  propertyId?: string | null;
  title: string;
  propertyHash?: number | null;
  referenceNumber?: string | null;
  city?: string | null;
  area?: string | null;
  location?: string | null;
};

export type LeadPropertySearchResult = {
  items: LeadPropertySearchOption[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

const EMPTY_SUMMARY = {
  total: 0,
  NEW: 0,
  IN_PROGRESS: 0,
  REQUEST_FOR_CLOSE: 0,
  CLOSED: 0,
} as const;

function unwrapListItems(response: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(response)) return response as Array<Record<string, unknown>>;
  if (!response || typeof response !== "object") return [];
  const root = response as Record<string, unknown>;
  if (Array.isArray(root.items)) return root.items as Array<Record<string, unknown>>;
  if (Array.isArray(root.data)) return root.data as Array<Record<string, unknown>>;
  if (root.data && typeof root.data === "object") {
    const nested = root.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) return nested.items as Array<Record<string, unknown>>;
    if (Array.isArray(nested.data)) return nested.data as Array<Record<string, unknown>>;
  }
  return [];
}

function normalizeLeadListResponse(response: LeadListResponse): LeadListResponse {
  return {
    ...response,
    summary: response.summary ?? {
      ...EMPTY_SUMMARY,
      total: response.total ?? 0,
    },
  };
}

function unwrapArrayResponse<T>(response: unknown): T[] {
  const value = response as {
    data?: unknown;
    items?: unknown;
  } | null;

  if (Array.isArray(response)) return response as T[];
  if (Array.isArray(value?.data)) return value.data as T[];
  if (Array.isArray((value?.data as { items?: unknown } | undefined)?.items)) {
    return ((value?.data as { items?: unknown }).items ?? []) as T[];
  }
  if (Array.isArray(value?.items)) return value.items as T[];
  return [];
}

function unwrapItemResponse<T>(response: unknown): T | null {
  const value = response as {
    data?: unknown;
    item?: unknown;
  } | null;
  if (response && typeof response === "object" && !Array.isArray(response)) {
    const raw = response as Record<string, unknown>;
    if (!("data" in raw) && !("item" in raw)) return response as T;
  }
  if (value?.data && typeof value.data === "object" && !Array.isArray(value.data)) {
    const dataObj = value.data as { item?: unknown };
    if (dataObj.item != null) return dataObj.item as T;
    return value.data as T;
  }
  if (value?.item != null) return value.item as T;
  return null;
}

function withDefaultPagination(params: LeadListParams = {}): Required<Pick<LeadListParams, "page" | "pageSize">> &
  Omit<LeadListParams, "page" | "pageSize"> {
  return {
    page: params.page && params.page > 0 ? params.page : 1,
    pageSize: params.pageSize && params.pageSize > 0 ? params.pageSize : 10,
    ...(params.status ? { status: params.status } : {}),
    ...(params.source ? { source: params.source } : {}),
  };
}

export async function createContactLead(payload: ContactFormLeadCreatePayload): Promise<Lead> {
  const response = await authApi.post<Lead>("/leads/contact-form", payload);
  return response.data;
}

export async function getMyLeads(params: LeadListParams = {}): Promise<LeadListResponse> {
  const response = await authApi.get<LeadListResponse>("/leads/my", {
    params: withDefaultPagination(params),
  });
  return normalizeLeadListResponse(response.data);
}

export async function getLeadDetail(leadId: string): Promise<Lead> {
  const response = await authApi.get<Lead>(`/leads/${leadId}`);
  return response.data;
}

export async function getLeadMessages(leadId: string): Promise<LeadMessage[]> {
  const response = await authApi.get<unknown>(`/leads/${leadId}/messages`);
  return unwrapArrayResponse<LeadMessage>(response.data);
}

export async function postLeadMessage(leadId: string, payload: LeadMessageCreatePayload): Promise<LeadMessage> {
  const response = await authApi.post<unknown>(`/leads/${leadId}/messages`, payload);
  const item = unwrapItemResponse<LeadMessage>(response.data);
  if (item) return item;
  return response.data as LeadMessage;
}

export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  const response = await authApi.get<unknown>(`/leads/${leadId}/notes`);
  return unwrapArrayResponse<LeadNote>(response.data);
}

export async function createLeadNote(leadId: string, payload: LeadNotePayload): Promise<LeadNote> {
  const response = await authApi.post<LeadNote>(`/leads/${leadId}/notes`, payload);
  return response.data;
}

export async function updateLeadNote(leadId: string, noteId: string, payload: LeadNotePayload): Promise<LeadNote> {
  const response = await authApi.patch<LeadNote>(`/leads/${leadId}/notes/${noteId}`, payload);
  return response.data;
}

export async function deleteLeadNote(leadId: string, noteId: string): Promise<boolean> {
  const response = await authApi.delete<boolean>(`/leads/${leadId}/notes/${noteId}`);
  return response.data === true;
}

export async function getLeadHistory(leadId: string): Promise<LeadHistoryItem[]> {
  const response = await authApi.get<unknown>(`/leads/${leadId}/history`);
  return unwrapArrayResponse<LeadHistoryItem>(response.data);
}

export async function getAgentLeads(params: LeadListParams = {}): Promise<LeadListResponse> {
  const response = await authApi.get<LeadListResponse>("/agent/leads", {
    params: withDefaultPagination(params),
  });
  return normalizeLeadListResponse(response.data);
}

export async function getAgentLeadDetail(leadId: string): Promise<Lead> {
  return getLeadDetail(leadId);
}

export async function updateAgentLeadStatus(
  leadId: string,
  payload: LeadStatusUpdatePayload,
): Promise<Lead> {
  const response = await authApi.patch<Lead>(`/agent/leads/${leadId}/status`, payload);
  return response.data;
}

export async function replyToAgentLead(leadId: string, payload: LeadMessageCreatePayload): Promise<LeadMessage> {
  return postLeadMessage(leadId, payload);
}

export async function createAgentLeadNote(leadId: string, payload: LeadNotePayload): Promise<LeadNote> {
  return createLeadNote(leadId, payload);
}

export async function updateAgentLeadNote(
  leadId: string,
  noteId: string,
  payload: LeadNotePayload,
): Promise<LeadNote> {
  return updateLeadNote(leadId, noteId, payload);
}

export async function deleteAgentLeadNote(leadId: string, noteId: string): Promise<boolean> {
  return deleteLeadNote(leadId, noteId);
}

export async function getAdminLeads(params: LeadListParams = {}): Promise<LeadListResponse> {
  const response = await authApi.get<LeadListResponse>("/admin/leads", {
    params: withDefaultPagination(params),
  });
  return normalizeLeadListResponse(response.data);
}

export async function createAdminLead(payload: AdminManualLeadCreatePayload): Promise<Lead> {
  const response = await authApi.post<Lead>("/admin/leads", payload);
  return response.data;
}

export async function createOfflineLead(payload: OfflineLeadCreatePayload): Promise<Lead> {
  const response = await authApi.post<unknown>("/leads/manual", payload);
  const item = unwrapItemResponse<Lead>(response.data);
  if (item) return item;
  return response.data as Lead;
}

export async function searchLeadProperties(args: {
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<LeadPropertySearchResult> {
  const q = (args.query ?? "").trim();
  const page = args.page && args.page > 0 ? args.page : 1;
  const pageSize = args.pageSize && args.pageSize > 0 ? args.pageSize : 10;
  const response = await publicApi.get<unknown>("/properties", {
    params: {
      page,
      pageSize,
      ...(q ? { search: q } : {}),
    },
  });
  const payload = response.data as {
    total?: number;
    page?: number;
    pageSize?: number;
  } | null;
  const rows = unwrapListItems(payload);
  const mapped: LeadPropertySearchOption[] = [];
  rows.forEach((row) => {
      const uuidCandidate = row.property_id ?? row.propertyId ?? row.uuid ?? null;
      const uuid = uuidCandidate != null ? String(uuidCandidate).trim() : "";
      const fallbackIdCandidate = row.id != null ? String(row.id).trim() : "";
      const hashCandidate = row.propertyHash ?? row.property_hash ?? null;
      const fallbackHash = hashCandidate != null ? String(hashCandidate).trim() : "";
      const id = fallbackIdCandidate || fallbackHash || `property-${mapped.length + 1}`;
      const titleRaw = row.title;
      const title = (typeof titleRaw === "string"
        ? titleRaw
        : titleRaw && typeof titleRaw === "object"
          ? (titleRaw as Record<string, unknown>).en ??
            (titleRaw as Record<string, unknown>).ar ??
            (titleRaw as Record<string, unknown>).fr ??
            (titleRaw as Record<string, unknown>).esp
          : "") as string | undefined;
      const safeTitle = (title ?? "").trim();
      if (!safeTitle) return;
      const hashRaw = row.propertyHash ?? row.property_hash ?? row.id ?? null;
      const locationRaw = row.location ?? row.location_name ?? null;
      const locationObj = locationRaw && typeof locationRaw === "object"
        ? (locationRaw as Record<string, unknown>)
        : null;
      const cityValue = typeof row.city === "string" && row.city.trim()
        ? row.city.trim()
        : typeof locationObj?.city === "string" && locationObj.city.trim()
          ? locationObj.city.trim()
          : "";
      const areaValue = typeof row.areaName === "string" && row.areaName.trim()
        ? row.areaName.trim()
        : typeof locationObj?.region === "string" && locationObj.region.trim()
          ? locationObj.region.trim()
          : "";
      const location = [cityValue, areaValue].filter(Boolean).join(", ") || null;
      const parsedHash = typeof hashRaw === "number" ? hashRaw : hashRaw != null ? Number(hashRaw) : NaN;
      const option: LeadPropertySearchOption = {
        id,
        propertyId: isUuidLike(uuid) ? uuid : null,
        title: safeTitle,
        referenceNumber:
          typeof row.reference_number === "string" && row.reference_number.trim()
            ? row.reference_number.trim()
            : null,
        city: cityValue || null,
        area: areaValue || null,
        location,
      };
      if (Number.isFinite(parsedHash)) option.propertyHash = parsedHash;
      mapped.push(option);
    });
  const total = typeof payload?.total === "number" ? payload.total : mapped.length;
  const currentPage = typeof payload?.page === "number" ? payload.page : page;
  const currentPageSize = typeof payload?.pageSize === "number" ? payload.pageSize : pageSize;
  return {
    items: mapped,
    total,
    page: currentPage,
    pageSize: currentPageSize,
    hasMore: currentPage * currentPageSize < total,
  };
}

export async function reassignAdminLead(leadId: string, payload: LeadReassignPayload): Promise<Lead> {
  const response = await authApi.patch<Lead>(`/admin/leads/${leadId}/reassign`, payload);
  return response.data;
}

export async function updateAdminLeadStatus(
  leadId: string,
  payload: LeadStatusUpdatePayload,
): Promise<Lead> {
  const response = await authApi.patch<Lead>(`/admin/leads/${leadId}/status`, payload);
  return response.data;
}

export async function adminCloseDecision(
  leadId: string,
  payload: LeadStatusUpdatePayload,
): Promise<Lead> {
  const response = await authApi.post<Lead>(`/admin/leads/${leadId}/close-decision`, payload);
  return response.data;
}

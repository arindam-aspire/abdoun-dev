"use client";

import { authApi } from "@/lib/http/clients";
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
  ManualOwnerLeadCreatePayload,
  LeadNotePayload,
  LeadReassignPayload,
  LeadStatusUpdatePayload,
} from "@/types/lead";

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
  return response.data;
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
  return response.data;
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
  return response.data;
}

export async function createAdminLead(payload: AdminManualLeadCreatePayload): Promise<Lead> {
  const response = await authApi.post<Lead>("/admin/leads", payload);
  return response.data;
}

export async function createManualOwnerLead(payload: ManualOwnerLeadCreatePayload): Promise<Lead> {
  const response = await authApi.post<unknown>("/leads/manual", payload);
  const item = unwrapItemResponse<Lead>(response.data);
  if (item) return item;
  return response.data as Lead;
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

export type LeadStatus = "NEW" | "IN_PROGRESS" | "REQUEST_FOR_CLOSE" | "CLOSED";

export type LeadSource = "EMAIL_FORM" | "PHONE" | "WHATSAPP" | "MANUAL_ADMIN" | "OFFLINE_MANUAL";

/** Snapshot from lead APIs for display and linking (no extra property fetch). */
export interface PropertySummary {
  id: string;
  title?: string | null;
  slug?: string | null;
  /** Numeric id segment for `/${locale}/property-details/[id]` (not UUID). */
  propertyHash?: number | null;
}

export type AssignedAgentSummary = {
  id: string;
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type LeadUserSummary = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type LeadExternalOwner = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export interface OfflineLeadSummary {
  customerName?: string | null;
  phoneNumber?: string | null;
  propertyName?: string | null;
  propertyId?: string | null;
  inquiryType?: string | null;
  source?: string | null;
  notes?: string | null;
  createdByAgentId?: string | null;
  createdByAdminId?: string | null;
}

export interface Lead {
  id: string;
  /** Human-readable reference e.g. LD-2026-000123 */
  leadNumber?: string | null;
  propertyId?: string | null;
  property?: PropertySummary | null;
  userId?: string | null;
  user?: LeadUserSummary | null;
  /** When set to EXTERNAL, in-app messaging is not used; communication is outside the app. */
  communicationMode?: "IN_APP" | "EXTERNAL" | string;
  externalOwner?: LeadExternalOwner | null;
  externalPropertyName?: string | null;
  offlineLead?: OfflineLeadSummary | null;
  createdByAgentId?: string | null;
  createdByAdminId?: string | null;
  status: LeadStatus;
  source: LeadSource;
  assignedAgentId: string | null;
  assignedAgent?: AssignedAgentSummary | null;
  assignedByAdminId: string | null;
  message: string | null;
  lastActivityAt: string | null;
  requestCloseAt: string | null;
  closedAt: string | null;
  closedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatusSummary = {
  total: number;
  NEW: number;
  IN_PROGRESS: number;
  REQUEST_FOR_CLOSE: number;
  CLOSED: number;
};

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
  summary?: LeadStatusSummary;
}

export interface ContactFormLeadCreatePayload {
  propertyId: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}

export interface AdminManualLeadCreatePayload {
  propertyId: string;
  assignedAgentId: string;
  source: Extract<LeadSource, "PHONE" | "WHATSAPP" | "MANUAL_ADMIN">;
  message: string;
  contactUserId?: string | null;
}

export interface OfflineLeadCreatePayload {
  customerName: string;
  phoneNumber: string;
  propertyName?: string | null;
  propertyId?: string | null;
  inquiryType: "BUY" | "RENT" | "SELL" | "OTHER";
  source: "PHONE" | "WHATSAPP" | "WALK_IN" | "FACEBOOK" | "REFERRAL" | "OTHER";
  notes?: string | null;
  assignedAgentId?: string | null;
}

export interface LeadStatusUpdatePayload {
  status: LeadStatus;
  reason?: string | null;
}

export interface LeadReassignPayload {
  assignedAgentId: string;
}

export interface LeadMessageCreatePayload {
  message: string;
}

export interface LeadNotePayload {
  note: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  authorUserId: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadMessage {
  id: string;
  leadId: string;
  senderUserId: string | null;
  recipientUserId: string | null;
  message: string;
  channel: string;
  deliveryState: string | null;
  createdAt: string;
}

export interface LeadHistoryItem {
  id: string;
  leadId: string;
  /** Legacy/optional action text retained for compatibility. */
  action?: string | null;
  fromStatus?: LeadStatus | null;
  toStatus?: LeadStatus | null;
  actorUserId?: string | null;
  actorRole?: string | null;
  reason?: string | null;
  /** Canonical audit timestamp from backend history endpoint. */
  changedAt?: string | null;
  /** Legacy timestamp retained for compatibility. */
  createdAt?: string | null;
  /** Optional legacy aliases retained for compatibility. */
  previousStatus?: LeadStatus | null;
  newStatus?: LeadStatus | null;
}

export type LeadItem = Lead;
export type LeadReplyPayload = LeadMessageCreatePayload;
export type LeadReply = LeadMessage;

export type LeadListParams = {
  status?: LeadStatus;
  source?: LeadSource;
  page?: number;
  pageSize?: number;
};

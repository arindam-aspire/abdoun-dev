"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  adminCloseDecision,
  createLeadNote,
  deleteLeadNote,
  getLeadDetail,
  getLeadHistory,
  getLeadMessages,
  getLeadNotes,
  postLeadMessage,
  reassignAdminLead,
  updateLeadNote,
  updateAgentLeadStatus,
} from "@/features/leads/api/leadApiService";
import { Button, DialogRoot, Select, Skeleton, Toast } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { AGENT_STATUS, normalizeAgentStatus } from "@/constants/agentStatus";
import { fetchAdminAgents } from "@/features/admin/adminAgentsSlice";
import {
  ArrowLeft,
  ArrowRightLeft,
  Building2,
  CalendarDays,
  CheckCheck,
  Clock3,
  Info,
  MessageCircle,
  SendHorizontal,
  UserCog,
  UserPlus,
} from "lucide-react";
import type { Lead, LeadHistoryItem, LeadMessage, LeadNote, LeadStatus } from "@/types/lead";

type Mode = "agent" | "admin" | "user";
type ActivityTab = "conversation" | "notes" | "history";

function leadListHref(locale: string, mode: Mode): string {
  if (mode === "admin") return `/${locale}/leads`;
  if (mode === "agent") return `/${locale}/agent-dashboard/leads-and-inquiries`;
  return `/${locale}/my-inquiries`;
}

const toArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

function StatusActionSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-28 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  );
}

function TabContentSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-5" aria-busy>
      {Array.from({ length: 5 }, (_, i) => (
        <Card key={i} className="rounded-xl border-subtle shadow-sm">
          <CardContent className="flex flex-col items-center text-center">
            {i === 0 ? (
              <>
                <Skeleton className="h-44 w-full max-w-full rounded-xl" />
                <Skeleton className="mt-3 h-3 w-16 max-w-full rounded-md" />
                <Skeleton className="mt-2 h-4 w-[90%] max-w-[12rem] rounded-md" />
              </>
            ) : (
              <>
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <Skeleton className="mt-3 h-3 w-20 max-w-full rounded-md" />
                <Skeleton className="mt-2 h-4 w-[90%] max-w-[11rem] rounded-md" />
                {i === 1 || i === 2 ? (
                  <>
                    <Skeleton className="mt-2 h-3 w-[85%] max-w-[10rem] rounded-md" />
                    <Skeleton className="mt-1.5 h-3 w-[70%] max-w-[9rem] rounded-md" />
                  </>
                ) : null}
                {i === 3 || i === 4 ? <Skeleton className="mt-1 h-4 w-36 max-w-full rounded-md" /> : null}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function statusLabel(status: LeadStatus): string {
  return status.replaceAll("_", " ");
}

function leadStatusClass(status: LeadStatus): string {
  if (status === "NEW") return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "IN_PROGRESS") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "REQUEST_FOR_CLOSE") return "bg-violet-100 text-violet-800 border-violet-200";
  if (status === "CLOSED") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  return "bg-charcoal/10 text-charcoal/80 border-subtle";
}

function normalizeLeadStatusValue(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

function isLeadStatus(value: string | null | undefined, expected: LeadStatus): boolean {
  return normalizeLeadStatusValue(value) === expected;
}

function historyFromStatus(item: LeadHistoryItem): LeadStatus | null {
  return item.fromStatus ?? item.previousStatus ?? null;
}

function historyToStatus(item: LeadHistoryItem): LeadStatus | null {
  return item.toStatus ?? item.newStatus ?? null;
}

function historyChangedAt(item: LeadHistoryItem): string | null {
  return item.changedAt ?? item.createdAt ?? null;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function leadDisplayRef(lead: Pick<Lead, "id" | "leadNumber">): string {
  const num = lead.leadNumber?.trim();
  if (num) return num;
  if (lead.id.length >= 8) return `LD-${lead.id.slice(0, 8)}`;
  return "-";
}

function isExternalCommunicationLead(lead: Lead): boolean {
  return String(lead.communicationMode ?? "").toUpperCase() === "EXTERNAL";
}

function propertyDisplayLabel(lead: Lead): string {
  const title = lead.property?.title?.trim();
  if (title) return title;
  const offlineName = lead.offlineLead?.propertyName?.trim();
  if (offlineName) return offlineName;
  const externalName = lead.externalPropertyName?.trim();
  if (externalName) return externalName;
  const hash = lead.property?.propertyHash;
  if (hash != null && !Number.isNaN(Number(hash))) return `Property ${hash}`;
  const legacy = lead.propertyId;
  if (legacy && legacy.length >= 8) return `Property ${legacy.slice(0, 8)}`;
  return "External Property";
}

function propertyDetailHref(locale: string, lead: Lead): string | null {
  const hash = lead.property?.propertyHash;
  if (hash == null || Number.isNaN(Number(hash))) return null;
  return `/${locale}/property-details/${hash}`;
}

function submittedByLabel(lead: Lead): string {
  const offlineName = lead.offlineLead?.customerName?.trim();
  if (offlineName) return offlineName;
  const extName = lead.externalOwner?.name?.trim();
  if (extName) return extName;
  const name = lead.user?.fullName?.trim();
  if (name) return name;
  const email = lead.user?.email?.trim();
  if (email) return email;
  const offlinePhone = lead.offlineLead?.phoneNumber?.trim();
  if (offlinePhone) return offlinePhone;
  const extEmail = lead.externalOwner?.email?.trim();
  if (extEmail) return extEmail;
  const extPhone = lead.externalOwner?.phone?.trim();
  if (extPhone) return extPhone;
  if (isExternalCommunicationLead(lead)) return "External Owner";
  return "Unknown user";
}

function isReassignmentEvent(item: LeadHistoryItem): boolean {
  const from = historyFromStatus(item);
  const to = historyToStatus(item);
  const reason = item.reason?.toLowerCase() ?? "";
  return from != null && to != null && from === to && reason.includes("reassigned agent");
}

function historyPrimaryText(item: LeadHistoryItem): string {
  const from = historyFromStatus(item);
  const to = historyToStatus(item);
  const reason = item.reason?.toLowerCase() ?? "";

  if (isReassignmentEvent(item)) return "Agent reassigned";
  if (reason.includes("offline lead created")) return "Offline lead created";
  if (from == null && to != null) return `Created as ${statusLabel(to)}`;
  if (from != null && to != null) {
    if (to === "CLOSED") return "Lead closed";
    return `${statusLabel(from)} -> ${statusLabel(to)}`;
  }
  return item.action?.trim() || "Lead updated";
}

function historyDotClass(item: LeadHistoryItem): string {
  if (isReassignmentEvent(item)) return "bg-indigo-100 text-indigo-700";
  const from = historyFromStatus(item);
  const to = historyToStatus(item);
  if (from == null && to != null) return "bg-emerald-100 text-emerald-700";
  if (to === "REQUEST_FOR_CLOSE") return "bg-violet-100 text-violet-700";
  if (to === "CLOSED") return "bg-emerald-100 text-emerald-700";
  return "bg-sky-100 text-sky-700";
}

function historyIcon(item: LeadHistoryItem) {
  if (isReassignmentEvent(item)) return <UserCog className="h-4 w-4" />;
  const from = historyFromStatus(item);
  const to = historyToStatus(item);
  if (from == null && to != null) return <UserPlus className="h-4 w-4" />;
  if (to === "REQUEST_FOR_CLOSE") return <Clock3 className="h-4 w-4" />;
  if (to === "CLOSED") return <CheckCheck className="h-4 w-4" />;
  return <ArrowRightLeft className="h-4 w-4" />;
}

function getInitials(primary?: string | null, fallback?: string | null): string {
  const source = (primary?.trim() || fallback?.trim() || "").trim();
  if (!source) return "NA";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function getPropertyThumbUrl(lead: Lead | null): string | null {
  if (!lead) return null;
  const property = lead.property as (Lead["property"] & {
    thumbnailUrl?: string | null;
    imageUrl?: string | null;
    coverImageUrl?: string | null;
    thumbnail?: string | null;
    coverImage?: string | null;
    images?: Array<string | { url?: string | null; imageUrl?: string | null; src?: string | null }>;
    media?: Array<string | { url?: string | null; imageUrl?: string | null; src?: string | null }>;
  }) | null;
  const firstImageFrom = (
    value: Array<string | { url?: string | null; imageUrl?: string | null; src?: string | null }> | undefined,
  ): string | null => {
    if (!Array.isArray(value) || value.length === 0) return null;
    const first = value[0];
    if (typeof first === "string") return first.trim() || null;
    const resolved = first?.url ?? first?.imageUrl ?? first?.src ?? null;
    return resolved?.trim() || null;
  };
  const raw =
    property?.thumbnailUrl ??
    property?.imageUrl ??
    property?.coverImageUrl ??
    property?.thumbnail ??
    property?.coverImage ??
    firstImageFrom(property?.images) ??
    firstImageFrom(property?.media) ??
    null;
  const value = raw?.trim();
  return value ? value : null;
}

export function LeadDetailPage({ mode, leadId }: { mode: Mode; leadId: string }) {
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const canViewNotes = mode !== "user";
  const canEditOwnNotes = mode === "agent";
  const canViewHistory = mode !== "user";
  const { currentItems: adminAgents, loading: adminAgentsLoading } = useAppSelector((state) => state.adminAgents);

  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<LeadMessage[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [history, setHistory] = useState<LeadHistoryItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(canViewNotes);
  const [historyLoading, setHistoryLoading] = useState(canViewHistory);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [adminReassignAgentId, setAdminReassignAgentId] = useState("");
  const [activeTab, setActiveTab] = useState<ActivityTab>("conversation");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const isExternalCommunication = useMemo(
    () => (lead ? isExternalCommunicationLead(lead) : false),
    [lead],
  );
  const canReply = mode !== "admin" && !isExternalCommunication;

  const refreshMessages = useCallback(async () => {
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const thread = await getLeadMessages(leadId);
      setMessages([...thread].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } catch (error) {
      setMessages([]);
      setMessagesError(getApiErrorMessage(error, "Failed to load messages."));
    } finally {
      setMessagesLoading(false);
    }
  }, [leadId]);

  const loadAll = useCallback(async () => {
    setDetailLoading(true);
    setMessagesLoading(true);
    setNotesLoading(canViewNotes);
    setHistoryLoading(canViewHistory);
    setMessagesError(null);
    setNotesError(null);
    setHistoryError(null);

    try {
      const detail = await getLeadDetail(leadId);
      setLead(detail);
    } catch (error) {
      setLead(null);
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to load lead detail.") });
    } finally {
      setDetailLoading(false);
    }

    await refreshMessages();

    if (canViewNotes) {
      try {
        const notesRaw = await getLeadNotes(leadId);
        setNotes(toArray<LeadNote>(notesRaw));
      } catch (error) {
        setNotes([]);
        setNotesError(getApiErrorMessage(error, "Failed to load notes."));
      } finally {
        setNotesLoading(false);
      }
    } else {
      setNotes([]);
      setNotesLoading(false);
    }

    if (canViewHistory) {
      try {
        const historyRaw = await getLeadHistory(leadId);
        const rows = toArray<LeadHistoryItem>(historyRaw);
        rows.sort((a, b) => {
          const left = historyChangedAt(a);
          const right = historyChangedAt(b);
          return new Date(left ?? 0).getTime() - new Date(right ?? 0).getTime();
        });
        setHistory(rows);
      } catch (error) {
        setHistory([]);
        setHistoryError(getApiErrorMessage(error, "Failed to load history."));
      } finally {
        setHistoryLoading(false);
      }
    } else {
      setHistory([]);
      setHistoryLoading(false);
    }
  }, [canViewHistory, canViewNotes, leadId, refreshMessages]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const onStatusChange = async (nextStatus: LeadStatus) => {
    if (!lead) return;
    try {
      const updated = await updateAgentLeadStatus(lead.id, { status: nextStatus });
      setLead(updated);
      setToast({ kind: "success", message: "Status updated successfully." });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to update status.") });
    }
  };

  const onReply = async () => {
    if (!lead || isLeadStatus(lead.status, "CLOSED") || !replyText.trim()) return;
    try {
      await postLeadMessage(lead.id, { message: replyText.trim() });
      await refreshMessages();
      setReplyText("");
      setToast({ kind: "success", message: "Reply sent successfully." });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to send reply.") });
    }
  };

  const onSaveNote = async () => {
    if (!lead || isLeadStatus(lead.status, "CLOSED") || !noteText.trim()) return;
    try {
      if (editingNoteId) {
        const updated = await updateLeadNote(lead.id, editingNoteId, { note: noteText.trim() });
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } else {
        const created = await createLeadNote(lead.id, { note: noteText.trim() });
        setNotes((prev) => [created, ...prev]);
      }
      setNoteText("");
      setEditingNoteId(null);
      setToast({ kind: "success", message: "Note saved successfully." });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to save note.") });
    }
  };

  const onDeleteNote = async (noteId: string) => {
    if (!lead || isLeadStatus(lead.status, "CLOSED")) return;
    try {
      await deleteLeadNote(lead.id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setToast({ kind: "success", message: "Note deleted successfully." });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to delete note.") });
    }
  };

  const loadAgentsForReassign = useCallback(async () => {
    await dispatch(fetchAdminAgents({ page: 1, pageSize: 100, force: true }));
  }, [dispatch]);

  const onOpenReassignModal = async () => {
    setIsReassignModalOpen(true);
    setAdminReassignAgentId("");
    await loadAgentsForReassign();
  };

  const onAdminReassignLead = async () => {
    if (!lead || !adminReassignAgentId.trim()) return;
    if (adminReassignAgentId.trim() === lead.assignedAgentId) {
      setToast({ kind: "error", message: "Lead is already assigned to this agent." });
      return;
    }
    try {
      const updated = await reassignAdminLead(lead.id, { assignedAgentId: adminReassignAgentId.trim() });
      setLead(updated);
      setIsReassignModalOpen(false);
      setAdminReassignAgentId("");
      setToast({ kind: "success", message: "Lead reassigned successfully." });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to reassign lead.") });
    }
  };

  const assignedAgentLabel =
    lead?.assignedAgent?.fullName ??
    lead?.assignedAgent?.name ??
    lead?.assignedAgent?.email ??
    (lead?.assignedAgentId ? lead.assignedAgentId.slice(0, 8) : "Unassigned");
  const assignedAgentEmail = lead?.assignedAgent?.email?.trim() || null;
  const assignedAgentPhone = lead?.assignedAgent?.phone?.trim() || null;
  const submitterName = lead ? submittedByLabel(lead) : "Unknown user";
  const submitterEmail = lead?.externalOwner?.email?.trim() || lead?.user?.email?.trim() || null;
  const submitterPhone =
    lead?.offlineLead?.phoneNumber?.trim() || lead?.externalOwner?.phone?.trim() || lead?.user?.phone?.trim() || null;
  const propertyThumbUrl = getPropertyThumbUrl(lead);
  const hasLinkedProperty = Boolean(lead?.property?.propertyHash != null || lead?.property?.title?.trim());
  const isClosed = isLeadStatus(lead?.status, "CLOSED");
  const canMutateNotes = canViewNotes && !isClosed;

  const reassignableAgents = useMemo(() => {
    return adminAgents
      .filter((agent) => typeof agent.id === "string" && agent.id.trim().length > 0)
      .filter((agent) => normalizeAgentStatus(agent.status) === AGENT_STATUS.ACTIVE)
      .map((agent) => {
        const id = agent.id ?? "";
        const label =
          agent.fullName?.trim() || agent.email?.trim() || (id.length >= 8 ? id.slice(0, 8) : id);
        return { value: id, label };
      });
  }, [adminAgents]);

  const adminCanClose = isLeadStatus(lead?.status, "REQUEST_FOR_CLOSE");
  const visibleTabs = useMemo<ActivityTab[]>(
    () => [
      "conversation",
      ...(canViewNotes ? (["notes"] as const) : []),
      ...(canViewHistory ? (["history"] as const) : []),
    ],
    [canViewHistory, canViewNotes],
  );

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0] ?? "conversation");
    }
  }, [activeTab, visibleTabs]);

  const onAdminCloseLead = async () => {
    if (!lead || !adminCanClose) return;
    try {
      await adminCloseDecision(lead.id, { status: "CLOSED" });
      await loadAll();
      setToast({ kind: "success", message: "Lead closed successfully." });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to close lead.") });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 px-6 py-6">
      <Link
        href={leadListHref(locale, mode)}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            {detailLoading ? "Lead detail" : lead ? `Lead ${leadDisplayRef(lead)}` : "Lead detail"}
          </h1>
          {!detailLoading && lead ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-size-sm text-charcoal/70">
              <span>{propertyDisplayLabel(lead)}</span>
              <span
                className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${leadStatusClass(
                  lead.status,
                )}`}
              >
                {statusLabel(lead.status)}
              </span>
              {lead.source === "OFFLINE_MANUAL" ? (
                <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                  Offline
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {detailLoading ? <StatusActionSkeleton /> : null}
          {!detailLoading && lead && mode === "agent" ? (
            <>
                {!isClosed && isLeadStatus(lead.status, "NEW") ? (
                <Button type="button" variant="outline" onClick={() => onStatusChange("IN_PROGRESS")}>
                  Mark In Progress
                </Button>
              ) : null}
                {!isClosed && isLeadStatus(lead.status, "IN_PROGRESS") ? (
                <Button type="button" variant="primary" onClick={() => onStatusChange("REQUEST_FOR_CLOSE")}>
                  Request Close
                </Button>
              ) : null}
              {isLeadStatus(lead.status, "REQUEST_FOR_CLOSE") ? (
                <Button type="button" variant="outline" disabled>
                  Waiting for Admin
                </Button>
              ) : null}
                {isClosed ? (
                <Button type="button" variant="outline" disabled>
                  Closed
                </Button>
              ) : null}
            </>
          ) : null}
          {!detailLoading && lead && mode === "admin" ? (
            <>
              {!isLeadStatus(lead.status, "CLOSED") ? (
                <Button type="button" variant="primary" onClick={() => void onOpenReassignModal()}>
                  Reassign Agent
                </Button>
              ) : null}
              {adminCanClose ? (
                <Button type="button" variant="primary" onClick={onAdminCloseLead}>
                  Close Lead
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {detailLoading ? (
        <SummaryCardSkeleton />
      ) : lead ? (
        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          <Card className="rounded-xl border-subtle shadow-sm transition hover:shadow-md">
            <CardContent className="flex flex-col items-center text-center">
              {propertyThumbUrl ? (
                <div className="relative h-44 w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/[0.06]">
                  <Image
                    src={propertyThumbUrl}
                    alt={propertyDisplayLabel(lead)}
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 18vw"
                  />
                </div>
              ) : hasLinkedProperty ? (
                <div className="flex h-44 w-full items-center justify-center rounded-xl bg-slate-100 text-charcoal/40 ring-1 ring-black/[0.04]">
                  <Building2 className="h-8 w-8" />
                </div>
              ) : null}
              <p
                className={cn(
                  "text-size-xs font-medium text-charcoal/70",
                  propertyThumbUrl || hasLinkedProperty ? "mt-3" : undefined,
                )}
              >
                Property
              </p>
              <p className="mt-2 max-w-full break-words text-sm fw-medium text-charcoal">
                {(() => {
                  const label = propertyDisplayLabel(lead);
                  const href = propertyDetailHref(locale, lead);
                  return href ? (
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline fw-medium"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span>{label}</span>
                  );
                })()}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-subtle shadow-sm transition hover:shadow-md">
            <CardContent className="flex flex-col items-center text-center">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs fw-semibold text-primary ring-1 ring-primary/20">
                {getInitials(submitterName, submitterEmail)}
              </span>
              <p className="mt-3 text-size-xs font-medium text-charcoal/70">Submitted by</p>
              <div className="mt-2 w-full min-w-0 space-y-0.5">
                <p className="break-words text-sm fw-medium text-charcoal">{submitterName}</p>
                {submitterEmail ? <p className="break-words text-xs text-charcoal/70">{submitterEmail}</p> : null}
                {submitterPhone ? <p className="break-words text-xs text-charcoal/70">{submitterPhone}</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-subtle shadow-sm transition hover:shadow-md">
            <CardContent className="flex flex-col items-center text-center">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-xs fw-semibold text-secondary ring-1 ring-secondary/20">
                {getInitials(assignedAgentLabel, assignedAgentEmail)}
              </span>
              <p className="mt-3 text-size-xs font-medium text-charcoal/70">Assigned agent</p>
              <div className="mt-2 w-full min-w-0 space-y-0.5">
                <p className="break-words text-sm fw-medium text-charcoal">{assignedAgentLabel}</p>
                {assignedAgentEmail ? <p className="break-words text-xs text-charcoal/70">{assignedAgentEmail}</p> : null}
                {assignedAgentPhone ? <p className="break-words text-xs text-charcoal/70">{assignedAgentPhone}</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-subtle shadow-sm transition hover:shadow-md">
            <CardContent className="flex flex-col items-center text-center">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/14 ring-1 ring-emerald-500/20"
                aria-hidden
              >
                <CalendarDays className="h-5 w-5 text-secondary" />
              </span>
              <p className="mt-3 text-size-xs font-medium text-charcoal/70">Created</p>
              <p className="mt-2 text-sm fw-semibold text-charcoal">{formatDate(lead.createdAt)}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-subtle shadow-sm transition hover:shadow-md">
            <CardContent className="flex flex-col items-center text-center">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/14 ring-1 ring-amber-500/20"
                aria-hidden
              >
                <Clock3 className="h-5 w-5 text-secondary" />
              </span>
              <p className="mt-3 text-size-xs font-medium text-charcoal/70">Last activity</p>
              <p className="mt-2 text-sm fw-semibold text-charcoal">{formatDate(lead.lastActivityAt)}</p>
            </CardContent>
          </Card>
        </section>
      ) : (
        <Card className="rounded-2xl border-subtle bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-charcoal/70">Lead detail unavailable.</div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-subtle bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-secondary" />
            <CardTitle className="text-size-sm text-charcoal">Lead activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="inline-flex min-w-max rounded-2xl bg-white px-2 py-2 shadow-[0_18px_35px_rgba(18,24,56,0.16)] ring-1 ring-white/70">
              {visibleTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                    activeTab === tab
                      ? "bg-[#355777] text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[#355777]"
                  }`}
                >
                  {tab === "conversation"
                    ? "Conversation"
                    : tab === "notes"
                      ? "Internal Notes"
                      : "Audit History"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            {activeTab === "conversation" ? (
              <div className="space-y-2">
                {lead && isExternalCommunicationLead(lead) ? (
                  <div className="rounded-xl border border-sky-200/70 bg-sky-50/60 px-4 py-3">
                    <div className="flex items-start gap-3 text-slate-700">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700/90" aria-hidden />
                      <div className="space-y-1">
                        <p className="text-sm fw-semibold text-slate-800">External Communication</p>
                        <p className="text-sm leading-relaxed">
                          This offline lead is managed outside the platform through phone, WhatsApp, walk-ins, or referrals.
                          Conversation history is not stored in the system.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                {!(lead && isExternalCommunicationLead(lead)) ? (
                  <ul className="max-h-64 space-y-4 overflow-y-auto rounded-xl border border-subtle bg-surface p-3">
                    {messagesLoading ? (
                      <TabContentSkeleton rows={4} />
                    ) : messagesError ? (
                      <li className="text-sm text-red-600">{messagesError}</li>
                    ) : messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMine = currentUser?.id != null && msg.senderUserId === currentUser.id;
                      const senderLabel =
                        msg.senderUserId === lead?.userId
                          ? "User"
                          : msg.senderUserId === lead?.assignedAgentId
                            ? "Agent"
                            : msg.senderUserId
                              ? "Sender"
                              : "System";
                      return (
                        <li
                          key={msg.id}
                          className={cn("flex items-end gap-2", isMine && "justify-end")}
                        >
                          {!isMine ? (
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs fw-semibold text-primary">
                              {getInitials(senderLabel, "")}
                            </span>
                          ) : null}
                          <div
                            className={cn(
                              "max-w-[62%] rounded-2xl border px-4 py-3 text-sm shadow-sm",
                              isMine
                                ? "border-primary/10 bg-primary/10 text-charcoal"
                                : "border-subtle bg-white text-charcoal",
                            )}
                          >
                            <p>{msg.message}</p>
                            <p className="mt-1 text-[11px] text-charcoal/55">
                              {senderLabel} · {formatDate(msg.createdAt)}
                            </p>
                          </div>
                          {isMine ? (
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-xs fw-semibold text-secondary">
                              {getInitials("Me", null)}
                            </span>
                          ) : null}
                        </li>
                      );
                    })
                    ) : (
                      <li className="text-sm text-charcoal/60">No messages yet.</li>
                    )}
                  </ul>
                ) : null}
                {canReply && !isClosed ? (
                  <div className="flex items-end gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply"
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      onClick={onReply}
                      disabled={!replyText.trim()}
                      className="h-10 w-10 shrink-0 rounded-lg p-0 flex items-center justify-center"
                      aria-label="Send reply"
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeTab === "notes" && canViewNotes ? (
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add an internal note"
                  rows={2}
                  className="w-full rounded-lg border border-subtle px-3 py-2 text-sm"
                  disabled={!canMutateNotes}
                />
                <Button type="button" variant="outline" onClick={onSaveNote} disabled={!canMutateNotes || !noteText.trim()}>
                  {editingNoteId ? "Update note" : "Add note"}
                </Button>
                <ul className="space-y-2">
                  {notesLoading ? (
                    <TabContentSkeleton rows={3} />
                  ) : notesError ? (
                    <li className="text-sm text-red-600">{notesError}</li>
                  ) : notes.length > 0 ? (
                    notes.map((n) => (
                      <li key={n.id} className="rounded border border-subtle p-2 text-sm">
                        <p>{n.note}</p>
                        {canMutateNotes && canEditOwnNotes && n.authorUserId === currentUser?.id ? (
                          <div className="mt-2 flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingNoteId(n.id);
                                setNoteText(n.note);
                              }}
                            >
                              Edit
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => onDeleteNote(n.id)}>
                              Delete
                            </Button>
                          </div>
                        ) : null}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-charcoal/60">
                      No internal notes yet. Add follow-up notes, customer updates, or meeting summaries here.
                    </li>
                  )}
                </ul>
              </div>
            ) : null}

            {activeTab === "history" && canViewHistory ? (
                <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-subtle bg-white">
                {historyLoading ? (
                  <li className="p-3"><TabContentSkeleton rows={4} /></li>
                ) : historyError ? (
                  <li className="p-3 text-sm text-red-600">{historyError}</li>
                ) : history.length > 0 ? (
                  history.map((item) => (
                    <li key={item.id} className="relative flex items-center gap-3 p-3 text-sm">
                      <span className="absolute left-[30px] top-0 h-full w-px bg-slate-100" aria-hidden />
                      <span className={cn("relative z-[1] inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full", historyDotClass(item))}>
                        {historyIcon(item)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                          <p className="fw-medium text-charcoal">{historyPrimaryText(item)}</p>
                          {(() => {
                            const from = historyFromStatus(item);
                            const to = historyToStatus(item);
                            if (from == null || to == null || isReassignmentEvent(item)) return null;
                            return (
                              <span className="inline-flex items-center gap-1 text-xs">
                                <span className="rounded-full border border-subtle bg-surface px-2 py-0.5 text-charcoal/80">{statusLabel(from)}</span>
                                <span className="text-charcoal/50">→</span>
                                <span className="rounded-full border border-subtle bg-surface px-2 py-0.5 text-charcoal/80">{statusLabel(to)}</span>
                              </span>
                            );
                          })()}
                        </div>
                        <p className="mt-1 text-xs text-charcoal/65">by {item.actorRole?.trim() || "system"}</p>
                        {item.reason?.trim() ? (
                          <p className="mt-1 text-xs text-charcoal/70">
                            {isReassignmentEvent(item) ? item.reason.trim() : `Reason: ${item.reason.trim()}`}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-xs text-charcoal/60">{formatDate(historyChangedAt(item))}</p>
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-sm text-charcoal/60">No history available.</li>
                )}
              </ul>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <DialogRoot open={isReassignModalOpen} onClose={() => setIsReassignModalOpen(false)}>
        <div className="space-y-3">
          <h2 className="text-size-lg fw-semibold text-charcoal">Reassign Agent</h2>
          <p className="text-size-sm text-charcoal/70">Current: {assignedAgentLabel}</p>
          {adminAgentsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : (
            <Select
              value={adminReassignAgentId}
              onChange={(event) => setAdminReassignAgentId(event.target.value)}
              options={reassignableAgents}
              placeholder="Select an agent"
            />
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onAdminReassignLead}
              disabled={!adminReassignAgentId || adminReassignAgentId === lead?.assignedAgentId}
            >
              Reassign
            </Button>
          </div>
        </div>
      </DialogRoot>

      {toast ? <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}


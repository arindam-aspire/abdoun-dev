"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
  adminCloseDecision,
  createAdminLead,
  getAdminLeads,
  getAgentLeads,
  getMyLeads,
  reassignAdminLead,
} from "@/features/leads/api/leadApiService";
import { CreateManualLeadModal } from "@/features/leads/components/CreateManualLeadModal";
import { Dropdown } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/Pagination";
import { DialogRoot } from "@/components/ui/dialog";
import { ActionsMenu, Button, IconButton, Input, Select, Skeleton, Toast } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { AGENT_STATUS, normalizeAgentStatus } from "@/constants/agentStatus";
import { fetchAdminAgents } from "@/features/admin/adminAgentsSlice";
import { ArrowDownUp, Eye, MoreVertical, X } from "lucide-react";
import type {
  AdminManualLeadCreatePayload,
  Lead,
  LeadSource,
  LeadStatus,
} from "@/types/lead";

type Mode = "agent" | "admin" | "user";

const STATUS_OPTIONS: Array<LeadStatus | "all"> = [
  "all",
  "NEW",
  "IN_PROGRESS",
  "REQUEST_FOR_CLOSE",
  "CLOSED",
];
const PERIOD_OPTIONS = ["all", "weekly", "monthly", "yearly"] as const;
type PeriodFilterValue = (typeof PERIOD_OPTIONS)[number];

function statusLabel(status: LeadStatus | "all"): string {
  if (status === "all") return "All status";
  return status.replaceAll("_", " ");
}

function leadStatusClass(status: LeadStatus): string {
  if (status === "NEW") return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "IN_PROGRESS") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "REQUEST_FOR_CLOSE") return "bg-violet-100 text-violet-800 border-violet-200";
  if (status === "CLOSED") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  return "bg-charcoal/10 text-charcoal/80 border-subtle";
}

function sourceLabel(source: LeadSource | "all"): string {
  if (source === "all") return "All";
  if (source === "AGENT_MANUAL") return "Agent Manual";
  return source
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isExternalCommunicationLead(lead: Lead): boolean {
  return String(lead.communicationMode ?? "").toUpperCase() === "EXTERNAL";
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

/** Primary visible lead reference; UUID kept for API only. */
function leadDisplayRef(lead: Pick<Lead, "id" | "leadNumber">): string {
  const num = lead.leadNumber?.trim();
  if (num) return num;
  if (lead.id.length >= 8) return `LD-${lead.id.slice(0, 8)}`;
  return "-";
}

function propertyDisplayLabel(lead: Lead): string {
  const title = lead.property?.title?.trim();
  if (title) return title;
  const externalName = lead.externalPropertyName?.trim();
  if (externalName) return externalName;
  const hash = lead.property?.propertyHash;
  if (hash != null && !Number.isNaN(Number(hash))) return `Property ${hash}`;
  const legacy = lead.propertyId;
  if (legacy && legacy.length >= 8) return `Property ${legacy.slice(0, 8)}`;
  return "External Property";
}

/** Property detail route expects numeric `propertyHash`, not UUID. */
function propertyDetailHref(locale: string, lead: Lead): string | null {
  const hash = lead.property?.propertyHash;
  if (hash == null || Number.isNaN(Number(hash))) return null;
  return `/${locale}/property-details/${hash}`;
}

function agentDisplayLabel(lead: Lead): string {
  const fullName = lead.assignedAgent?.fullName?.trim();
  if (fullName) return fullName;
  const name = lead.assignedAgent?.name?.trim();
  if (name) return name;
  const email = lead.assignedAgent?.email?.trim();
  if (email) return email;
  if (lead.assignedAgentId && lead.assignedAgentId.length >= 8) return lead.assignedAgentId.slice(0, 8);
  return "Unassigned";
}

function userDisplayLabel(lead: Lead): string {
  const name = lead.user?.fullName?.trim();
  if (name) return name;
  const email = lead.user?.email?.trim();
  if (email) return email;
  const extName = lead.externalOwner?.name?.trim();
  if (extName) return extName;
  const extEmail = lead.externalOwner?.email?.trim();
  if (extEmail) return extEmail;
  const extPhone = lead.externalOwner?.phone?.trim();
  if (extPhone) return extPhone;
  return "External Owner";
}

function userHoverText(lead: Lead): string {
  const name = lead.user?.fullName?.trim() || lead.externalOwner?.name?.trim() || "-";
  const email = lead.user?.email?.trim() || lead.externalOwner?.email?.trim() || "-";
  const phone = lead.user?.phone?.trim() || lead.externalOwner?.phone?.trim() || "-";
  const lines = [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`];
  return lines.join("\n");
}

function agentHoverText(lead: Lead): string {
  const lines = [`Name: ${lead.assignedAgent?.fullName?.trim() || lead.assignedAgent?.name?.trim() || "-"}`];
  const email = lead.assignedAgent?.email?.trim();
  const phone = lead.assignedAgent?.phone?.trim();
  if (email) lines.push(`Email: ${email}`);
  if (phone) lines.push(`Phone: ${phone}`);
  return lines.join("\n");
}

function leadDetailHref(locale: string, mode: Mode, leadId: string): string {
  if (mode === "admin") return `/${locale}/leads/${leadId}`;
  if (mode === "agent") return `/${locale}/agent-dashboard/leads/${leadId}`;
  return `/${locale}/my-inquiries/${leadId}`;
}

function isStatus(status: LeadStatus, expected: LeadStatus): boolean {
  return status === expected;
}

const TABLE_SKELETON_ROWS = 6;
const LEAD_STATUS_CARDS: Array<{ key: LeadStatus | "all"; label: string }> = [
  { key: "all", label: "Total leads" },
  { key: "NEW", label: "New leads" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "REQUEST_FOR_CLOSE", label: "Request for close" },
  { key: "CLOSED", label: "Closed leads" },
];

function LeadTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: TABLE_SKELETON_ROWS }, (_, i) => (
        <tr key={i} className="border-b border-subtle/70 last:border-b-0">
          <td className="px-4 py-3"><Skeleton className="h-4 w-36 max-w-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-40 max-w-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-32 max-w-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-28 max-w-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-20 max-w-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-24 max-w-full rounded-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-28 max-w-full" /></td>
          <td className="px-4 py-3 text-right"><Skeleton className="ml-auto h-8 w-16 max-w-full rounded-md" /></td>
        </tr>
      ))}
    </tbody>
  );
}

function LeadStatusCardsSkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-5" aria-busy>
      {Array.from({ length: 5 }, (_, i) => (
        <Card key={i} className="rounded-xl border-subtle">
          <CardContent>
            <Skeleton className="h-3.5 w-24 max-w-full" />
            <Skeleton className="mt-2 h-9 w-16 max-w-full" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function LeadManagementPage({ mode }: { mode: Mode }) {
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as LeadStatus | null) ?? null;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? "10") || 10);

  const [list, setList] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCounts, setSummaryCounts] = useState<Record<LeadStatus | "all", number>>({
    all: 0,
    NEW: 0,
    IN_PROGRESS: 0,
    REQUEST_FOR_CLOSE: 0,
    CLOSED: 0,
  });
  const [query, setQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>("all");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [adminCreateOpen, setAdminCreateOpen] = useState(false);
  const [manualLeadModalOpen, setManualLeadModalOpen] = useState(false);
  const [closeTargetLead, setCloseTargetLead] = useState<Lead | null>(null);
  const [reassignTargetLead, setReassignTargetLead] = useState<Lead | null>(null);
  const [reassignAgentId, setReassignAgentId] = useState("");
  const [sortBy, setSortBy] = useState<"lead" | "property" | "user" | "agent" | "source" | "status" | "lastActivity">(
    "lastActivity",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [adminCreate, setAdminCreate] = useState<AdminManualLeadCreatePayload>({
    propertyId: "",
    assignedAgentId: "",
    source: "PHONE",
    message: "",
    contactUserId: null,
  });
  const { currentItems: adminAgents, loading: adminAgentsLoading } = useAppSelector((state) => state.adminAgents);
  const summaryFetchRef = useRef<{ key: string | null; inFlight: Promise<void> | null; lastFetchedAt: number }>({
    key: null,
    inFlight: null,
    lastFetchedAt: 0,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const showAgentManualLeadButton =
    mode === "agent" && !/\/agent-dashboard\/inquiries(\/|$)/.test(pathname ?? "");

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (!v || v === "all") params.delete(k);
        else params.set(k, v);
      });
      if (updates.status !== undefined) params.delete("page");
      const q = params.toString();
      router.push(q ? `${pathname}?${q}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const listFn = mode === "admin" ? getAdminLeads : mode === "agent" ? getAgentLeads : getMyLeads;
      const res = await listFn({
        page,
        pageSize,
        ...(status ? { status } : {}),
      });
      setList(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to load leads.") });
    } finally {
      setLoading(false);
    }
  }, [mode, page, pageSize, status]);

  const loadSummary = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const key = `summary:${mode}`;
      const now = Date.now();
      // Avoid duplicate bursts from StrictMode / fast refresh re-runs.
      if (!force) {
        const cached = summaryFetchRef.current;
        const isSameKey = cached.key === key;
        const isFresh = now - cached.lastFetchedAt < 10_000;
        if (isSameKey && cached.inFlight) {
          await cached.inFlight;
          return;
        }
        if (isSameKey && isFresh) {
          return;
        }
      }

      const run = (async () => {
        setSummaryLoading(true);
        try {
          const listFn = mode === "admin" ? getAdminLeads : mode === "agent" ? getAgentLeads : getMyLeads;
          const [allRes, newRes, inProgressRes, requestForCloseRes, closedRes] = await Promise.all([
            listFn({ page: 1, pageSize: 1 }),
            listFn({ page: 1, pageSize: 1, status: "NEW" }),
            listFn({ page: 1, pageSize: 1, status: "IN_PROGRESS" }),
            listFn({ page: 1, pageSize: 1, status: "REQUEST_FOR_CLOSE" }),
            listFn({ page: 1, pageSize: 1, status: "CLOSED" }),
          ]);
          setSummaryCounts({
            all: allRes.total ?? 0,
            NEW: newRes.total ?? 0,
            IN_PROGRESS: inProgressRes.total ?? 0,
            REQUEST_FOR_CLOSE: requestForCloseRes.total ?? 0,
            CLOSED: closedRes.total ?? 0,
          });
          summaryFetchRef.current = { key, inFlight: null, lastFetchedAt: Date.now() };
        } finally {
          setSummaryLoading(false);
        }
      })();

      summaryFetchRef.current = { key, inFlight: run, lastFetchedAt: summaryFetchRef.current.lastFetchedAt };
      await run;
      if (summaryFetchRef.current.inFlight === run) {
        summaryFetchRef.current.inFlight = null;
      }
    },
    [mode],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (mode === "user") return;
    void loadSummary();
  }, [loadSummary, mode]);

  const onAdminCreateLead = async () => {
    try {
      await createAdminLead(adminCreate);
      setAdminCreateOpen(false);
      setAdminCreate({
        propertyId: "",
        assignedAgentId: "",
        source: "PHONE",
        message: "",
        contactUserId: null,
      });
      await load();
      setToast({ kind: "success", message: "Lead created successfully." });
      await loadSummary({ force: true });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to create lead.") });
    }
  };

  const openLead = (leadId: string) => {
    router.push(leadDetailHref(locale, mode, leadId));
  };

  const onOpenReassign = async (lead: Lead) => {
    setReassignTargetLead(lead);
    setReassignAgentId("");
    await dispatch(fetchAdminAgents({ page: 1, pageSize: 100, force: true }));
  };

  const onConfirmReassign = async () => {
    if (!reassignTargetLead || !reassignAgentId.trim()) return;
    try {
      await reassignAdminLead(reassignTargetLead.id, { assignedAgentId: reassignAgentId.trim() });
      setReassignTargetLead(null);
      setReassignAgentId("");
      // Reassign doesn't change status buckets; avoid unnecessary 5 summary requests.
      await load();
      setToast({ kind: "success", message: "Lead reassigned successfully." });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to reassign lead.") });
    }
  };

  const onConfirmCloseLead = async () => {
    if (!closeTargetLead) return;
    try {
      await adminCloseDecision(closeTargetLead.id, { status: "CLOSED" });
      setCloseTargetLead(null);
      await Promise.all([load(), loadSummary({ force: true })]);
      setToast({ kind: "success", message: "Lead closed successfully." });
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error, "Failed to close lead.") });
    }
  };

  const currentStatus = status ?? "all";
  const normalizedQuery = query.trim().toLowerCase();
  const filteredList = useMemo(() => {
    const now = Date.now();
    return list.filter((lead) => {
      if (periodFilter !== "all") {
        const rawDate = lead.lastActivityAt ?? lead.createdAt ?? null;
        const ts = rawDate ? new Date(rawDate).getTime() : NaN;
        if (!Number.isFinite(ts)) return false;
        const ageDays = (now - ts) / (1000 * 60 * 60 * 24);
        const within =
          periodFilter === "weekly" ? ageDays <= 7 :
          periodFilter === "monthly" ? ageDays <= 30 :
          ageDays <= 365;
        if (!within) return false;
      }
      if (!normalizedQuery) return true;
      const searchBlob = [
        leadDisplayRef(lead),
        propertyDisplayLabel(lead),
        userDisplayLabel(lead),
        lead.externalOwner?.name,
        lead.externalOwner?.email,
        lead.externalOwner?.phone,
        lead.externalPropertyName,
        agentDisplayLabel(lead),
        sourceLabel(lead.source),
        statusLabel(lead.status),
        formatDate(lead.lastActivityAt),
      ]
        .join(" ")
        .toLowerCase();
      return searchBlob.includes(normalizedQuery);
    });
  }, [list, normalizedQuery, periodFilter]);
  const sortedList = useMemo(() => {
    const rows = [...filteredList];
    const factor = sortDirection === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const left =
        sortBy === "lead"
          ? leadDisplayRef(a).toLowerCase()
          : sortBy === "property"
            ? propertyDisplayLabel(a).toLowerCase()
            : sortBy === "agent"
              ? agentDisplayLabel(a).toLowerCase()
              : sortBy === "user"
                ? userDisplayLabel(a).toLowerCase()
              : sortBy === "source"
                ? sourceLabel(a.source).toLowerCase()
                : sortBy === "status"
                  ? statusLabel(a.status).toLowerCase()
                  : new Date(a.lastActivityAt ?? 0).getTime();
      const right =
        sortBy === "lead"
          ? leadDisplayRef(b).toLowerCase()
          : sortBy === "property"
            ? propertyDisplayLabel(b).toLowerCase()
            : sortBy === "agent"
              ? agentDisplayLabel(b).toLowerCase()
              : sortBy === "user"
                ? userDisplayLabel(b).toLowerCase()
              : sortBy === "source"
                ? sourceLabel(b.source).toLowerCase()
                : sortBy === "status"
                  ? statusLabel(b.status).toLowerCase()
                  : new Date(b.lastActivityAt ?? 0).getTime();
      if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
      return String(left).localeCompare(String(right)) * factor;
    });
    return rows;
  }, [filteredList, sortBy, sortDirection]);

  const onSort = (nextSortBy: typeof sortBy) => {
    if (sortBy === nextSortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(nextSortBy);
    setSortDirection("asc");
  };

  const reassignableAgents = useMemo(() => {
    return adminAgents
      .filter((agent) => typeof agent.id === "string" && agent.id.trim().length > 0)
      .filter((agent) => normalizeAgentStatus(agent.status) === AGENT_STATUS.ACTIVE)
      .map((agent) => {
        const id = agent.id ?? "";
        return {
          value: id,
          label: agent.fullName?.trim() || agent.email?.trim() || (id.length >= 8 ? id.slice(0, 8) : id),
        };
      });
  }, [adminAgents]);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 px-1 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            {mode === "admin" ? "Admin Leads" : mode === "agent" ? "Agent Leads" : "My Inquiries"}
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">
            {mode === "user"
              ? "Track your inquiries and continue conversations."
              : "Review leads, update status, and manage follow-ups."}
          </p>
        </div>
        {mode === "admin" || showAgentManualLeadButton ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            {showAgentManualLeadButton ? (
              <Button type="button" variant="primary" onClick={() => setManualLeadModalOpen(true)}>
                Add New Lead
              </Button>
            ) : null}
            {mode === "admin" ? (
              <Button type="button" variant="primary" onClick={() => setAdminCreateOpen(true)}>
                Create Manual Lead
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {mode !== "user" ? (
        loading || summaryLoading ? (
          <LeadStatusCardsSkeleton />
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {LEAD_STATUS_CARDS.map((card) => {
              const isActive = currentStatus === card.key;
              const count = summaryCounts[card.key];
              const valueClassName =
                card.key === "NEW"
                  ? "text-blue-700"
                  : card.key === "IN_PROGRESS"
                    ? "text-amber-700"
                    : card.key === "REQUEST_FOR_CLOSE"
                      ? "text-violet-700"
                      : card.key === "CLOSED"
                        ? "text-emerald-700"
                        : "text-charcoal";
              return (
                <Card
                  key={card.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => updateQuery({ status: card.key === "all" ? null : card.key })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      updateQuery({ status: card.key === "all" ? null : card.key });
                    }
                  }}
                  className={cn(
                    "rounded-xl border-subtle transition",
                    "cursor-pointer hover:border-primary/35 hover:bg-primary/5",
                    isActive && "border-primary/50 bg-primary/5",
                  )}
                >
                  <CardContent>
                    <p className="text-size-xs text-charcoal/70">{card.label}</p>
                    <p className={cn("mt-2 text-size-2xl fw-semibold", valueClassName)}>{count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )
      ) : null}

      <Card className="rounded-xl border-subtle">
        <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-secondary" />
            <CardTitle className="text-size-sm text-charcoal">
              {mode === "user" ? "My inquiry list" : "Lead list"}
            </CardTitle>
          </div>
          <div className="flex w-full justify-end md:w-auto">
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-64 lg:w-80">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search leads..."
                  className="h-10 w-full rounded-lg"
                  rightAdornment={
                    query.trim() ? (
                      <button
                        type="button"
                        aria-label="Clear search"
                        className="text-charcoal/55 hover:text-charcoal"
                        onClick={() => setQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : undefined
                  }
                />
              </div>
              <Dropdown
                buttonId="lead-status"
                label="All status"
                value={status ?? "all"}
                buttonClassName="h-10 rounded-lg border-subtle px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                options={STATUS_OPTIONS.map((s) => ({ value: s, label: statusLabel(s) }))}
                onChange={(v) => updateQuery({ status: v === "all" ? null : v })}
              />
              <Dropdown
                buttonId="lead-period"
                label="All"
                value={periodFilter}
                buttonClassName="h-10 rounded-lg border-subtle px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                options={PERIOD_OPTIONS.map((p) => ({
                  value: p,
                  label:
                    p === "all"
                      ? "All"
                      : p === "weekly"
                        ? "Weekly"
                        : p === "monthly"
                          ? "Monthly"
                          : "Yearly",
                }))}
                onChange={(v) => setPeriodFilter(v as PeriodFilterValue)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
              <thead>
                <tr className="border-b border-subtle bg-surface text-xs text-charcoal/65">
                  <th className="px-4 py-3 font-medium">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort("lead")}>
                      Lead <ArrowDownUp className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium min-w-[10rem]">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort("property")}>
                      Property <ArrowDownUp className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium min-w-[10rem]">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort("user")}>
                      User <ArrowDownUp className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium min-w-[10rem]">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort("agent")}>
                      Agent <ArrowDownUp className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort("source")}>
                      Source <ArrowDownUp className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort("status")}>
                      Status <ArrowDownUp className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort("lastActivity")}>
                      Last activity <ArrowDownUp className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              {loading ? (
                <LeadTableSkeleton />
              ) : (
                <tbody>
                {sortedList.length > 0 ? sortedList.map((lead) => (
                  <tr key={lead.id} className="border-b border-subtle/70 text-sm last:border-b-0">
                    <td className="px-4 py-3 max-w-[11rem] align-top">
                      <button
                        type="button"
                        onClick={() => openLead(lead.id)}
                        className="block w-full truncate text-left font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                        title={leadDisplayRef(lead)}
                      >
                        {leadDisplayRef(lead)}
                      </button>
                    </td>
                    <td className="px-4 py-3 max-w-[14rem] align-top">
                      {(() => {
                        const label = propertyDisplayLabel(lead);
                        const href = propertyDetailHref(locale, lead);
                        if (href) {
                          return (
                            <Link
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-primary hover:underline"
                              title={label}
                            >
                              {label}
                            </Link>
                          );
                        }
                        return (
                          <span className="block truncate text-charcoal/80" title={label}>
                            {label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 max-w-[14rem] align-top">
                      <span className="block truncate text-charcoal/80" title={userHoverText(lead)}>
                        {userDisplayLabel(lead)}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[14rem] align-top">
                      <span className="block truncate text-charcoal/80" title={agentHoverText(lead)}>
                        {agentDisplayLabel(lead)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="whitespace-nowrap">{sourceLabel(lead.source)}</span>
                        {isExternalCommunicationLead(lead) ? (
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                            External
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap align-top">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${leadStatusClass(
                          lead.status,
                        )}`}
                      >
                        {statusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(lead.lastActivityAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <ActionsMenu
                          align="right"
                          trigger={
                            <IconButton aria-label="Row actions" variant="ghost" size="sm">
                              <MoreVertical />
                            </IconButton>
                          }
                          items={[
                            {
                              key: "view",
                              label: (
                                <span className="inline-flex items-center gap-2">
                                  <Eye className="h-4 w-4 opacity-70" />
                                  View
                                </span>
                              ),
                              className: "text-charcoal",
                              hoverClassName: "bg-primary/5",
                              onSelect: () => openLead(lead.id),
                            },
                            ...(mode === "admin"
                              ? [
                                  ...(isStatus(lead.status, "CLOSED")
                                    ? []
                                    : [
                                        {
                                          key: "reassign",
                                          label: "Reassign Agent",
                                          className: "text-charcoal",
                                          hoverClassName: "bg-primary/5",
                                          onSelect: () => void onOpenReassign(lead),
                                        },
                                      ]),
                                  ...(isStatus(lead.status, "REQUEST_FOR_CLOSE")
                                    ? [
                                        {
                                          key: "close-lead",
                                          label: "Close Lead",
                                          destructive: true,
                                          onSelect: () => setCloseTargetLead(lead),
                                        },
                                      ]
                                    : []),
                                ]
                              : []),
                            ...(mode === "agent"
                              ? [
                                  ...(isStatus(lead.status, "NEW")
                                    ? [
                                        {
                                          key: "mark-in-progress",
                                          label: "Mark In Progress",
                                          className: "text-charcoal",
                                          hoverClassName: "bg-primary/5",
                                          onSelect: () => openLead(lead.id),
                                        },
                                      ]
                                    : []),
                                  ...(isStatus(lead.status, "IN_PROGRESS")
                                    ? [
                                        {
                                          key: "request-close",
                                          label: "Request Close",
                                          className: "text-charcoal",
                                          hoverClassName: "bg-primary/5",
                                          onSelect: () => openLead(lead.id),
                                        },
                                      ]
                                    : []),
                                  ...(isStatus(lead.status, "REQUEST_FOR_CLOSE")
                                    ? [
                                        {
                                          key: "waiting-for-admin",
                                          label: "Waiting for Admin",
                                          disabled: true,
                                          onSelect: () => {},
                                        },
                                      ]
                                    : []),
                                  ...(isStatus(lead.status, "CLOSED")
                                    ? [
                                        {
                                          key: "closed",
                                          label: "Closed",
                                          disabled: true,
                                          onSelect: () => {},
                                        },
                                      ]
                                    : []),
                                ]
                              : []),
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-charcoal/60">
                      {normalizedQuery
                        ? "No leads found for this search on the current page."
                        : "No leads found for the selected filters."}
                    </td>
                  </tr>
                )}
              </tbody>
              )}
            </table>
          </div>
        <div className="border-t border-subtle px-4 py-4">
          <Pagination
            currentPage={Math.min(page, totalPages)}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            basePath={pathname}
            pageParam="page"
            translations={{
              previous: "Previous",
              next: "Next",
              page: "Page",
              of: "of",
              showing: "Showing",
              to: "to",
              results: "results",
            }}
          />
        </div>
        </CardContent>
      </Card>

      <DialogRoot open={adminCreateOpen} onClose={() => setAdminCreateOpen(false)}>
        <div className="space-y-2">
          <h2 className="text-size-lg fw-semibold">Create manual lead</h2>
          <input
            placeholder="propertyId"
            title="Property ID"
            value={adminCreate.propertyId}
            onChange={(e) => setAdminCreate((prev) => ({ ...prev, propertyId: e.target.value }))}
            className="h-10 w-full rounded-lg border border-subtle px-3 text-sm"
          />
          <input
            placeholder="assignedAgentId"
            title="Assigned agent ID"
            value={adminCreate.assignedAgentId}
            onChange={(e) => setAdminCreate((prev) => ({ ...prev, assignedAgentId: e.target.value }))}
            className="h-10 w-full rounded-lg border border-subtle px-3 text-sm"
          />
          <Dropdown
            buttonId="admin-manual-source"
            label="Source"
            value={adminCreate.source}
            options={["PHONE", "WHATSAPP", "MANUAL_ADMIN"].map((s) => ({ value: s, label: s }))}
            onChange={(v) =>
              setAdminCreate((prev) => ({
                ...prev,
                source: v as AdminManualLeadCreatePayload["source"],
              }))
            }
          />
          <textarea
            placeholder="message"
            value={adminCreate.message}
            onChange={(e) => setAdminCreate((prev) => ({ ...prev, message: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-subtle px-3 py-2 text-sm"
          />
          <input
            placeholder="contactUserId (optional)"
            title="Contact user ID"
            value={adminCreate.contactUserId ?? ""}
            onChange={(e) =>
              setAdminCreate((prev) => ({
                ...prev,
                contactUserId: e.target.value.trim() ? e.target.value.trim() : null,
              }))
            }
            className="h-10 w-full rounded-lg border border-subtle px-3 text-sm"
          />
          <Button type="button" variant="accent" onClick={onAdminCreateLead}>
            Create
          </Button>
        </div>
      </DialogRoot>

      <DialogRoot open={reassignTargetLead != null} onClose={() => setReassignTargetLead(null)}>
        <div className="space-y-3">
          <h2 className="text-size-lg fw-semibold text-charcoal">Reassign Agent</h2>
          {reassignTargetLead ? (
            <p className="text-size-sm text-charcoal/70">Lead: {leadDisplayRef(reassignTargetLead)}</p>
          ) : null}
          {adminAgentsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : (
            <Select
              value={reassignAgentId}
              onChange={(event) => setReassignAgentId(event.target.value)}
              options={reassignableAgents}
              placeholder="Select an agent"
            />
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setReassignTargetLead(null)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={onConfirmReassign} disabled={!reassignAgentId}>
              Reassign
            </Button>
          </div>
        </div>
      </DialogRoot>

      <CreateManualLeadModal
        open={manualLeadModalOpen}
        onClose={() => setManualLeadModalOpen(false)}
        onSuccess={async () => {
          await load();
        }}
        onError={(message) => setToast({ kind: "error", message })}
        onSuccessToast={(message) => setToast({ kind: "success", message })}
      />

      <DialogRoot open={closeTargetLead != null} onClose={() => setCloseTargetLead(null)}>
        <div className="space-y-3">
          <h2 className="text-size-lg fw-semibold text-charcoal">Close lead?</h2>
          {closeTargetLead ? (
            <p className="text-size-sm text-charcoal/70">
              Are you sure you want to close {leadDisplayRef(closeTargetLead)}?
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCloseTargetLead(null)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={onConfirmCloseLead}>
              Yes, Close
            </Button>
          </div>
        </div>
      </DialogRoot>

      {toast ? <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}

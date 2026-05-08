"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Building2,
  CheckCircle2,
  Eye,
  Info,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  XCircle,
} from "lucide-react";
import { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import {
  ActionsMenu,
  Button,
  CustomTable,
  Dropdown,
  IconButton,
  Input,
  Label,
  sortRowsByConfig,
  type CustomTableColumn,
  type SortConfig,
} from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogDescription, DialogFooter, DialogRoot, DialogTitle } from "@/components/ui/dialog";
import {
  DEFAULT_PAGINATION_PAGE_SIZE,
  PAGINATION_PAGE_SIZES,
} from "@/components/ui/Pagination";
import { AgentListingsPageSkeleton } from "@/features/agent/dashboard/components/AgentListingsPageSkeleton";
import { fetchAgentProperties } from "@/features/agent/dashboard/api/agentProperties.api";
import { mapAgentPropertyItemToAgentListing } from "@/features/agent/dashboard/lib/mapAgentPropertyListItem";
import {
  listAdminPropertySubmissions,
  reviewAdminPropertySubmission,
  assignPropertyToAgent,
} from "@/features/admin/dashboard/api/adminPropertySubmissions.api";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { deletePropertySubmission } from "@/features/agent/dashboard/api/propertySubmissions.api";
import { listAdminAgents, type AdminAgent } from "@/features/admin/api/adminAgentApiService";

type ManageListingRow = {
  id: string;
  submittedBy: string;
  propertyTitle: string;
  propertyReference: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  viewHref: string;
  submissionId?: string | null;
  propertyId?: string | null;
  hasAssignedAgent?: boolean;
  isFromApi?: boolean;
  reviewReason?: string | null;
};

interface ManageListingComponentProps {
  userType: "user" | "agent" | "admin";
  subtitle: string;
  note?: string;
  addPropertyHref: string;
}

const PAGE_PARAM = "page";
const PAGE_SIZE_PARAM = "pageSize";
const PERIOD_FILTERS = ["all", "weekly", "monthly", "yearly"] as const;
type PeriodFilter = (typeof PERIOD_FILTERS)[number];

function isWithinDays(iso: string | null, days: number): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function statusClass(status: string): string {
  const s = status.trim().toLowerCase();
  if (
    s === "submitted" ||
    s === "pending_approval" ||
    s === "pending_admin_approval" ||
    s === "pending admin approval"
  ) {
    return "bg-sky-100 text-sky-800 border-sky-200";
  }
  if (s === "approved" || s === "verified") return "bg-violet-100 text-violet-800 border-violet-200";
  if (s === "rejected") return "bg-rose-100 text-rose-800 border-rose-200";
  return "bg-charcoal/10 text-charcoal/80 border-subtle";
}

function humanizeStatus(status: string): string {
  return status
    .trim()
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function getDisplayStatusLabel(
  status: string,
  t: (key: string) => string,
  opts?: { adminView?: boolean },
): string {
  const s = status.trim().toLowerCase();
  if (s === "submitted") {
    return opts?.adminView ? "Submitted" : t("statusPendingApproval");
  }
  if (s === "pending_approval" || s === "pending_admin_approval") {
    return t("statusPendingApproval");
  }
  if (s === "approved" || s === "verified") return t("statusApproved");
  if (s === "rejected") return t("statusRejected");
  if (s === "changes_requested") return t("statusChangesRequested");
  if (s === "in_progress") return t("statusInProgress");
  if (s === "draft") return t("statusDraft");
  return humanizeStatus(status);
}

export function ManageListingComponent({ userType, subtitle, note, addPropertyHref }: ManageListingComponentProps) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("agentDashboard");
  const tSearch = useTranslations("searchResult");
  const isAdmin = pathname.includes("/admin");
  const isRtl = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { id: "submittedAt", direction: "desc" },
  ]);
  const [rows, setRows] = useState<ManageListingRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actingRowId, setActingRowId] = useState<string | null>(null);
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    rowId: string | null;
    propertyId: string | null;
    submissionId: string | null;
  }>({ open: false, rowId: null, propertyId: null, submissionId: null });

  const pageSize = useMemo(() => {
    const raw = searchParams.get(PAGE_SIZE_PARAM);
    const n = Number.parseInt(raw ?? String(DEFAULT_PAGINATION_PAGE_SIZE), 10);
    return PAGINATION_PAGE_SIZES.includes(n as (typeof PAGINATION_PAGE_SIZES)[number])
      ? n
      : DEFAULT_PAGINATION_PAGE_SIZE;
  }, [searchParams]);
  const currentPage = useMemo(() => {
    const raw = searchParams.get(PAGE_PARAM);
    const n = Number.parseInt(raw ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const resetToFirstPage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PAGE_PARAM);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const res = await listAdminPropertySubmissions({
          page: currentPage,
          pageSize,
          status:
            statusFilter === "all"
              ? ""
              : (statusFilter as
                  | ""
                  | "draft"
                  | "in_progress"
                  | "submitted"
                  | "changes_requested"
                  | "approved"
                  | "rejected"),
        });
        setRows(
          (res.items ?? []).map((row) => ({
            id: row.submission_id,
            submittedBy: row.submitted_by_name?.trim() || "—",
            propertyTitle: row.property_title?.trim() || "—",
            propertyReference: row.property_reference_number?.trim() || "—",
            status: row.submission_status ?? row.status ?? "—",
            submittedAt: row.submitted_at ?? null,
            reviewedAt: row.reviewed_at ?? null,
            viewHref: `/${locale}/admin-dashboard/listings/${encodeURIComponent(row.submission_id)}`,
            submissionId: row.submission_id,
            propertyId: row.property_id,
            hasAssignedAgent: Boolean(row.agent_user_id ?? row.assigned_agent_id),
            isFromApi: true,
            reviewReason: row.review_reason ?? null,
          })),
        );
        setTotalItems(res.pagination.total);
        setTotalPages(Math.max(1, res.pagination.totalPages));
      } else {
        const res = await fetchAgentProperties({
          page: currentPage,
          pageSize,
          search: query.trim() ? query.trim() : undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        const mapped = res.items.map(mapAgentPropertyItemToAgentListing);
        setRows(
          mapped.map((row) => ({
            id: row.id,
            submittedBy: "—",
            propertyTitle: row.title,
            propertyReference: row.id,
            status: row.submissionWorkflowLabel ?? row.submissionStatus ?? row.status,
            submittedAt: row.lastUpdated,
            reviewedAt: row.reviewedAt ?? null,
            viewHref: `/${locale}/property-details/${row.id}`,
            submissionId: row.submissionId ?? null,
            isFromApi: Boolean(row.isFromApi),
            reviewReason: row.reviewReason ?? null,
          })),
        );
        setTotalItems(res.pagination.total);
        setTotalPages(Math.max(1, res.pagination.totalPages));
      }
    } catch (e) {
      setRows([]);
      setTotalItems(0);
      setTotalPages(1);
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [currentPage, isAdmin, locale, pageSize, query, statusFilter]);

  const ensureAgentsLoaded = useCallback(async () => {
    if (agents.length > 0) return agents;
    setAgentsLoading(true);
    try {
      const res = await listAdminAgents({ page: 1, pageSize: 100 });
      const next = res.items ?? [];
      setAgents(next);
      return next;
    } finally {
      setAgentsLoading(false);
    }
  }, [agents]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (q) {
        const haystack = [
          row.submittedBy,
          row.propertyTitle,
          row.propertyReference,
          row.status,
          getDisplayStatusLabel(row.status, t, { adminView: isAdmin }),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (periodFilter === "weekly") return isWithinDays(row.submittedAt, 7);
      if (periodFilter === "monthly") return isWithinDays(row.submittedAt, 30);
      if (periodFilter === "yearly") return isWithinDays(row.submittedAt, 365);
      return true;
    });
  }, [isAdmin, periodFilter, query, rows, t]);

  const sortedRows = useMemo(
    () =>
      sortRowsByConfig(filteredRows, sortConfig, (row, colId) => {
        if (colId === "submittedBy") return row.submittedBy;
        if (colId === "propertyTitle") return row.propertyTitle;
        if (colId === "propertyReference") return row.propertyReference;
        if (colId === "status") return row.status;
        if (colId === "submittedAt") return row.submittedAt ?? "";
        if (colId === "reviewedAt") return row.reviewedAt ?? "";
        return "";
      }),
    [filteredRows, sortConfig],
  );

  const columns: CustomTableColumn<ManageListingRow>[] = [
    {
      id: "submittedBy",
      header: "Submitted by",
      sortable: true,
      getSortValue: (row) => row.submittedBy,
      render: (row) => <span className="font-medium text-charcoal">{row.submittedBy}</span>,
    },
    {
      id: "propertyTitle",
      header: "Property",
      sortable: true,
      getSortValue: (row) => row.propertyTitle,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-charcoal">{row.propertyTitle}</p>
          <p className="mt-0.5 truncate font-mono text-xs text-charcoal/60">{row.propertyReference}</p>
        </div>
      ),
    },
    {
      id: "propertyReference",
      header: "Reference",
      sortable: true,
      getSortValue: (row) => row.propertyReference,
      render: (row) => <span className="font-mono text-xs text-charcoal/80">{row.propertyReference}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      getSortValue: (row) => row.status,
      render: (row) => (
        <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium capitalize ${statusClass(row.status)}`}>
          {getDisplayStatusLabel(row.status, t, { adminView: isAdmin })}
        </span>
      ),
    },
    {
      id: "submittedAt",
      header: "Submitted",
      sortable: true,
      getSortValue: (row) => row.submittedAt ?? "",
      render: (row) => <span className="text-charcoal/70">{formatDateTime(row.submittedAt)}</span>,
    },
    {
      id: "reviewedAt",
      header: "Reviewed",
      sortable: true,
      getSortValue: (row) => row.reviewedAt ?? "",
      render: (row) => <span className="text-charcoal/70">{formatDateTime(row.reviewedAt)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => {
        const normalizedStatus = row.status.trim().toLowerCase().replace(/\s+/g, "_");
        const busy = actingRowId === row.id;
        const canModerate = normalizedStatus === "submitted";
        const canApprove = isAdmin && canModerate && Boolean(row.hasAssignedAgent) && Boolean(row.submissionId);
        const canReject = isAdmin && canModerate && Boolean(row.submissionId);
        const canContinue =
          isAdmin &&
          (normalizedStatus === "draft" || normalizedStatus === "in_progress") &&
          Boolean(row.submissionId);
        const canAssign =
          isAdmin &&
          Boolean(row.propertyId) &&
          (normalizedStatus === "submitted" ||
            normalizedStatus === "approved" ||
            normalizedStatus === "verified") &&
          !row.hasAssignedAgent;
        const canReassign =
          isAdmin &&
          Boolean(row.propertyId) &&
          Boolean(row.hasAssignedAgent);
        const canUnassign = canReassign;
        const canEdit = !isAdmin && Boolean(row.submissionId);
        const canDelete = !isAdmin && Boolean(row.submissionId);
        const canViewRejectedReason =
          !isAdmin &&
          normalizedStatus === "rejected" &&
          Boolean(row.reviewReason?.trim());
        const items = [
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
            disabled: busy,
            onSelect: () => window.open(row.viewHref, "_blank", "noopener,noreferrer"),
          },
          ...(canApprove
            ? [
                {
                  key: "approve",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 opacity-70" />
                      Approve
                    </span>
                  ),
                  className: "text-emerald-700",
                  hoverClassName: "bg-emerald-50",
                  disabled: busy,
                  onSelect: async () => {
                    setActingRowId(row.id);
                    try {
                      await reviewAdminPropertySubmission(row.submissionId!, { action: "approve" });
                      await load();
                    } finally {
                      setActingRowId(null);
                    }
                  },
                },
              ]
            : []),
          ...(canReject
            ? [
                {
                  key: "reject",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <XCircle className="h-4 w-4 opacity-70" />
                      Reject
                    </span>
                  ),
                  destructive: true,
                  disabled: busy,
                  onSelect: async () => {
                    setActingRowId(row.id);
                    try {
                      await reviewAdminPropertySubmission(row.submissionId!, {
                        action: "reject",
                        reason: "Rejected by admin",
                      });
                      await load();
                    } finally {
                      setActingRowId(null);
                    }
                  },
                },
              ]
            : []),
          ...(canContinue
            ? [
                {
                  key: "continue-draft",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <Pencil className="h-4 w-4 opacity-70" />
                      Continue
                    </span>
                  ),
                  className: "text-charcoal",
                  hoverClassName: "bg-primary/5",
                  disabled: busy,
                  onSelect: () =>
                    router.push(
                      `/${locale}/admin-dashboard/add-property?submission=${encodeURIComponent(row.submissionId!)}`,
                    ),
                },
              ]
            : []),
          ...(canAssign || canReassign
            ? [
                {
                  key: canReassign ? "reassign-agent" : "assign-agent",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <UserPlus className="h-4 w-4 opacity-70" />
                      {canReassign ? "Reassign Agent" : "Assign Agent"}
                    </span>
                  ),
                  className: "text-charcoal",
                  hoverClassName: "bg-primary/5",
                  disabled: busy,
                  onSelect: async () => {
                    if (!row.propertyId) return;
                    setSelectedAgentId(null);
                    setAgentSearch("");
                    setAssignDialog({
                      open: true,
                      rowId: row.id,
                      propertyId: row.propertyId ?? null,
                      submissionId: row.submissionId ?? null,
                    });
                    await ensureAgentsLoaded();
                  },
                },
              ]
            : []),
          ...(canUnassign
            ? [
                {
                  key: "unassign-agent",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <UserMinus className="h-4 w-4 opacity-70" />
                      Unassign
                    </span>
                  ),
                  className: "text-charcoal",
                  hoverClassName: "bg-primary/5",
                  disabled: busy,
                  onSelect: async () => {
                    if (!row.propertyId) return;
                    setActingRowId(row.id);
                    try {
                      await assignPropertyToAgent(row.propertyId, null);
                      await load();
                    } finally {
                      setActingRowId(null);
                    }
                  },
                },
              ]
            : []),
          ...(canEdit
            ? [
                {
                  key: "edit",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <Pencil className="h-4 w-4 opacity-70" />
                      Edit
                    </span>
                  ),
                  className: "text-charcoal",
                  hoverClassName: "bg-primary/5",
                  disabled: busy,
                  onSelect: () => {
                    const base = pathname.includes("/my-listings")
                      ? `/${locale}/my-listings/add-property`
                      : `/${locale}/agent-dashboard/add-property`;
                    router.push(`${base}?submission=${encodeURIComponent(row.submissionId!)}`);
                  },
                },
              ]
            : []),
          ...(canDelete
            ? [
                {
                  key: "delete",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4 opacity-70" />
                      Delete
                    </span>
                  ),
                  destructive: true,
                  disabled: busy,
                  onSelect: async () => {
                    if (!confirm("Delete this property?")) return;
                    setActingRowId(row.id);
                    try {
                      await deletePropertySubmission(row.submissionId!);
                      await load();
                    } finally {
                      setActingRowId(null);
                    }
                  },
                },
              ]
            : []),
          ...(canViewRejectedReason
            ? [
                {
                  key: "view-rejected-reason",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <Info className="h-4 w-4 opacity-70" />
                      View rejected reason
                    </span>
                  ),
                  className: "text-charcoal",
                  hoverClassName: "bg-primary/5",
                  disabled: busy,
                  onSelect: () => {
                    alert(row.reviewReason?.trim() || "No reason provided.");
                  },
                },
              ]
            : []),
        ];
        const sortedItems = [...items].sort((a, b) => a.key.localeCompare(b.key));
        return (
          <ActionsMenu
            align="right"
            trigger={
              <IconButton aria-label="Row actions" variant="ghost" size="sm" className="ml-auto">
                <MoreVertical />
              </IconButton>
            }
            items={sortedItems}
          />
        );
      },
    },
  ];

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "submitted", label: "Submitted" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];
  const periodOptions = [
    { value: "all", label: "All" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  if (loading) {
    return <AgentListingsPageSkeleton />;
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-6">
       <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            Manage Listings
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">{subtitle}</p>
          {note ? (
            <p className="mt-2 max-w-2xl text-size-xs text-charcoal/55">
              {note}
            </p>
          ) : null}
        </div>
        <Link
          href={addPropertyHref}
          className="inline-flex items-center justify-center rounded-md fw-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 gap-2 bg-secondary text-white hover:brightness-95 focus-visible:ring-secondary h-10 px-4 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      <Card className="rounded-xl border-subtle">
        <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-secondary" />
            <CardTitle className="text-size-sm text-charcoal">Property list</CardTitle>
          </div>
          <div className="flex w-full justify-end md:w-auto">
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-64 lg:w-80">
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    resetToFirstPage();
                  }}
                  placeholder="Search by submitter, property, reference"
                  className="h-10 w-full rounded-lg"
                />
              </div>
              <Dropdown
                buttonId="manage-listings-status-filter"
                label="All"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(String(value ?? "all"));
                  resetToFirstPage();
                }}
                align="right"
                menuClassName="w-44"
                buttonClassName="h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                options={statusOptions}
              />
              <Dropdown
                buttonId="manage-listings-period-filter"
                label="All"
                value={periodFilter}
                onChange={(value) => {
                  setPeriodFilter((value as PeriodFilter) ?? "all");
                  resetToFirstPage();
                }}
                align="right"
                menuClassName="w-44"
                buttonClassName="h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                options={periodOptions}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable
            columns={columns}
            data={sortedRows}
            getRowId={(row) => row.id}
            sortConfig={sortConfig}
            onSort={setSortConfig}
            multiSortWithShift
            loading={loading}
            skeleton={
              <tbody>
                {Array.from({ length: 6 }, (_, i) => (
                  <tr key={i} className="border-b border-subtle/70 last:border-b-0">
                    <td className="px-4 py-3" colSpan={7}>
                      <div className="h-5 w-full animate-pulse rounded bg-charcoal/10" />
                    </td>
                  </tr>
                ))}
              </tbody>
            }
            error={error}
            errorTitle="Unable to load listings"
            errorDescription={null}
            emptyMessage="No listings found."
            minTableWidth="1100px"
            pagination={{
              showWhen: !loading && !error && totalItems > 0,
              currentPage: Math.min(currentPage, totalPages),
              totalPages,
              totalItems,
              pageSize,
              pageParam: PAGE_PARAM,
              pageSizeParam: PAGE_SIZE_PARAM,
              translations: {
                previous: tSearch("paginationPrevious"),
                next: tSearch("paginationNext"),
                page: tSearch("paginationPage"),
                of: tSearch("paginationOf"),
                showing: tSearch("paginationShowing"),
                to: tSearch("paginationTo"),
                results: tSearch("paginationResults"),
              },
            }}
          />
        </CardContent>
      </Card>

      <DialogRoot
        open={assignDialog.open}
        onClose={() => {
          if (actingRowId) return;
          setAssignDialog({ open: false, rowId: null, propertyId: null, submissionId: null });
        }}
        className="relative max-w-lg"
      >
        <DialogTitle>Assign Agent</DialogTitle>
        <DialogDescription className="text-pretty text-sm text-charcoal/75">
          Choose an agent to assign to this property. You can also reassign when already assigned.
        </DialogDescription>

        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="assign-agent-search" className="text-xs font-medium text-charcoal/80">
              Search
            </Label>
            <Input
              id="assign-agent-search"
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              placeholder="Search by name or email"
              disabled={agentsLoading || actingRowId != null}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-charcoal/80">Select agent</Label>
            <div className="max-h-56 overflow-auto rounded-lg border border-subtle bg-white">
              {agentsLoading ? (
                <div className="p-3 text-sm text-charcoal/60">Loading agents...</div>
              ) : agents.length === 0 ? (
                <div className="p-3 text-sm text-charcoal/60">No agents found.</div>
              ) : (
                <ul className="divide-y divide-subtle">
                  {agents
                    .filter((a) => {
                      const q = agentSearch.trim().toLowerCase();
                      if (!q) return true;
                      const name = a.fullName?.toLowerCase() ?? "";
                      const email = a.email?.toLowerCase() ?? "";
                      return name.includes(q) || email.includes(q);
                    })
                    .slice(0, 100)
                    .map((a) => {
                      const id = a.id ?? "";
                      const selected = Boolean(id) && selectedAgentId === id;
                      return (
                        <li key={id || a.email}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!id) return;
                              setSelectedAgentId(id);
                            }}
                            className={[
                              "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm",
                              selected ? "bg-primary/5" : "hover:bg-surface",
                            ].join(" ")}
                            disabled={!id || actingRowId != null}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-charcoal">
                                {a.fullName?.trim() || "Agent"}
                              </span>
                              <span className="block truncate text-xs text-charcoal/60">
                                {a.email?.trim() || "-"}
                              </span>
                            </span>
                            {selected ? (
                              <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                                Selected
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex-row flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAssignDialog({ open: false, rowId: null, propertyId: null, submissionId: null })}
            disabled={actingRowId != null}
            className="min-w-0 flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            className="min-w-0 flex-1 bg-[#294a66] text-white hover:bg-[#203d56]"
            onClick={async () => {
              if (!assignDialog.propertyId || !selectedAgentId) return;
              setActingRowId(assignDialog.rowId ?? assignDialog.submissionId ?? assignDialog.propertyId);
              try {
                await assignPropertyToAgent(assignDialog.propertyId, selectedAgentId);
                setAssignDialog({ open: false, rowId: null, propertyId: null, submissionId: null });
                await load();
              } finally {
                setActingRowId(null);
              }
            }}
            disabled={actingRowId != null || !assignDialog.propertyId || !selectedAgentId}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogRoot>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import {
  ActionsMenu,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CustomTable,
  IconButton,
  Input,
  Label,
  Skeleton,
  Toast,
  sortRowsByConfig,
  type CustomTableColumn,
  type SortConfig,
} from "@/components/ui";
import {
  DEFAULT_PAGINATION_PAGE_SIZE,
  PAGINATION_PAGE_SIZES,
} from "@/components/ui/Pagination";
import type { PaginationMeta } from "@/lib/api/pagination";
import { DialogRoot, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Dropdown } from "@/components/ui/dropdown";
import {
  Building2,
  CheckCircle2,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  X,
  XCircle,
} from "lucide-react";
import {
  assignPropertyToAgent,
  deleteAdminPropertySubmission,
  fetchAdminPropertyDrafts,
  listAdminPropertySubmissions,
  reviewAdminPropertySubmission,
  type AdminDraftSubmissionItem,
  type AdminSubmissionListItem,
} from "@/features/admin/dashboard/api/adminPropertySubmissions.api";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { listAdminAgents, type AdminAgent } from "@/features/admin/api/adminAgentApiService";
import { useAppDispatch } from "@/hooks/storeHooks";
import { initializeNewPropertyWizard } from "@/features/agent/dashboard/components/add-property/addPropertyWizardSlice";
import { fetchAdminManageListingsSidebarTotal } from "@/features/agent/dashboard/agentDashboardSummarySlice";

type StatusFilter =
  | ""
  | "submitted"
  | "changes_requested"
  | "approved"
  | "rejected";

const PERIOD_FILTERS = ["all", "weekly", "monthly", "yearly"] as const;
type PeriodFilter = (typeof PERIOD_FILTERS)[number];
const PAGE_PARAM = "page";
const PAGE_SIZE_PARAM = "pageSize";
const FETCH_LIMIT = 200;
const ADMIN_SUBMIT_SUCCESS_MESSAGE = "Property created and verified successfully.";
const APPROVE_SUCCESS_MESSAGE = "Property approved successfully.";
const REJECT_SUCCESS_MESSAGE = "Property rejected successfully.";
const REQUEST_CHANGES_SUCCESS_MESSAGE = "Changes requested successfully.";
const ASSIGN_SUCCESS_MESSAGE = "Agent assigned successfully.";
const UNASSIGN_SUCCESS_MESSAGE = "Agent unassigned successfully.";
const DELETE_SUCCESS_MESSAGE = "Property deleted successfully.";

const TABLE_SKELETON_ROWS = 6;

function AdminSubmissionsTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: TABLE_SKELETON_ROWS }, (_, i) => (
        <tr key={i} className="border-b border-subtle/70 last:border-b-0">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-48 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-6 w-24 rounded-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-24 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-14 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-32 max-w-full" />
          </td>
          <td className="px-4 py-3 text-right">
            <Skeleton className="ml-auto h-8 w-20 rounded-lg" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

function fmtDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function isWithinDays(iso: string, days: number): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function prettyStatus(status: string): string {
  return status.replace(/_/g, " ");
}

function statusPillClass(status: string): string {
  const s = status.trim().toLowerCase();
  if (s === "submitted") return "bg-sky-100 text-sky-800 border-sky-200";
  if (s === "changes_requested") return "bg-amber-100 text-amber-800 border-amber-200";
  if (s === "approved" || s === "verified") return "bg-violet-100 text-violet-800 border-violet-200";
  if (s === "rejected") return "bg-rose-100 text-rose-800 border-rose-200";
 
  return "bg-charcoal/10 text-charcoal/80 border-subtle";
}

function getSubmissionStatus(row: AdminSubmissionListItem): string {
  return (row.submission_status ?? row.status ?? "").trim().toLowerCase();
}

function isDeletedRow(row: AdminSubmissionListItem): boolean {
  return Boolean(row.deleted_at);
}

function canShowReviewActions(row: AdminSubmissionListItem): boolean {
  return getSubmissionStatus(row) === "submitted" && !isDeletedRow(row);
}

function canShowAssignAgent(row: AdminSubmissionListItem): boolean {
  const status = getSubmissionStatus(row);
  const agentId = row.agent_user_id ?? row.assigned_agent_id;
  return (
    Boolean(row.property_id) &&
    !isDeletedRow(row) &&
    (status === "approved" || status === "verified") &&
    !agentId
  );
}

function canShowUnassignAgent(row: AdminSubmissionListItem): boolean {
  const agentId = row.agent_user_id ?? row.assigned_agent_id;
  return Boolean(row.property_id) && !isDeletedRow(row) && Boolean(agentId);
}

function canShowAdminDelete(row: AdminSubmissionListItem, includeDeleted: boolean): boolean {
  const status = getSubmissionStatus(row);
  if (includeDeleted && isDeletedRow(row)) return false;
  // Keep pending/submitted moderation rows protected: hide Delete for submitted rows by default.
  if (status === "submitted") return false;
  return !isDeletedRow(row);
}

function canShowContinueDraft(row: AdminSubmissionListItem): boolean {
  const status = getSubmissionStatus(row);
  return !isDeletedRow(row) && (status === "draft" || status === "in_progress");
}

export function AdminPropertySubmissionsPage() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<AdminSubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<AdminDraftSubmissionItem[]>([]);
  const [draftsTotal, setDraftsTotal] = useState(0);
  const [listPagination, setListPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: DEFAULT_PAGINATION_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { id: "submitted_at", direction: "desc" },
  ]);
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    action: "reject" | "changes_requested";
    submissionId: string | null;
  }>({ open: false, action: "reject", submissionId: null });
  const [reasonText, setReasonText] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; submissionId: string | null }>(
    { open: false, submissionId: null },
  );
  const [deleteReason, setDeleteReason] = useState("");
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    submissionId: string | null;
    propertyId: string | null;
  }>({ open: false, submissionId: null, propertyId: null });
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [agentSearch, setAgentSearch] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const pageSize = useMemo(() => {
    const raw = searchParams.get(PAGE_SIZE_PARAM);
    const n = Number.parseInt(raw ?? String(DEFAULT_PAGINATION_PAGE_SIZE), 10);
    return PAGINATION_PAGE_SIZES.includes(
      n as (typeof PAGINATION_PAGE_SIZES)[number],
    )
      ? n
      : DEFAULT_PAGINATION_PAGE_SIZE;
  }, [searchParams]);

  const currentPage = useMemo(() => {
    const raw = searchParams.get(PAGE_PARAM);
    const n = Number.parseInt(raw ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  useLayoutEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const legacyQ = params.get("q");
    const legacyStatus = params.get("status");
    const legacyPeriod = params.get("period");
    if (legacyQ) setQuery(legacyQ);
    if (
      legacyStatus === "" ||
      legacyStatus === "submitted" ||
      legacyStatus === "changes_requested" ||
      legacyStatus === "approved" ||
      legacyStatus === "rejected"
    ) {
      setStatusFilter(legacyStatus as StatusFilter);
    }
    if (legacyPeriod && PERIOD_FILTERS.includes(legacyPeriod as PeriodFilter)) {
      setPeriodFilter(legacyPeriod as PeriodFilter);
    }
    if (!params.has("q") && !params.has("status") && !params.has("period")) {
      return;
    }
    params.delete("q");
    params.delete("status");
    params.delete("period");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate legacy params once on mount
  }, []);

  const resetToFirstPageIfNeeded = useCallback(() => {
    if (currentPage <= 1) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PAGE_PARAM);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [currentPage, pathname, router, searchParams]);

  const loadDrafts = useCallback(async () => {
    try {
      const res = await fetchAdminPropertyDrafts({ page: 1, pageSize: 20 });
      setDrafts(res.items ?? []);
      setDraftsTotal(res.pagination.total);
    } catch {
      // Keep page usable even if drafts endpoint fails.
      setDrafts([]);
      setDraftsTotal(0);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadDrafts();
      const res = await listAdminPropertySubmissions({
        page: currentPage,
        pageSize,
        status: statusFilter,
      });
      setItems(res.items);
      setListPagination(res.pagination);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setItems([]);
      setListPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [currentPage, loadDrafts, pageSize, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("created") !== "1") return;
    setToast({ kind: "success", message: ADMIN_SUBMIT_SUCCESS_MESSAGE });
    const next = new URLSearchParams(searchParams.toString());
    next.delete("created");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((row) => {
      if (periodFilter !== "all") {
        const days = periodFilter === "weekly" ? 7 : periodFilter === "monthly" ? 30 : 365;
        const candidate = row.submitted_at ?? row.reviewed_at ?? "";
        if (!candidate || !isWithinDays(candidate, days)) {
          return false;
        }
      }

      if (!normalizedQuery) return true;

      const haystack = [
        row.submitted_by_name,
        row.submitted_by,
        row.property_title,
        row.property_reference_number,
        row.property_id,
        row.submission_id,
        row.submission_status,
        row.status,
        row.submission_workflow_label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [items, periodFilter, query]);

  const sortedRows = useMemo(() => {
    return sortRowsByConfig(filteredRows, sortConfig, (row, colId) => {
      if (colId === "submission_id") return row.submission_id;
      if (colId === "status") return getSubmissionStatus(row);
      if (colId === "property") {
        return `${row.property_title ?? ""} ${row.property_reference_number ?? ""} ${row.property_id ?? ""}`.trim();
      }
      if (colId === "current_step") return row.current_step;
      if (colId === "submitted_at") return row.submitted_at ?? "";
      if (colId === "reviewed_at") return row.reviewed_at ?? "";
      if (colId === "submitted_by") return row.submitted_by_name ?? row.submitted_by;
      return "";
    });
  }, [filteredRows, sortConfig]);

  const totalItems = listPagination.total;
  const totalPages = Math.max(1, listPagination.totalPages);
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => sortedRows, [sortedRows]);

  useEffect(() => {
    if (loading || error) return;
    if (currentPage > totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(PAGE_PARAM);
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    }
  }, [currentPage, error, loading, pathname, router, searchParams, totalPages]);

  const statusOptions = [
    { value: "", label: "All" },
    { value: "submitted", label: "Submitted" },
    { value: "changes_requested", label: "Changes requested" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ] as const;

  const periodOptions = PERIOD_FILTERS.map((period) => ({
    value: period,
    label:
      period === "all"
        ? "All"
        : period === "weekly"
          ? "Weekly"
          : period === "monthly"
            ? "Monthly"
            : "Yearly",
  }));

  const onSearchChange = (value: string) => {
    setQuery(value);
    resetToFirstPageIfNeeded();
  };

  const onStatusChange = (value: string) => {
    const next =
      value === "submitted" ||
      value === "changes_requested" ||
      value === "approved" ||
      value === "rejected"
        ? value
        : "";
    setStatusFilter(next);
    resetToFirstPageIfNeeded();
  };

  const onPeriodChange = (value: string) => {
    const next = PERIOD_FILTERS.includes(value as PeriodFilter)
      ? (value as PeriodFilter)
      : "all";
    setPeriodFilter(next);
    resetToFirstPageIfNeeded();
  };

  const emptyListMessage = useMemo(() => {
    if (query.trim()) {
      return "No listings match your search. Try a different property, submitter, or reference.";
    }
    if (statusFilter) {
      return "No listings with this status. Clear the status filter to see everything.";
    }
    if (periodFilter !== "all") {
      return "No listings in this time range. Try another period.";
    }
    return "No submissions.";
  }, [periodFilter, query, statusFilter]);

  const columns = useMemo((): CustomTableColumn<AdminSubmissionListItem>[] => {
    return [
      {
        id: "submitted_by",
        header: "Submitted by",
        sortable: true,
        getSortValue: (row) => row.submitted_by_name ?? row.submitted_by,
        render: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-charcoal">
              {row.submitted_by_name?.trim() || "—"}
            </p>
          </div>
        ),
      },
      {
        id: "property_title",
        header: "Property",
        sortable: true,
        getSortValue: (row) =>
          `${row.property_title ?? ""} ${row.property_reference_number ?? ""}`.trim(),
        render: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-charcoal">{row.property_title?.trim() || "—"}</p>
            <p className="mt-0.5 truncate font-mono text-xs text-charcoal/60">
              {row.property_reference_number?.trim() ? row.property_reference_number.trim() : "—"}
            </p>
          </div>
        ),
      },
      {
        id: "property_reference_number",
        header: "Reference",
        sortable: true,
        getSortValue: (row) => row.property_reference_number ?? "",
        render: (row) => (
          <span className="font-mono text-xs text-charcoal/80">
            {row.property_reference_number?.trim() || "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        sortable: true,
        getSortValue: (row) => row.status,
        render: (row) => (
          <span
            className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium capitalize ${statusPillClass(
              row.status,
            )}`}
          >
            {prettyStatus(row.status)}
          </span>
        ),
      },
      {
        id: "submitted_at",
        header: "Submitted",
        sortable: true,
        getSortValue: (row) => row.submitted_at ?? "",
        render: (row) => <span className="text-charcoal/70">{fmtDateTime(row.submitted_at)}</span>,
      },
      {
        id: "reviewed_at",
        header: "Reviewed",
        sortable: true,
        getSortValue: (row) => row.reviewed_at ?? "",
        render: (row) => <span className="text-charcoal/70">{fmtDateTime(row.reviewed_at)}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-right",
        className: "text-right",
        render: (row) => {
          const deleted = isDeletedRow(row);
          const canModerate = canShowReviewActions(row);
          const busy = actingId === row.submission_id;
          const viewHref = `/${locale}/admin-dashboard/listings/${encodeURIComponent(row.submission_id)}`;
          const canAssign = canShowAssignAgent(row);
          const canUnassign = canShowUnassignAgent(row);
          const canDelete = canShowAdminDelete(row, false);
          const canContinue = canShowContinueDraft(row);

          const menuItems = [
            ...(!deleted && canModerate
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
                      setActingId(row.submission_id);
                      try {
                        await reviewAdminPropertySubmission(row.submission_id, { action: "approve" });
                        setToast({ kind: "success", message: APPROVE_SUCCESS_MESSAGE });
                        await load();
                      } catch (e) {
                        setToast({ kind: "error", message: getApiErrorMessage(e) });
                      } finally {
                        setActingId(null);
                      }
                      },
                    },
                  {
                    key: "request-changes",
                    label: (
                      <span className="inline-flex items-center gap-2">
                        <Pencil className="h-4 w-4 opacity-70" />
                        Request Changes
                      </span>
                    ),
                    className: "text-amber-700",
                    hoverClassName: "bg-amber-50",
                    disabled: busy,
                    onSelect: () => {
                      setReasonText("");
                      setReasonDialog({
                        open: true,
                        action: "changes_requested",
                        submissionId: row.submission_id,
                      });
                    },
                  },
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
                    onSelect: () => {
                      setReasonText("");
                      setReasonDialog({
                        open: true,
                        action: "reject",
                        submissionId: row.submission_id,
                      });
                    },
                  },
                ]
              : []),
            ...(!deleted && canContinue
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
                    onSelect: () => {
                      const a = document.createElement("a");
                      a.href = `/${locale}/admin-dashboard/add-property?submission=${encodeURIComponent(row.submission_id)}`;
                      a.click();
                    },
                  },
                ]
              : []),
            ...(!deleted && canAssign
              ? [
                  {
                    key: "assign-agent",
                    label: (
                      <span className="inline-flex items-center gap-2">
                        <UserPlus className="h-4 w-4 opacity-70" />
                        Assign Agent
                      </span>
                    ),
                    className: "text-charcoal",
                    hoverClassName: "bg-primary/5",
                    disabled: busy,
                    onSelect: async () => {
                      setSelectedAgentId(null);
                      setAgentSearch("");
                      setAssignDialog({
                        open: true,
                        submissionId: row.submission_id,
                        propertyId: row.property_id ?? null,
                      });
                      if (agents.length === 0) {
                        setAgentsLoading(true);
                        try {
                          const res = await listAdminAgents({ page: 1, pageSize: 100 });
                          setAgents(res.items ?? []);
                        } catch (e) {
                          setToast({ kind: "error", message: getApiErrorMessage(e) });
                        } finally {
                          setAgentsLoading(false);
                        }
                      }
                    },
                  },
                ]
              : []),
            ...(!deleted && canUnassign && row.property_id
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
                      setActingId(row.submission_id);
                      try {
                        await assignPropertyToAgent(row.property_id!, null);
                        setToast({ kind: "success", message: UNASSIGN_SUCCESS_MESSAGE });
                        await load();
                      } catch (e) {
                        setToast({ kind: "error", message: getApiErrorMessage(e) });
                      } finally {
                        setActingId(null);
                      }
                    },
                  },
                ]
              : []),
            ...(!deleted && canDelete
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
                    onSelect: () => {
                      setDeleteReason("");
                      setDeleteDialog({ open: true, submissionId: row.submission_id });
                    },
                  },
                ]
              : []),
            ...(!deleted
              ? [
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
                    onSelect: () => {
                      const a = document.createElement("a");
                      a.href = viewHref;
                      a.click();
                    },
                  },
                ]
              : []),
          ];

          if (menuItems.length === 0) return null;

          return (
            <ActionsMenu
              align="right"
              trigger={
                <IconButton
                  aria-label="Row actions"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                >
                  <MoreVertical />
                </IconButton>
              }
              items={menuItems}
            />
          );
        },
      },
    ];
  }, [actingId, agents.length, locale, load]);

  return (
    <div className="space-y-6">
      {toast ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            Manage Listings
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">
            Review agent-submitted property drafts, request changes, or approve them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin-dashboard/add-property`}
            onClick={() => dispatch(initializeNewPropertyWizard())}
            className="inline-flex items-center justify-center rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
          >
            Add Property
          </Link>
        </div>
      </div>

      {!error && drafts.length > 0 ? (
        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 md:p-5">
          <h2 className="text-size-sm fw-semibold text-charcoal">
            Your draft listings ({draftsTotal || drafts.length})
          </h2>
          <p className="mt-1 text-size-sm text-charcoal/70">
            These submissions are not published yet. Continue editing from the last saved step.
          </p>
          <ul className="mt-3 space-y-2">
            {drafts.map((d) => (
              <li
                key={d.submission_id}
                className="flex flex-col gap-2 rounded-xl border border-subtle bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-charcoal">{d.title?.trim() || "Untitled draft"}</p>
                  <p className="text-size-xs text-charcoal/60">
                    {d.status} · Step {d.current_step ?? "—"}{" "}
                    {d.updated_at ? `· ${fmtDateTime(d.updated_at)}` : null}
                  </p>
                </div>
                <Link
                  href={`/${locale}/admin-dashboard/add-property?submission=${encodeURIComponent(d.submission_id)}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary bg-primary px-3 py-1.5 text-size-sm font-medium text-white hover:bg-primary/90"
                >
                  Continue
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Card className="rounded-xl border-subtle">
        <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-secondary" />
            <CardTitle className="text-size-sm text-charcoal">
              Property list
            </CardTitle>
          </div>
          <div className="flex w-full justify-end md:w-auto">
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-64 lg:w-80">
                <Input
                  value={query}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search by submitter, property, reference"
                  className="h-10 w-full rounded-lg"
                  rightAdornment={
                    query.trim() ? (
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Clear search"
                        className="text-charcoal/55 hover:bg-charcoal/10 hover:text-charcoal"
                        onClick={() => onSearchChange("")}
                      >
                        <X />
                      </IconButton>
                    ) : undefined
                  }
                />
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <Dropdown
                  buttonId="admin-submissions-status-filter"
                  label="All"
                  value={statusFilter}
                  onChange={(value) => onStatusChange(String(value ?? ""))}
                  align="right"
                  menuClassName="w-44"
                  buttonClassName="h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                  options={statusOptions as unknown as { value: string; label: string }[]}
                />
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <Dropdown
                  buttonId="admin-submissions-period-filter"
                  label="All"
                  value={periodFilter}
                  onChange={(value) => onPeriodChange(String(value ?? "all"))}
                  align="right"
                  menuClassName="w-44"
                  buttonClassName="h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                  options={periodOptions as unknown as { value: string; label: string }[]}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
        <CustomTable
          columns={columns}
          data={paginatedRows}
          getRowId={(row) => row.submission_id}
          sortConfig={sortConfig}
          onSort={setSortConfig}
          multiSortWithShift
          loading={loading}
          skeleton={<AdminSubmissionsTableSkeleton />}
          error={error}
          emptyMessage={emptyListMessage}
          minTableWidth="1000px"
          pagination={{
            // Show the footer whenever we have results, even if it is a single page,
            // so the "Showing X–Y of Z results" line matches the agent listings table.
            showWhen: !loading && !error && paginatedRows.length > 0,
            currentPage: safePage,
            totalPages,
            totalItems,
            pageSize,
            pageParam: PAGE_PARAM,
            pageSizeParam: PAGE_SIZE_PARAM,
            translations: {
              previous: "Previous",
              next: "Next",
              page: "Page",
              of: "of",
              showing: "Showing",
              to: "to",
              results: "results",
            },
          }}
          />
        </CardContent>
      </Card>

      <DialogRoot
        open={reasonDialog.open}
        onClose={() => {
          if (actingId) return;
          setReasonDialog({ open: false, action: "reject", submissionId: null });
        }}
        className="relative max-w-lg"
      >
        <DialogTitle>
          {reasonDialog.action === "changes_requested"
            ? "Request changes"
            : "Reject submission"}
        </DialogTitle>
        <DialogDescription className="text-pretty text-sm text-charcoal/75">
          {reasonDialog.action === "changes_requested"
            ? "Please explain what the agent needs to update before this property can be approved."
            : "Please enter a reason. This will be shown to the agent."}
        </DialogDescription>
        <div className="mt-4 space-y-2">
          <label className="text-xs font-medium text-charcoal/80" htmlFor="admin-review-reason">
            Reason
          </label>
          <Textarea
            id="admin-review-reason"
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            className="min-h-[100px] rounded-lg border border-charcoal/15"
            placeholder={
              reasonDialog.action === "changes_requested"
                ? "Explain what needs to be changed before resubmission."
                : "Explain what needs to be changed / why it is rejected."
            }
            disabled={actingId != null}
          />
        </div>
        <DialogFooter className="mt-6 flex-row flex-nowrap gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setReasonDialog({ open: false, action: "reject", submissionId: null })}
            disabled={actingId != null}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            className="bg-rose-700 text-white hover:bg-rose-800"
            disabled={!reasonText.trim() || actingId != null || !reasonDialog.submissionId}
            onClick={async () => {
              if (!reasonDialog.submissionId) return;
              const submissionId = reasonDialog.submissionId;
              const action = reasonDialog.action;
              setActingId(submissionId);
              try {
                await reviewAdminPropertySubmission(submissionId, {
                  action,
                  reason: reasonText.trim(),
                });
                setToast({
                  kind: "success",
                  message:
                    action === "changes_requested"
                      ? REQUEST_CHANGES_SUCCESS_MESSAGE
                      : REJECT_SUCCESS_MESSAGE,
                });
                setReasonDialog({ open: false, action: "reject", submissionId: null });
                setReasonText("");
                await load();
              } catch (e) {
                setToast({ kind: "error", message: getApiErrorMessage(e) });
              } finally {
                setActingId(null);
              }
            }}
          >
            {reasonDialog.action === "changes_requested" ? "Request Changes" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogRoot>

      <DialogRoot
        open={deleteDialog.open}
        onClose={() => {
          if (actingId) return;
          setDeleteDialog({ open: false, submissionId: null });
        }}
        className="relative max-w-lg"
      >
        <DialogTitle>Delete property?</DialogTitle>
        <DialogDescription className="text-pretty text-sm text-charcoal/75">
          This will soft delete the property/submission and hide it from normal listings.
        </DialogDescription>
        <div className="mt-4 space-y-2">
          <Label htmlFor="admin-delete-reason" className="text-xs font-medium text-charcoal/80">
            Reason (optional)
          </Label>
          <Textarea
            id="admin-delete-reason"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            className="min-h-[90px] rounded-lg border border-charcoal/15"
            placeholder="Optional internal note for why this was deleted."
            disabled={actingId != null}
          />
        </div>
        <DialogFooter className="mt-6 flex-row flex-nowrap gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteDialog({ open: false, submissionId: null })}
            disabled={actingId != null}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            className="bg-rose-700 text-white hover:bg-rose-800"
            disabled={actingId != null || !deleteDialog.submissionId}
            onClick={async () => {
              if (!deleteDialog.submissionId) return;
              const submissionId = deleteDialog.submissionId;
              setActingId(submissionId);
              try {
                await deleteAdminPropertySubmission(submissionId, deleteReason);
                setToast({ kind: "success", message: DELETE_SUCCESS_MESSAGE });
                void dispatch(fetchAdminManageListingsSidebarTotal({ force: true }));
                setDeleteDialog({ open: false, submissionId: null });
                setDeleteReason("");
                await load();
              } catch (e) {
                setToast({ kind: "error", message: getApiErrorMessage(e) });
              } finally {
                setActingId(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogRoot>

      <DialogRoot
        open={assignDialog.open}
        onClose={() => {
          if (actingId) return;
          setAssignDialog({ open: false, submissionId: null, propertyId: null });
        }}
        className="relative max-w-lg"
      >
        <DialogTitle>Assign Agent</DialogTitle>
        <DialogDescription className="text-pretty text-sm text-charcoal/75">
          Choose an agent to assign to this property. You can also unassign.
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
              disabled={agentsLoading || actingId != null}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-charcoal/80">Select agent</Label>
            <div className="max-h-56 overflow-auto rounded-lg border border-subtle bg-white">
              {agentsLoading ? (
                <div className="p-3 text-sm text-charcoal/60">Loading agents…</div>
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
                            disabled={!id || actingId != null}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-charcoal">
                                {a.fullName?.trim() || "Agent"}
                              </span>
                              <span className="block truncate text-xs text-charcoal/60">
                                {a.email?.trim() || "—"}
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
            onClick={() => setAssignDialog({ open: false, submissionId: null, propertyId: null })}
            disabled={actingId != null}
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
              setActingId(assignDialog.submissionId ?? assignDialog.propertyId);
              try {
                await assignPropertyToAgent(assignDialog.propertyId, selectedAgentId);
                setToast({ kind: "success", message: ASSIGN_SUCCESS_MESSAGE });
                setAssignDialog({ open: false, submissionId: null, propertyId: null });
                await load();
              } catch (e) {
                setToast({ kind: "error", message: getApiErrorMessage(e) });
              } finally {
                setActingId(null);
              }
            }}
            disabled={actingId != null || !assignDialog.propertyId || !selectedAgentId}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogRoot>
    </div>
  );
}

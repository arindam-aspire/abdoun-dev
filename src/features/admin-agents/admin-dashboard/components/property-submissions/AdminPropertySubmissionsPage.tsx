"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import {
  ActionsMenu,
  Button,
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
import { DialogRoot, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Dropdown } from "@/components/ui/dropdown";
import {
  CheckCircle2,
  Filter,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
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
} from "@/features/admin-agents/admin-dashboard/api/adminPropertySubmissions.api";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { listAdminAgents, type AdminAgent } from "@/services/adminAgentApiService";
import { useAppDispatch } from "@/hooks/storeHooks";
import { initializeNewPropertyWizard } from "@/features/admin-agents/agent-dashboard/components/add-property/addPropertyWizardSlice";
import { useSession } from "@/features/auth/hooks/useSession";

type StatusFilter =
  | ""
  | "submitted"
  | "approved"
  | "rejected";

const PERIOD_FILTERS = ["all", "weekly", "monthly", "yearly"] as const;
type PeriodFilter = (typeof PERIOD_FILTERS)[number];

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

function isAgentSubmittedProperty(row: AdminSubmissionListItem, currentUserId?: string | null): boolean {
  const role =
    row.submitted_by_role ?? row.created_by_role ?? row.source_role ?? row.submission_source;
  if (typeof role === "string" && role.trim()) {
    return role.trim().toLowerCase() === "agent";
  }
  // Fallback (backend-guided): if we know current user id, treat submissions created by someone else as agent-submitted.
  // This avoids showing Assign Agent on admin-created properties (submitted_by == current admin).
  if (currentUserId && row.submitted_by && row.submitted_by !== currentUserId) {
    return true;
  }
  // TODO(back-end): expose `submitted_by_role` or `source_role` ("agent" | "admin") in admin list response.
  return false;
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
  const { user } = useSession();
  const currentUserId = user?.id ? String(user.id) : null;
  const statusParam = (searchParams.get("status") ?? "").trim();
  const periodParam = (searchParams.get("period") ?? "").trim();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const filter: StatusFilter =
    statusParam === "" ||
    statusParam === "submitted" ||
    statusParam === "approved" ||
    statusParam === "rejected"
      ? (statusParam as StatusFilter)
      : "submitted";
  const periodFilter: PeriodFilter =
    periodParam && PERIOD_FILTERS.includes(periodParam as PeriodFilter)
      ? (periodParam as PeriodFilter)
      : "all";
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = 20;
  const [items, setItems] = useState<AdminSubmissionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<AdminDraftSubmissionItem[]>([]);
  const [draftsTotal, setDraftsTotal] = useState(0);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { id: "submitted_at", direction: "desc" },
  ]);
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    action: "reject";
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

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      });
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const loadDrafts = useCallback(async () => {
    try {
      const res = await fetchAdminPropertyDrafts({ page: 1, limit: 20 });
      setDrafts(res.items ?? []);
      setDraftsTotal(res.total ?? res.items?.length ?? 0);
    } catch (e) {
      // Keep page usable even if drafts endpoint fails.
      setDrafts([]);
      setDraftsTotal(0);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Always load drafts section (agent parity).
      await loadDrafts();
      const res = await listAdminPropertySubmissions({
        page,
        limit,
        status: filter,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filter, page, limit, loadDrafts]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => {
    return sortRowsByConfig(items, sortConfig, (row, colId) => {
      if (colId === "submission_id") return row.submission_id;
      if (colId === "status") return row.status;
      if (colId === "property") {
        return `${row.property_title ?? ""} ${row.property_reference_number ?? ""} ${row.property_id ?? ""}`.trim();
      }
      if (colId === "current_step") return row.current_step;
      if (colId === "submitted_at") return row.submitted_at ?? "";
      if (colId === "submitted_by") return row.submitted_by_name ?? row.submitted_by;
      return "";
    });
  }, [items, sortConfig]);

  const filteredByPeriod = useMemo(() => {
    if (periodFilter === "all") return sorted;
    const days = periodFilter === "weekly" ? 7 : periodFilter === "monthly" ? 30 : 365;
    return sorted.filter((row) => {
      const candidate = row.submitted_at ?? row.reviewed_at ?? "";
      if (!candidate) return false;
      return isWithinDays(candidate, days);
    });
  }, [periodFilter, sorted]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const statusOptions = [
    { value: "", label: "All" },
    { value: "submitted", label: "Submitted" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ] as const;

  const periodOptions = PERIOD_FILTERS.map((period) => ({
    value: period,
    label:
      period === "all"
        ? "All time"
        : period === "weekly"
          ? "Weekly"
          : period === "monthly"
            ? "Monthly"
            : "Yearly",
  }));

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
          const status = getSubmissionStatus(row);
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
                        setToast({ kind: "success", message: "Submission approved." });
                        await load();
                      } catch (e) {
                        setToast({ kind: "error", message: getApiErrorMessage(e) });
                      } finally {
                        setActingId(null);
                      }
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
                          const res = await listAdminAgents({ page: 1, limit: 100 });
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
                        setToast({ kind: "success", message: "Agent unassigned successfully" });
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
  }, [actingId, agents.length, dispatch, locale, load, selectedAgentId]);

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
            Review agent-submitted property drafts (approve, or reject).
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
          <Button type="button" variant="outline" className="shrink-0" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-charcoal/80">
          <Filter className="h-4 w-4" />
          Filter
        </div>
        <div className="hidden h-4 w-px bg-subtle sm:block" />
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
          <Dropdown
            buttonId="admin-submissions-status-filter"
            label="Status"
            value={filter}
            onChange={(val) => {
              const next = String(val ?? "");
              const status =
                next === "submitted" ||
                next === "approved" ||
                next === "rejected"
                  ? next
                  : "";
              updateQueryParams({ status, page: null });
            }}
            options={statusOptions as unknown as { value: string; label: string }[]}
            align="left"
          />
          <Dropdown
            buttonId="admin-submissions-period-filter"
            label="All time"
            value={periodFilter}
            onChange={(val) => {
              const next = String(val ?? "");
              const period = PERIOD_FILTERS.includes(next as PeriodFilter) ? next : "all";
              updateQueryParams({ period: period === "all" ? null : period, page: null });
            }}
            options={periodOptions as unknown as { value: string; label: string }[]}
            align="left"
          />
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

      <article className="rounded-2xl border border-subtle bg-white shadow-sm overflow-hidden">
        <CustomTable
          columns={columns}
          data={filteredByPeriod}
          getRowId={(row) => row.submission_id}
          sortConfig={sortConfig}
          onSort={setSortConfig}
          loading={loading}
          skeleton={<AdminSubmissionsTableSkeleton />}
          error={error}
          emptyMessage={<div className="py-10 text-center text-sm text-charcoal/60">No submissions.</div>}
          minTableWidth="1000px"
          pagination={{
            // Show the footer whenever we have results, even if it is a single page,
            // so the "Showing X–Y of Z results" line matches the agent listings table.
            showWhen: !loading && !error && total > 0,
            currentPage: page,
            totalPages,
            totalItems: total,
            pageSize: limit,
            basePath: `/${locale}/admin-dashboard/listings`,
            onPageChange: (nextPage) => updateQueryParams({ page: String(nextPage) }),
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
      </article>

      <DialogRoot
        open={reasonDialog.open}
        onClose={() => {
          if (actingId) return;
          setReasonDialog({ open: false, action: "reject", submissionId: null });
        }}
        className="relative max-w-lg"
      >
        <DialogTitle>
          Reject submission
        </DialogTitle>
        <DialogDescription className="text-pretty text-sm text-charcoal/75">
          Please enter a reason. This will be shown to the agent.
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
            placeholder="Explain what needs to be changed / why it is rejected."
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
              setActingId(submissionId);
              try {
                await reviewAdminPropertySubmission(submissionId, {
                  action: "reject",
                  reason: reasonText.trim(),
                });
                setToast({
                  kind: "success",
                  message: "Submission rejected.",
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
            Reject
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
                setToast({ kind: "success", message: "Property deleted successfully" });
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
                setToast({ kind: "success", message: "Agent assigned successfully" });
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

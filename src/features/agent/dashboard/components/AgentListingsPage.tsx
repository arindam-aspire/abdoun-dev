"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { isAxiosError } from "axios";
import {
  MoreVertical,
  Building2,
  Eye,
  Info,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  fetchAgentProperties,
  fetchAgentPropertyDrafts,
  type AgentDraftSubmissionItem,
} from "@/features/agent/dashboard/api/agentProperties.api";
import { deletePropertySubmission } from "@/features/agent/dashboard/api/propertySubmissions.api";
import { mapAgentPropertyItemToAgentListing } from "@/features/agent/dashboard/lib/mapAgentPropertyListItem";
import {
  canDeleteSubmission,
  canEditSubmission,
  getDisplayStatusLabel,
} from "@/features/agent/dashboard/lib/agentSubmissionListHelpers";
import {
  deleteListing,
  publishDraft,
  updateListing,
} from "@/features/agent/api/mocks/agentDashboardMockService";
import type { AgentListing, ListingStatus } from "@/types/agent";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { useAppDispatch } from "@/hooks/storeHooks";
import { useTranslations } from "@/hooks/useTranslations";
import { initializeNewPropertyWizard } from "@/features/agent/dashboard/components/add-property/addPropertyWizardSlice";
import { DialogRoot, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  ActionsMenu,
  Button,
  IconButton,
  Input,
  Label,
  LoadingButton,
  Skeleton,
  type CustomTableColumn,
  type SortConfig,
} from "@/components/ui";
import {
  DEFAULT_PAGINATION_PAGE_SIZE,
  PAGINATION_PAGE_SIZES,
} from "@/components/ui/Pagination";
import type { PaginationMeta } from "@/lib/api/pagination";
import { Toast } from "@/components/ui/toast";
import { AgentListingsPageSkeleton } from "@/features/agent/dashboard/components/AgentListingsPageSkeleton";
import { DataTable } from "@/components/common/DataTable";

function statusClass(status: string): string {
  if (status === "active") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "pending_approval") return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "approved") return "bg-violet-100 text-violet-800 border-violet-200";
  if (status === "rejected") return "bg-rose-100 text-rose-800 border-rose-200";
  return "bg-charcoal/10 text-charcoal/80 border-subtle";
}

function statusLabel(status: string, t: (k: string) => string): string {
  if (status === "pending_admin_approval") return t("statusPendingApproval");
  if (status === "pending_approval") return t("statusPendingApproval");
  if (status === "approved") return t("statusApproved");
  if (status === "rejected") return t("statusRejected");
  return status;
}

/** Badge colors when `property_listing_submissions.status` is set on the row. */
function statusClassForListing(listing: AgentListing): string {
  const sub = listing.submissionStatus?.toLowerCase();
  if (sub) {
    if (
      sub === "submitted" ||
      sub === "pending_admin_approval" ||
      sub === "changes_requested" ||
      sub === "in_progress"
    ) {
      return "bg-sky-100 text-sky-800 border-sky-200";
    }
    if (sub === "draft") {
      return "bg-slate-100 text-slate-700 border-slate-200";
    }
    if (sub === "approved" || sub === "verified") {
      return "bg-violet-100 text-violet-800 border-violet-200";
    }
    if (sub === "rejected") {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
  }
  return statusClass(listing.status);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("en-JO", { style: "decimal" }).format(n) + " JOD";
}

function capitalizeType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}

function formatTypeWithSubType(type: string, subType?: string | null): string {
  const typeLabel = capitalizeType(type);
  if (subType?.trim()) return `${typeLabel}, ${subType.trim()}`;
  return typeLabel;
}

const PAGE_PARAM = "page";
const PAGE_SIZE_PARAM = "pageSize";

type AgentListingStatusFilter =
  | "all"
  | "approved"
  | "pending_admin_approval"
  | "rejected";

const LISTING_STATUS_FILTERS: readonly AgentListingStatusFilter[] = [
  "all",
  "approved",
  "pending_admin_approval",
  "rejected",
];
const PERIOD_FILTERS = ["all", "weekly", "monthly", "yearly"] as const;
const AGENT_SUBMIT_SUCCESS_MESSAGE = "Property submitted for admin approval.";
const RESUBMIT_SUCCESS_MESSAGE = "Property resubmitted for admin approval.";
const DELETE_SUCCESS_MESSAGE = "Property deleted successfully.";
const SEARCH_DEBOUNCE_MS = 300;

type ListingPeriodFilter = (typeof PERIOD_FILTERS)[number];

const TABLE_SKELETON_ROWS = 6;
function AgentListingsTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: TABLE_SKELETON_ROWS }, (_, i) => (
        <tr key={i} className="border-b border-subtle/70 last:border-b-0">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-40 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-28 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-6 w-28 max-w-full rounded-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-24 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-24 max-w-full" />
          </td>
          <td className="px-4 py-3 text-right">
            <Skeleton className="ml-auto h-7 w-24 max-w-full rounded-lg" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

function isWithinDays(iso: string, days: number): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [delayMs, value]);
  return debounced;
}

function mapStatusFilterToApiStatus(
  status: AgentListingStatusFilter,
): string | undefined {
  if (status === "all") return undefined;
  // Explicit allow-list (do not invent values).
  if (
    status === "approved" ||
    status === "pending_admin_approval" ||
    status === "rejected"
  ) {
    return status;
  }
  return undefined;
}

function mapSortConfigToApiSort(
  sortConfig: SortConfig,
): { sortBy?: string; sortOrder?: "asc" | "desc" } {
  const primary = sortConfig?.[0];
  if (!primary?.id || !primary?.direction) return {};
  const sortOrder: "asc" | "desc" = primary.direction === "asc" ? "asc" : "desc";
  // Backend supports sortBy/sortOrder; map our visible columns to likely API keys.
  if (primary.id === "updated") return { sortBy: "updated_at", sortOrder };
  if (primary.id === "title") return { sortBy: "title", sortOrder };
  if (primary.id === "price") return { sortBy: "price", sortOrder };
  if (primary.id === "type") return { sortBy: "type_name", sortOrder };
  if (primary.id === "status") return { sortBy: "status", sortOrder };
  return {};
}

export type AgentListingsPageMode = "agent" | "user";

export interface AgentListingsPageProps {
  /** Render mode. `agent` (default) keeps the existing /agent-dashboard URLs; `user` renders the
   * same data + actions under the public `/my-listings` URL space and disables agent-only mock
   * shortcuts. */
  mode?: AgentListingsPageMode;
}

export function AgentListingsPage({ mode = "agent" }: AgentListingsPageProps = {}) {
  const dispatch = useAppDispatch();
  const locale = useLocale() as AppLocale;
  const isUserMode = mode === "user";
  const addPropertyBasePath = isUserMode
    ? `/${locale}/my-listings/add-property`
    : `/${locale}/agent-dashboard/add-property`;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("agentDashboard");
  const tSearch = useTranslations("searchResult");
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AgentListing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorToast, setLoadErrorToast] = useState<string | null>(null);
  const [draftSubmissions, setDraftSubmissions] = useState<AgentDraftSubmissionItem[]>([]);
  const [draftSubmissionsTotal, setDraftSubmissionsTotal] = useState(0);
  const [listPagination, setListPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: DEFAULT_PAGINATION_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [submittedToast, setSubmittedToast] = useState(false);
  const [resubmittedToast, setResubmittedToast] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AgentListing | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteErrorToast, setDeleteErrorToast] = useState<string | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState(false);
  const [rejectedReasonDialog, setRejectedReasonDialog] = useState<{
    open: boolean;
    reason: string | null;
  }>({ open: false, reason: null });
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const [statusFilter, setStatusFilter] = useState<AgentListingStatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<ListingPeriodFilter>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { id: "updated", direction: "desc" },
  ]);

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
    if (legacyStatus) {
      const normalized = legacyStatus.trim().toLowerCase().replace(/-/g, "_");
      const mapped: AgentListingStatusFilter | null =
        normalized === "all"
          ? "all"
          : normalized === "pending_approval"
            ? "pending_admin_approval"
            : LISTING_STATUS_FILTERS.includes(normalized as AgentListingStatusFilter)
              ? (normalized as AgentListingStatusFilter)
              : null;

      if (mapped) setStatusFilter(mapped);
    }
    if (legacyPeriod && PERIOD_FILTERS.includes(legacyPeriod as ListingPeriodFilter)) {
      setPeriodFilter(legacyPeriod as ListingPeriodFilter);
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

  const resetToFirstPage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PAGE_PARAM);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);

    const apiStatus = mapStatusFilterToApiStatus(statusFilter);
    const sort = mapSortConfigToApiSort(sortConfig);

    Promise.all([
      fetchAgentProperties({
        page: currentPage,
        pageSize,
        search: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
        status: apiStatus,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      }),
      // Drafts stay separate and unchanged.
      fetchAgentPropertyDrafts({ page: 1, pageSize: 20 }),
    ])
      .then(([propertiesRes, draftsRes]) => {
        setListings(propertiesRes.items.map(mapAgentPropertyItemToAgentListing));
        setListPagination(propertiesRes.pagination);
        setDraftSubmissions(draftsRes.items ?? []);
        setDraftSubmissionsTotal(draftsRes.pagination.total);
      })
      .catch((e: unknown) => {
        const message = getApiErrorMessage(e);
        setListings([]);
        setListPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
        setDraftSubmissions([]);
        setDraftSubmissionsTotal(0);
        setLoadError(message);
        setLoadErrorToast(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage, debouncedQuery, pageSize, sortConfig, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("submitted") !== "1") return;
    setSubmittedToast(true);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("submitted");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (searchParams.get("resubmitted") !== "1") return;
    setResubmittedToast(true);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("resubmitted");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  const totalItems = listPagination.total ?? 0;
  const totalPages = Math.max(1, listPagination.totalPages ?? 1);
  const safePage = Math.min(currentPage, totalPages);

  const onSearchChange = (value: string) => {
    setQuery(value);
    resetToFirstPage();
  };

  const onStatusChange = (value: string) => {
    const next = LISTING_STATUS_FILTERS.includes(value as AgentListingStatusFilter)
      ? (value as AgentListingStatusFilter)
      : "all";
    setStatusFilter(next);
    resetToFirstPage();
  };

  const onPeriodChange = (value: string) => {
    const next = PERIOD_FILTERS.includes(value as ListingPeriodFilter)
      ? (value as ListingPeriodFilter)
      : "all";
    setPeriodFilter(next);
    resetToFirstPage();
  };

  const emptyListMessage = useMemo(() => {
    if (debouncedQuery.trim()) {
      return "No listings match your search. Try a different property, type, or status.";
    }
    if (statusFilter !== "all") {
      return "No listings with this status. Set the filter to All to see everything.";
    }
    return null;
  }, [debouncedQuery, statusFilter]);

  const handlePublish = useCallback(
    async (id: string) => {
      const row = listings.find((l) => l.id === id);
      if (row?.isFromApi) return;
      await publishDraft(id);
      load();
    },
    [listings, load],
  );

  const handleDeleteMock = useCallback(
    async (id: string) => {
      const row = listings.find((l) => l.id === id);
      if (row?.isFromApi) return;
      if (!confirm(t("deleteConfirm"))) return;
      await deleteListing(id);
      load();
    },
    [listings, load, t],
  );

  const columns = useMemo<CustomTableColumn<AgentListing>[]>(() => {
    return [
      {
        id: "title",
        header: t("tableTitle"),
        sortable: true,
        getSortValue: (row) => row.title,
        render: (row) => (
          <div className="min-w-0">
            <span className="block truncate font-medium text-charcoal">{row.title}</span>
            {row.catalogStatusName && row.submissionStatus ? (
              <span className="mt-0.5 block truncate text-size-xs font-normal text-charcoal/55">
                {t("catalogStatusLine", { status: row.catalogStatusName })}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        id: "type",
        header: t("tableType"),
        sortable: true,
        getSortValue: (row) => `${row.type} ${row.subType ?? ""}`,
        render: (row) => (
          <span className="text-charcoal/80">{formatTypeWithSubType(row.type, row.subType)}</span>
        ),
      },
      {
        id: "status",
        header: t("tableStatus"),
        sortable: true,
        getSortValue: (row) => row.submissionWorkflowLabel ?? row.submissionStatus ?? row.status,
        render: (row) => (
          <div className="flex flex-col gap-1">
            <span className="inline-flex w-fit max-w-full items-center gap-1">
              <span
                className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${statusClassForListing(row)}`}
              >
                {getDisplayStatusLabel(row, t)}
              </span>
            </span>
          </div>
        ),
      },
      {
        id: "updated",
        header: t("tableLastUpdated"),
        sortable: true,
        getSortValue: (row) => row.lastUpdated,
        render: (row) => <span className="text-charcoal/80">{formatDate(row.lastUpdated)}</span>,
      },
      {
        id: "price",
        header: t("tablePrice"),
        sortable: true,
        getSortValue: (row) => row.price,
        render: (row) => <span className="text-charcoal">{formatPrice(row.price)}</span>,
      },
      {
        id: "actions",
        header: t("tableActions"),
        headerClassName: "text-right",
        className: "text-right",
        render: (row) => {
          const canEditApi = row.isFromApi && canEditSubmission(row) && Boolean(row.submissionId);
          const canDeleteApi = row.isFromApi && canDeleteSubmission(row) && Boolean(row.submissionId);
          // In `user` mode we never expose mock-only shortcuts; only real API rows are actionable.
          const canEditMock =
            !isUserMode &&
            !row.isFromApi &&
            row.status !== "active" &&
            row.status !== "pending_approval" &&
            row.status !== "approved";
          const canPublishMock = !isUserMode && !row.isFromApi && row.status === "approved";
          const canDeleteMockRow =
            !isUserMode && !row.isFromApi && row.status !== "pending_approval";
          const deleteBusy = deleteSubmitting && deleteTarget?.id === row.id;

          const viewHref = `/${locale}/property-details/${row.id}`;
          const editHref =
            row.submissionId
              ? `${addPropertyBasePath}?submission=${encodeURIComponent(row.submissionId)}`
              : null;

          const items = [
            {
              key: "view",
              label: (
                <span className="inline-flex items-center gap-2">
                  <Eye className="h-4 w-4 opacity-70" />
                  {t("view")}
                </span>
              ),
              disabled: deleteBusy,
              className: "text-charcoal",
              hoverClassName: "bg-primary/5",
              onSelect: () => router.push(viewHref),
            },
            ...(row.isFromApi &&
            row.submissionStatus?.toLowerCase() === "rejected" &&
            row.reviewReason?.trim()
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
                    disabled: deleteBusy,
                    onSelect: () => {
                      setRejectedReasonDialog({
                        open: true,
                        reason: row.reviewReason?.trim() ?? null,
                      });
                    },
                  },
                ]
              : []),
            ...(canEditApi && editHref
              ? [
                  {
                    key: "edit",
                    label: (
                      <span className="inline-flex items-center gap-2">
                        <Pencil className="h-4 w-4 opacity-70" />
                        {t("edit")}
                      </span>
                    ),
                    disabled: deleteBusy,
                    className: "text-charcoal",
                    hoverClassName: "bg-primary/5",
                    onSelect: () => router.push(editHref),
                  },
                ]
              : []),
            ...(canEditMock
              ? [
                  {
                    key: "edit-mock",
                    label: (
                      <span className="inline-flex items-center gap-2">
                        <Pencil className="h-4 w-4 opacity-70" />
                        {t("edit")}
                      </span>
                    ),
                    disabled: deleteBusy,
                    className: "text-charcoal",
                    hoverClassName: "bg-primary/5",
                    onSelect: () => openEdit(row),
                  },
                ]
              : []),
            ...(canPublishMock
              ? [
                  {
                    key: "publish",
                    label: (
                      <span className="inline-flex items-center gap-2">
                        <Upload className="h-4 w-4 opacity-70" />
                        {t("publish")}
                      </span>
                    ),
                    disabled: deleteBusy,
                    className: "text-emerald-700",
                    hoverClassName: "bg-emerald-50",
                    onSelect: () => void handlePublish(row.id),
                  },
                ]
              : []),
            ...(canDeleteApi
              ? [
                  {
                    key: "delete",
                    label: (
                      <span className="inline-flex items-center gap-2">
                        <Trash2 className="h-4 w-4 opacity-70" />
                        {t("delete")}
                      </span>
                    ),
                    destructive: true,
                    disabled: deleteBusy,
                    onSelect: () => setDeleteTarget(row),
                  },
                ]
              : []),
            ...(canDeleteMockRow
              ? [
                  {
                    key: "delete-mock",
                    label: (
                      <span className="inline-flex items-center gap-2">
                        <Trash2 className="h-4 w-4 opacity-70" />
                        {t("delete")}
                      </span>
                    ),
                    destructive: true,
                    disabled: deleteBusy,
                    onSelect: () => void handleDeleteMock(row.id),
                  },
                ]
              : []),
          ];

          return (
            <div className="flex items-center justify-end">
              <ActionsMenu
                align="right"
                trigger={
                  <IconButton aria-label="Row actions" variant="ghost" size="sm">
                    <MoreVertical />
                  </IconButton>
                }
                items={items}
              />
            </div>
          );
        },
      },
    ];
  }, [
    deleteSubmitting,
    deleteTarget?.id,
    handleDeleteMock,
    handlePublish,
    locale,
    router,
    t,
    isUserMode,
    addPropertyBasePath,
  ]);

  const statusOptions = LISTING_STATUS_FILTERS.map((status) => ({
    value: status,
    label: status === "all" ? "All" : statusLabel(status, t),
  }));

  const periodOptions = PERIOD_FILTERS.map((period) => ({
    value: period,
    label:
      period === "all"
        ? t("filterAllTime")
        : period === "weekly"
          ? t("filterWeekly")
          : period === "monthly"
            ? t("filterMonthly")
            : t("filterYearly"),
  }));

  const openEdit = (listing: AgentListing) => {
    setEditing(listing);
    setEditTitle(listing.title);
    setEditPrice(String(listing.price));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditTitle("");
    setEditPrice("");
  };

  const handleSave = async () => {
    if (!editing || editing.isFromApi) return;
    const price = Number(editPrice);
    if (Number.isNaN(price) || price < 0) return;
    setSaving(true);
    try {
      await updateListing(editing.id, { title: editTitle.trim(), price });
      load();
      closeEdit();
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteSubmission = async () => {
    if (!deleteTarget?.submissionId) {
      setDeleteTarget(null);
      return;
    }
    setDeleteSubmitting(true);
    setDeleteErrorToast(null);
    try {
      await deletePropertySubmission(deleteTarget.submissionId);
      setDeleteTarget(null);
      setDeleteErrorToast(null);
      setDeleteSuccessToast(true);
      void load();
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response) {
        const s = e.response.status;
        if (s === 409) {
          setDeleteErrorToast("This property cannot be deleted in its current status.");
          return;
        }
        if (s === 404 || s === 410) {
          setDeleteTarget(null);
          void load();
          setDeleteErrorToast("Property was already removed.");
          return;
        }
      }
      setDeleteErrorToast(getApiErrorMessage(e));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading) {
    return <AgentListingsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {loadErrorToast ? (
        <Toast
          kind="error"
          message={loadErrorToast}
          duration={7000}
          onClose={() => setLoadErrorToast(null)}
        />
      ) : null}
      {submittedToast ? (
        <Toast
          kind="success"
          message={AGENT_SUBMIT_SUCCESS_MESSAGE}
          onClose={() => setSubmittedToast(false)}
        />
      ) : null}
      {resubmittedToast ? (
        <Toast
          kind="success"
          message={RESUBMIT_SUCCESS_MESSAGE}
          onClose={() => setResubmittedToast(false)}
        />
      ) : null}
      {deleteErrorToast ? (
        <Toast
          kind="error"
          message={deleteErrorToast}
          onClose={() => setDeleteErrorToast(null)}
        />
      ) : null}
      {deleteSuccessToast ? (
        <Toast
          kind="success"
          message={DELETE_SUCCESS_MESSAGE}
          onClose={() => setDeleteSuccessToast(false)}
        />
      ) : null}
      <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            {t("manageListingsTitle")}
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">
            {t("manageListingsSubtitle")}
          </p>
          <p className="mt-2 max-w-2xl text-size-xs text-charcoal/55">
            {t("listingsActionsViewOnlyNote")}
          </p>
        </div>
        <Link
          href={addPropertyBasePath}
          onClick={() => {
            dispatch(initializeNewPropertyWizard());
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addNewProperty")}
        </Link>
      </div>

      {!loadError && draftSubmissions.length > 0 ? (
        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 md:p-5">
          <h2 className="text-size-sm fw-semibold text-charcoal">
            {t("draftSubmissionsHeading", { count: draftSubmissionsTotal || draftSubmissions.length })}
          </h2>
          <p className="mt-1 text-size-sm text-charcoal/70">{t("draftSubmissionsHint")}</p>
          <ul className="mt-3 space-y-2">
            {draftSubmissions.map((d) => (
              <li
                key={d.submission_id}
                className="flex flex-col gap-2 rounded-xl border border-subtle bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-charcoal">
                    {d.title?.trim() || t("draftUntitled")}
                  </p>
                  <p className="text-size-xs text-charcoal/60">
                    {d.status} · {t("draftStepLabel", { step: d.current_step ?? "—" })}{" "}
                    {d.updated_at ? `· ${formatDate(d.updated_at)}` : null}
                  </p>
                </div>
                <Link
                  href={`${addPropertyBasePath}?submission=${encodeURIComponent(d.submission_id)}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary bg-primary px-3 py-1.5 text-size-sm font-medium text-white hover:bg-primary/90"
                >
                  {t("continueDraft")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <DataTable
        className="rounded-xl border-subtle"
          headerLeft={
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-secondary" />
              <span>Property list</span>
            </span>
          }
          search={{
            value: query,
            onChange: onSearchChange,
            placeholder: "Search by property, type, status",
          }}
          filters={[
            {
              id: "status",
              buttonId: "listings-status-filter",
              value: statusFilter,
              onChange: (value) => onStatusChange(String(value ?? "all")),
              options: statusOptions,
              label: "All",
              align: "right",
              menuClassName: "w-44",
              buttonClassName:
                "h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between",
            },
            {
              id: "period",
              buttonId: "listings-period-filter",
              value: periodFilter,
              onChange: (value) => onPeriodChange(String(value ?? "all")),
              options: periodOptions,
              label: t("filterAllTime"),
              align: "right",
              menuClassName: "w-44",
              buttonClassName:
                "h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between",
            },
          ]}
          table={{
            columns,
            data: listings,
            getRowId: (row) => row.id,
            sortConfig,
            onSort: (next) => {
              setSortConfig(next);
              resetToFirstPage();
            },
            multiSortWithShift: true,
            loading: false,
            skeleton: <AgentListingsTableSkeleton />,
            error: loadError,
            errorTitle: t("loadListingsError"),
            errorDescription: (
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium text-charcoal">{t("loadListingsError")}</p>
                <p className="text-xs text-charcoal/60">{t("loadListingsErrorHint")}</p>
                <button
                  type="button"
                  onClick={() => void load()}
                  className="mx-auto mt-2 inline-flex items-center justify-center rounded-lg border border-subtle bg-white px-4 py-2 text-sm font-medium text-charcoal shadow-sm transition hover:bg-surface"
                >
                  {t("retryLoadListings")}
                </button>
              </div>
            ),
            emptyMessage: emptyListMessage ? (
              emptyListMessage
            ) : (
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <Building2 className="h-10 w-10 text-charcoal/40" />
                <p className="mt-2 text-sm text-charcoal/70">{t("noListings")}</p>
              </div>
            ),
            minTableWidth: "700px",
            pagination: {
              showWhen: !loadError && totalItems > 0,
              currentPage: safePage,
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
            },
          }}
      />

      <DialogRoot
        open={!!deleteTarget}
        onClose={() => {
          if (deleteSubmitting) return;
          setDeleteTarget(null);
        }}
        className="relative max-w-md"
      >
        <DialogTitle>Delete property?</DialogTitle>
        <DialogDescription className="text-pretty text-sm text-charcoal/75">
          This will remove the property from your listings. This action cannot be undone from your
          account.
        </DialogDescription>
        <DialogFooter className="mt-6 flex flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteTarget(null)}
            disabled={deleteSubmitting}
          >
            {t("deleteSubmissionCancel")}
          </Button>
          <LoadingButton
            type="button"
            variant="accent"
            className="bg-rose-600 text-white hover:bg-rose-700"
            loading={deleteSubmitting}
            onClick={() => void confirmDeleteSubmission()}
            disabled={deleteSubmitting}
          >
            {t("deleteSubmissionConfirm")}
          </LoadingButton>
        </DialogFooter>
      </DialogRoot>

      <DialogRoot open={!!editing} onClose={closeEdit}>
        <DialogTitle>{t("editListing")}</DialogTitle>
        <DialogDescription>{t("editListingDescription")}</DialogDescription>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-listing-title">{t("tableTitle")}</Label>
            <Input
              id="edit-listing-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Listing title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-listing-price">Price (JOD)</Label>
            <Input
              id="edit-listing-price"
              type="number"
              min={0}
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeEdit}>
            {t("cancel")}
          </Button>
          <Button type="button" variant="accent" onClick={handleSave} disabled={saving}>
            {saving ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogRoot>

      <DialogRoot
        open={rejectedReasonDialog.open}
        onClose={() => setRejectedReasonDialog({ open: false, reason: null })}
        className="relative max-w-md"
      >
        <DialogTitle>Rejected reason</DialogTitle>
        <DialogDescription className="text-pretty text-sm text-charcoal/75">
          Reason provided by admin for this listing rejection.
        </DialogDescription>
        <div className="mt-4">
          {rejectedReasonDialog.reason ? (
            <p className="whitespace-pre-wrap text-size-sm text-charcoal/80">
              {rejectedReasonDialog.reason}
            </p>
          ) : (
            <p className="text-size-sm text-charcoal/60">—</p>
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="accent"
            onClick={() => setRejectedReasonDialog({ open: false, reason: null })}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogRoot>
    </div>
  );
}


"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Filter,
} from "lucide-react";
import {
  fetchAgentProperties,
  fetchAgentPropertyDrafts,
  type AgentDraftSubmissionItem,
} from "@/features/admin-agents/agent-dashboard/api/agentProperties.api";
import { deletePropertySubmission } from "@/features/admin-agents/agent-dashboard/api/propertySubmissions.api";
import { mapAgentPropertyItemToAgentListing } from "@/features/admin-agents/agent-dashboard/lib/mapAgentPropertyListItem";
import {
  canDeleteSubmission,
  canEditSubmission,
  getDisplayStatusLabel,
} from "@/features/admin-agents/agent-dashboard/lib/agentSubmissionListHelpers";
import {
  deleteListing,
  publishDraft,
  updateListing,
} from "@/services/agentDashboardMockService";
import type { AgentListing, ListingStatus, PropertyType } from "@/types/agent";
import { getApiErrorMessage } from "@/lib/http/apiError";
import { useAppDispatch } from "@/hooks/storeHooks";
import { useTranslations } from "@/hooks/useTranslations";
import { initializeNewPropertyWizard } from "@/features/admin-agents/agent-dashboard/components/add-property/addPropertyWizardSlice";
import { DialogRoot, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  ActionsMenu,
  Button,
  CustomTable,
  IconButton,
  Input,
  Label,
  LoadingButton,
  Skeleton,
  sortRowsByConfig,
  type CustomTableColumn,
  type SortConfig,
} from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { Toast } from "@/components/ui/toast";
import { AgentListingsPageSkeleton } from "@/features/admin-agents/agent-dashboard/components/AgentListingsPageSkeleton";

function statusClass(status: string): string {
  if (status === "active") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "pending_approval") return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "approved") return "bg-violet-100 text-violet-800 border-violet-200";
  if (status === "rejected") return "bg-rose-100 text-rose-800 border-rose-200";
  if (status === "deactivated") return "bg-charcoal/10 text-charcoal/80 border-subtle";
  return "bg-charcoal/10 text-charcoal/80 border-subtle";
}

function statusLabel(status: string, t: (k: string) => string): string {
  if (status === "pending_approval") return t("statusPendingApproval");
  if (status === "approved") return t("statusApproved");
  if (status === "active") return t("statusActive");
  if (status === "rejected") return t("statusRejected");
  if (status === "deactivated") return t("statusDeactivated");
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

const PROPERTY_TYPES: PropertyType[] = [
  "villa",
  "apartment",
  "office",
  "land",
  "house",
  "duplex",
  "warehouse",
  "studio",
  "penthouse",
  "commercial",
];

const PAGE_SIZE = 10;
const LISTING_STATUS_FILTERS: readonly ("all" | ListingStatus)[] = [
  "all",
  "active",
  "pending_approval",
  "approved",
  "rejected",
  "deactivated",
];
const PERIOD_FILTERS = ["all", "weekly", "monthly", "yearly"] as const;

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

export function AgentListingsPage() {
  const dispatch = useAppDispatch();
  const locale = useLocale() as AppLocale;
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
  const [submittedToast, setSubmittedToast] = useState(false);
  const [resubmittedToast, setResubmittedToast] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AgentListing | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteErrorToast, setDeleteErrorToast] = useState<string | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { id: "updated", direction: "desc" },
  ]);

  const statusParam = searchParams.get("status");
  const periodParam = searchParams.get("period");
  const pageParam = Number(searchParams.get("page") ?? "1");
  const statusFilter: "all" | ListingStatus =
    statusParam && LISTING_STATUS_FILTERS.includes(statusParam as "all" | ListingStatus)
      ? (statusParam as "all" | ListingStatus)
      : "all";
  const periodFilter: ListingPeriodFilter =
    periodParam && PERIOD_FILTERS.includes(periodParam as ListingPeriodFilter)
      ? (periodParam as ListingPeriodFilter)
      : "all";

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      });
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    Promise.all([
      fetchAgentProperties({ page: 1, limit: 200 }),
      fetchAgentPropertyDrafts({ page: 1, limit: 20 }),
    ])
      .then(([propertiesRes, draftsRes]) => {
        const list = propertiesRes.items.map(mapAgentPropertyItemToAgentListing);
        setListings(list);
        setDraftSubmissions(draftsRes.items ?? []);
        setDraftSubmissionsTotal(draftsRes.total ?? draftsRes.items?.length ?? 0);
      })
      .catch((e: unknown) => {
        const message = getApiErrorMessage(e);
        setListings([]);
        setDraftSubmissions([]);
        setDraftSubmissionsTotal(0);
        setLoadError(message);
        setLoadErrorToast(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (listing.status === "draft" && !listing.isFromApi) return false;
      if (statusFilter !== "all" && listing.status !== statusFilter) {
        return false;
      }
      if (periodFilter === "weekly") return isWithinDays(listing.lastUpdated, 7);
      if (periodFilter === "monthly") return isWithinDays(listing.lastUpdated, 30);
      if (periodFilter === "yearly") return isWithinDays(listing.lastUpdated, 365);
      return true;
    });
  }, [listings, periodFilter, statusFilter]);

  const sortedListings = useMemo(() => {
    return sortRowsByConfig(filteredListings, sortConfig, (row, columnId) => {
      if (columnId === "title") return row.title;
      if (columnId === "type") return `${row.type} ${row.subType ?? ""}`;
      if (columnId === "status") return row.submissionWorkflowLabel ?? row.submissionStatus ?? row.status;
      if (columnId === "updated") return row.lastUpdated;
      if (columnId === "price") return row.price;
      return "";
    });
  }, [filteredListings, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedListings.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, totalPages) : 1;
  const paginatedListings = sortedListings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
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
              {row.isFromApi &&
              row.submissionStatus?.toLowerCase() === "rejected" &&
              row.reviewReason?.trim() ? (
                <span
                  className="text-charcoal/50"
                  title={row.reviewReason.trim()}
                  aria-label={row.reviewReason.trim()}
                >
                  <Info className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </span>
            {row.isFromApi &&
            row.submissionStatus?.toLowerCase() === "rejected" &&
            row.reviewReason?.trim() ? (
              <p
                className="line-clamp-2 max-w-[260px] text-size-[11px] text-charcoal/60"
                title={row.reviewReason.trim()}
              >
                {row.reviewReason.trim()}
              </p>
            ) : null}
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
          const canEditMock =
            !row.isFromApi &&
            row.status !== "active" &&
            row.status !== "pending_approval" &&
            row.status !== "approved";
          const canPublishMock = !row.isFromApi && row.status === "approved";
          const canDeleteMockRow = !row.isFromApi && row.status !== "pending_approval";
          const deleteBusy = deleteSubmitting && deleteTarget?.id === row.id;

          const viewHref = `/${locale}/property-details/${row.id}`;
          const editHref =
            row.submissionId
              ? `/${locale}/agent-dashboard/add-property?submission=${encodeURIComponent(row.submissionId)}`
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
  ]);

  const statusOptions = LISTING_STATUS_FILTERS.map((status) => ({
    value: status,
    label: status === "all" ? t("filterAllStatuses") : statusLabel(status, t),
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

  async function handlePublish(id: string) {
    const row = listings.find((l) => l.id === id);
    if (row?.isFromApi) return;
    await publishDraft(id);
    load();
  }

  async function handleDeleteMock(id: string) {
    const row = listings.find((l) => l.id === id);
    if (row?.isFromApi) return;
    if (!confirm(t("deleteConfirm"))) return;
    await deleteListing(id);
    load();
  }

  const confirmDeleteSubmission = async () => {
    if (!deleteTarget?.submissionId) {
      setDeleteTarget(null);
      return;
    }
    setDeleteSubmitting(true);
    setDeleteErrorToast(null);
    try {
      await deletePropertySubmission(deleteTarget.submissionId);
      setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
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
          message={t("listingSubmittedRedirect")}
          onClose={() => setSubmittedToast(false)}
        />
      ) : null}
      {resubmittedToast ? (
        <Toast
          kind="success"
          message={t("propertyResubmittedForApproval")}
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
          message={t("deleteSubmissionSuccess")}
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
          href={`/${locale}/agent-dashboard/add-property`}
          onClick={() => {
            dispatch(initializeNewPropertyWizard());
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addNewProperty")}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-charcoal/80">
          <Filter className="h-4 w-4" />
          {t("filter")}
        </div>
        <div className="hidden h-4 w-px bg-subtle sm:block" />
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
          <Dropdown
            buttonId="listings-status-filter"
            label={t("filterStatusLabel")}
            value={statusFilter}
            onChange={(val) => updateQueryParams({ status: val })}
            options={statusOptions}
            align="left"
          />
          <Dropdown
            buttonId="listings-period-filter"
            label={t("filterPeriodLabel")}
            value={periodFilter}
            onChange={(val) => updateQueryParams({ period: val })}
            options={periodOptions}
            align="left"
          />
        </div>
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
                  href={`/${locale}/agent-dashboard/add-property?submission=${encodeURIComponent(d.submission_id)}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-primary bg-primary px-3 py-1.5 text-size-sm font-medium text-white hover:bg-primary/90"
                >
                  {t("continueDraft")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <article className="rounded-2xl border border-subtle bg-white shadow-sm overflow-hidden">
        <CustomTable
          columns={columns}
          data={paginatedListings}
          getRowId={(row) => row.id}
          sortConfig={sortConfig}
          onSort={setSortConfig}
          multiSortWithShift
          loading={false}
          skeleton={<AgentListingsTableSkeleton />}
          error={loadError}
          errorTitle={t("loadListingsError")}
          errorDescription={
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
          }
          emptyMessage={
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <Building2 className="h-10 w-10 text-charcoal/40" />
              <p className="mt-2 text-sm text-charcoal/70">{t("noListings")}</p>
            </div>
          }
          minTableWidth="700px"
          pagination={{
            showWhen: !loadError && sortedListings.length > 0,
            currentPage,
            totalPages,
            totalItems: sortedListings.length,
            pageSize: PAGE_SIZE,
            basePath: pathname,
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
      </article>

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
    </div>
  );
}


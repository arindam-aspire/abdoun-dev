"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { ArrowLeft, Building2, Eye, Pencil, Plus, Trash2, Upload, Filter } from "lucide-react";
import {
  addListing,
  deleteListing,
  getListings,
  publishDraft,
  updateListing,
} from "@/services/agentDashboardMockService";
import type { AgentListing, ListingStatus, PropertyType } from "@/types/agent";
import { useTranslations } from "@/hooks/useTranslations";
import {
  DialogRoot,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, Input, Label } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { Pagination } from "@/components/search-result/Pagination";

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

/** Table content only: "Type" or "Type, Sub Type" (header stays "Type"). */
function formatTypeWithSubType(type: string, subType?: string | null): string {
  const typeLabel = capitalizeType(type);
  if (subType?.trim()) return `${typeLabel}, ${subType.trim()}`;
  return typeLabel;
}

const PROPERTY_TYPES: PropertyType[] = [
  "villa", "apartment", "office", "land", "house",
  "duplex", "warehouse", "studio", "penthouse", "commercial",
];

const PAGE_SIZE = 10;
// Draft removed; only these statuses appear in Manage Listings
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

function isWithinDays(iso: string, days: number): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export function AgentListingsPage() {
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
    getListings().then((list) => {
      setListings(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Draft status removed: do not show draft listings
      if (listing.status === "draft") return false;
      if (statusFilter !== "all" && listing.status !== statusFilter) {
        return false;
      }
      if (periodFilter === "weekly") return isWithinDays(listing.lastUpdated, 7);
      if (periodFilter === "monthly") return isWithinDays(listing.lastUpdated, 30);
      if (periodFilter === "yearly") return isWithinDays(listing.lastUpdated, 365);
      return true;
    });
  }, [listings, periodFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, totalPages) : 1;
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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
    if (!editing) return;
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

  const handlePublish = async (id: string) => {
    await publishDraft(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    await deleteListing(id);
    load();
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-charcoal/70">{t("loadingListings")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/agent-dashboard`}
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/80 hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToDashboard")}
        </Link>
      </div>
      <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            {t("manageListingsTitle")}
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">
            {t("manageListingsSubtitle")}
          </p>
        </div>
        <Link
          href={`/${locale}/agent-dashboard/add-property`}
          className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addProperty")}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-charcoal/80">
          <Filter className="h-4 w-4" />
          {t("filter")}
        </div>
        <div className="hidden h-4 w-px bg-subtle sm:block" />
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
          {/* <div className=""> */}
             <Dropdown
              buttonId="listings-status-filter"
              label={t("filterStatusLabel")}
              value={statusFilter}
              onChange={(val) => updateQueryParams({ status: val })}
              options={statusOptions}
              align="left"
            />
          {/* </div> */}
          {/* <div className=""> */}
            <Dropdown
              buttonId="listings-period-filter"
              label={t("filterPeriodLabel")}
              value={periodFilter}
              onChange={(val) => updateQueryParams({ period: val })}
              options={periodOptions}
              align="left"
            />
          {/* </div> */}
        </div>
      </div>

      <article className="rounded-2xl border border-subtle bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-subtle bg-surface text-xs text-charcoal/65">
                <th className="px-4 py-3 font-medium">{t("tableTitle")}</th>
                <th className="px-4 py-3 font-medium">{t("tableType")}</th>
                <th className="px-4 py-3 font-medium">{t("tableStatus")}</th>
                <th className="px-4 py-3 font-medium">{t("tableLastUpdated")}</th>
                <th className="px-4 py-3 font-medium">{t("tablePrice")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedListings.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-subtle/70 text-sm last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">{row.title}</td>
                  <td className="px-4 py-3 text-charcoal/80">{formatTypeWithSubType(row.type, row.subType)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass(row.status)}`}
                    >
                      {statusLabel(row.status, t)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal/80">{formatDate(row.lastUpdated)}</td>
                  <td className="px-4 py-3 text-charcoal">{formatPrice(row.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/${locale}/property-details/${row.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-subtle bg-surface px-2 py-1.5 text-xs font-medium text-charcoal hover:bg-primary/5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("view")}
                      </Link>
                      {/* Active: no Edit. Pending Admin Approval: no Edit/Delete/Publish. Approved: no Edit. Rejected: Publish not available. */}
                      {row.status !== "active" && row.status !== "pending_approval" && row.status !== "approved" ? (
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-subtle bg-surface px-2 py-1.5 text-xs font-medium text-charcoal hover:bg-primary/5"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {t("edit")}
                        </button>
                      ) : null}
                      {/* Publish: only for Approved (Draft removed) */}
                      {row.status === "approved" ? (
                        <button
                          type="button"
                          onClick={() => handlePublish(row.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {t("publish")}
                        </button>
                      ) : null}
                      {/* Pending Admin Approval: no Delete */}
                      {row.status !== "pending_approval" ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("delete")}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-10 w-10 text-charcoal/40" />
            <p className="mt-2 text-sm text-charcoal/70">{t("noListings")}</p>
          </div>
        ) : (
          <div className="border-t border-subtle px-4 py-4 md:px-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredListings.length}
              pageSize={PAGE_SIZE}
              basePath={pathname}
              translations={{
                previous: tSearch("paginationPrevious"),
                next: tSearch("paginationNext"),
                page: tSearch("paginationPage"),
                of: tSearch("paginationOf"),
                showing: tSearch("paginationShowing"),
                to: tSearch("paginationTo"),
                results: tSearch("paginationResults"),
              }}
            />
          </div>
        )}
      </article>

      {/* Edit Listing Dialog */}
      <DialogRoot open={!!editing} onClose={closeEdit}>
        <DialogTitle>{t("editListing")}</DialogTitle>
        <DialogDescription>
          {t("editListingDescription")}
        </DialogDescription>
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

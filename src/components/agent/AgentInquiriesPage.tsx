"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { ArrowLeft, Mail, MessageSquare, Filter } from "lucide-react";
import {
  addInquiryResponse,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
} from "@/services/agentDashboardMockService";
import type { AgentInquiry, InquiryStatus } from "@/types/agent";
import { useTranslations } from "@/hooks/useTranslations";
import {
  DialogRoot,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, Label } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/Pagination";

function statusClass(status: string): string {
  if (status === "new") return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "contacted") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "closed") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-charcoal/10 text-charcoal/80 border-subtle";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function inquiryStatusLabel(s: string, t: (k: string) => string): string {
  if (s === "new") return t("filterNew");
  if (s === "contacted") return t("filterContacted");
  if (s === "closed") return t("filterClosed");
  return s;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const LEADS_FILTERS: readonly (InquiryStatus | "all")[] = ["all", "new", "contacted"];
const DEAL_CLOSE_FILTERS: readonly InquiryStatus[] = ["closed"];
const PERIOD_FILTERS = ["all", "weekly", "monthly", "yearly"] as const;
const PAGE_SIZE = 10;

type InquiryPeriodFilter = (typeof PERIOD_FILTERS)[number];

function isWithinDays(iso: string, days: number): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export function AgentInquiriesPage() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("agentDashboard");
  const tSearch = useTranslations("searchResult");
  const viewParam = searchParams.get("view");
  const statusParam = searchParams.get("status");
  const periodParam = searchParams.get("period");
  const pageParam = Number(searchParams.get("page") ?? "1");
  const isDealCloseView = viewParam === "deal-close";
  const allowedFilters = isDealCloseView ? DEAL_CLOSE_FILTERS : LEADS_FILTERS;
  const statusFilter: InquiryStatus | "all" =
    statusParam && allowedFilters.includes(statusParam as InquiryStatus | "all")
      ? (statusParam as InquiryStatus | "all")
      : isDealCloseView
        ? "closed"
        : "all";
  const periodFilter: InquiryPeriodFilter =
    periodParam && PERIOD_FILTERS.includes(periodParam as InquiryPeriodFilter)
      ? (periodParam as InquiryPeriodFilter)
      : "all";
  const [inquiries, setInquiries] = useState<AgentInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<AgentInquiry | null>(null);
  const [responseText, setResponseText] = useState("");
  const [sending, setSending] = useState(false);

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
    getInquiries().then((list) => {
      setInquiries(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }
    getInquiryById(selectedId).then(setSelected);
  }, [selectedId]);

  const openInquiry = (id: string) => {
    setSelectedId(id);
    setResponseText("");
  };

  const closeModal = () => {
    setSelectedId(null);
    setSelected(null);
    setResponseText("");
  };

  const handleSendResponse = async () => {
    if (!selectedId || !responseText.trim()) return;
    setSending(true);
    try {
      await addInquiryResponse(selectedId, responseText.trim());
      load();
      setResponseText("");
      getInquiryById(selectedId).then(setSelected);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: InquiryStatus) => {
    await updateInquiryStatus(id, status);
    load();
    if (selectedId === id) {
      getInquiryById(id).then(setSelected);
    }
  };

  const filtered = useMemo(() => {
    return inquiries.filter((iq) => {
      if (!allowedFilters.includes(iq.status)) {
        return false;
      }
      if (statusFilter !== "all" && iq.status !== statusFilter) {
        return false;
      }
      if (periodFilter === "weekly") return isWithinDays(iq.dateReceived, 7);
      if (periodFilter === "monthly") return isWithinDays(iq.dateReceived, 30);
      if (periodFilter === "yearly") return isWithinDays(iq.dateReceived, 365);
      return true;
    });
  }, [allowedFilters, inquiries, periodFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, totalPages) : 1;
  const paginatedInquiries = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const modalStatusOptions = isDealCloseView ? DEAL_CLOSE_FILTERS : LEADS_FILTERS.filter((status) => status !== "all");
  const statusOptions = allowedFilters.map((status) => ({
    value: status,
    label: capitalizeFirst(status === "all" ? t("filterAll") : inquiryStatusLabel(status, t)),
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

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-charcoal/70">{t("loadingInquiries")}</p>
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
            {t("inquiryInboxTitle")}
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">
            {t("inquiryInboxSubtitle")}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-charcoal/80">
          <Filter className="h-4 w-4" />
          {t("filter")}
        </div>
        <div className="hidden h-4 w-px bg-subtle sm:block" />
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
          <Dropdown
            buttonId="inquiries-status-filter"
            label={t("filterStatusLabel")}
            value={statusFilter}
            onChange={(val) => updateQueryParams({ status: val })}
            options={statusOptions}
            align="left"
          />
          <Dropdown
            buttonId="inquiries-period-filter"
            label={t("filterPeriodLabel")}
            value={periodFilter}
            onChange={(val) => updateQueryParams({ period: val })}
            options={periodOptions}
            align="left"
          />
        </div>
      </div>

      <article className="rounded-2xl border border-subtle bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-subtle bg-surface text-xs text-charcoal/65">
                <th className="px-4 py-3 font-medium">{t("tablePropertyName")}</th>
                <th className="px-4 py-3 font-medium">{t("tableDateReceived")}</th>
                <th className="px-4 py-3 font-medium">{t("tableStatus")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("tableActions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInquiries.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-subtle/70 text-sm last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">{row.propertyName}</td>
                  <td className="px-4 py-3 text-charcoal/80">{formatDate(row.dateReceived)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass(row.status)}`}
                    >
                      {capitalizeFirst(inquiryStatusLabel(row.status, t))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openInquiry(row.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-subtle bg-surface px-2 py-1.5 text-xs font-medium text-charcoal hover:bg-primary/5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {t("open")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="h-10 w-10 text-charcoal/40" />
            <p className="mt-2 text-sm text-charcoal/70">{t("noInquiries")}</p>
          </div>
        ) : (
          <div className="border-t border-subtle px-4 py-4 md:px-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
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

      <DialogRoot open={!!selectedId} onClose={closeModal}>
        <DialogTitle>{t("inquiry")}</DialogTitle>
        <DialogDescription>
          {selected ? selected.propertyName : t("loading")}
        </DialogDescription>
        <div className="space-y-4 py-2">
          {selected ? (
            <>
              <div>
                <p className="text-xs font-medium text-charcoal/65">{t("received")}</p>
                <p className="text-sm text-charcoal">{formatDate(selected.dateReceived)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-charcoal/65">{t("message")}</p>
                <p className="text-sm text-charcoal mt-1">{selected.message}</p>
              </div>
              {selected.response ? (
                <div>
                  <p className="text-xs font-medium text-charcoal/65">{t("yourResponse")}</p>
                  <p className="text-sm text-charcoal mt-1">{selected.response}</p>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="inquiry-response">{t("reply")}</Label>
                <textarea
                  id="inquiry-response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                  className="w-full rounded-lg border border-subtle bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-charcoal/65">{t("status")}:</span>
                {modalStatusOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectedId && handleUpdateStatus(selectedId, s)}
                    className={`rounded-full border px-2 py-1 text-[11px] font-medium ${
                      selected.status === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-subtle bg-surface text-charcoal/80"
                    }`}
                  >
                    {capitalizeFirst(inquiryStatusLabel(s, t))}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-charcoal/70">{t("loading")}</p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeModal}>
            {t("close")}
          </Button>
          <Button
            type="button"
            variant="accent"
            onClick={handleSendResponse}
            disabled={sending || !responseText.trim()}
          >
            {sending ? t("sending") : t("sendResponse")}
          </Button>
        </DialogFooter>
      </DialogRoot>
    </div>
  );
}

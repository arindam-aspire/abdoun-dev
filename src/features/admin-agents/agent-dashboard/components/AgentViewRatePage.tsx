"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { ArrowLeft, Eye, Filter, Building2 } from "lucide-react";
import type { PerformanceComparisonItem } from "@/types/agent";
import { Dropdown } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { fetchAgentPropertyPerformancePage } from "@/features/admin-agents/agent-dashboard/agentDashboardSummarySlice";
import type { AgentPropertyPerformancePeriod } from "@/features/admin-agents/agent-dashboard/api/agentDashboard.api";

const PERIOD_FILTERS = ["all", "weekly", "monthly", "yearly"] as const;
type PeriodFilter = (typeof PERIOD_FILTERS)[number];

const ITEMS_PER_PAGE = 10;

export function AgentViewRatePage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("agentDashboard");
  const dispatch = useAppDispatch();
  const perf = useAppSelector((s) => s.agentDashboardSummary.propertyPerformance);
  const data: PerformanceComparisonItem[] = perf.items ?? [];
  const total = perf.total ?? 0;
  const loading = perf.status === "loading" || perf.status === "idle";
  const error = perf.status === "failed" ? perf.error : null;
  const [toast, setToast] = useState<string | null>(null);
  const errorToastSentRef = useRef(false);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page") ?? "1");

  const itemsPerPage = ITEMS_PER_PAGE;
  const tSearch = useTranslations("searchResult");

  /** One-time: hydrate legacy `?period=` into state, then remove it from the URL. */
  useEffect(() => {
    const raw = searchParams.get("period");
    if (!raw) return;
    const normalized = raw.trim().toLowerCase();
    if (PERIOD_FILTERS.includes(normalized as PeriodFilter)) {
      setPeriodFilter(normalized as PeriodFilter);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("period");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate legacy `period` once on mount
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, totalPages) : 1;

  useEffect(() => {
    const period = periodFilter as AgentPropertyPerformancePeriod;
    void dispatch(fetchAgentPropertyPerformancePage({
      page: currentPage,
      pageSize: itemsPerPage,
      period,
    }));
  }, [currentPage, dispatch, itemsPerPage, periodFilter]);

  // If there is no data, drop the period filter (keep UI simple).
  useEffect(() => {
    if (loading || error) return;
    if (total !== 0) return;
    if (periodFilter !== "all") {
      setPeriodFilter("all");
    }
  }, [error, loading, periodFilter, total]);

  useEffect(() => {
    if (loading) {
      errorToastSentRef.current = false;
      return;
    }
    if (!error) return;
    if (errorToastSentRef.current) return;
    errorToastSentRef.current = true;
    setToast(error.trim() ? error : "Unable to load view rate right now.");
  }, [error, loading]);

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
      <div className="px-1">
        <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
          {t("totalPropertyViewsPageTitle")}
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          {t("totalPropertyViewsPageSubtitle")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-1">
        <div className="hidden h-4 w-px bg-subtle sm:block" />
        {!loading && !error && total === 0 ? null : (
          <div className="flex flex-1 flex-col sm:flex-row sm:justify-end items-center gap-2">
            <Dropdown
              buttonId="viewrate-period-filter"
              label={t("filterPeriodLabel")}
              value={periodFilter}
              onChange={(val) => {
                const normalized = String(val ?? "").trim().toLowerCase();
                const next: PeriodFilter = PERIOD_FILTERS.includes(normalized as PeriodFilter)
                  ? (normalized as PeriodFilter)
                  : "all";
                setPeriodFilter(next);
                // Reset to page 1 without storing period in URL.
                const params = new URLSearchParams(searchParams.toString());
                params.delete("page");
                const q = params.toString();
                router.push(q ? `${pathname}?${q}` : pathname);
              }}
              options={periodOptions}
              align="right"
            />
          </div>
        )}
      </div>

      <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <Eye className="h-4 w-4 text-emerald-600" />
            {t("totalPropertyViewsListTitle")}
          </h2>
        </div>

        {loading ? (
          <ul className="mt-4 space-y-3" aria-busy="true" aria-live="polite">
            {Array.from({ length: 6 }).map((_, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-xl border border-subtle bg-surface px-4 py-3 text-sm"
              >
                <Skeleton className="h-4 w-48 max-w-[60%]" />
                <Skeleton className="h-4 w-20" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="mt-4 rounded-xl border border-subtle bg-surface px-4 py-3">
            <p className="text-sm text-red-700" role="alert" aria-live="assertive">
              {error}
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.map((item, idx) => (
              <li
                key={`${(currentPage - 1) * itemsPerPage + idx}-${item.label}`}
                className="flex items-center justify-between rounded-xl border border-subtle bg-surface px-4 py-3 text-sm"
              >
                <span className="font-medium text-charcoal truncate pr-2">{item.label}</span>
                <span className="text-charcoal/80 shrink-0">
                  {item.value} {t("views")}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-subtle bg-white/40 px-6 py-12 text-center">
            <Building2 className="h-10 w-10 text-charcoal/40" />
            <h3 className="mt-4 text-sm fw-semibold text-charcoal">
              {t("noPropertiesWithViews")}
            </h3>
            <p className="mt-1 max-w-md text-sm text-charcoal/60">
              Try changing the period filter, or come back later once your listings start receiving views.
            </p>
          </div>
        ) : !loading && !error ? (
          <div className="border-t border-subtle mt-4 pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              pageSize={itemsPerPage}
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
        ) : null}
      </article>

      {toast ? (
        <Toast
          kind="error"
          message={toast}
          duration={6000}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

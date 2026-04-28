"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { ArrowLeft, Eye, Filter, Building2 } from "lucide-react";
import { AdminViewRatePageSkeleton } from "@/features/admin-agents/admin-dashboard/components/AdminViewRatePageSkeleton";
import { fetchAdminPropertyPerformance } from "@/features/admin-agents/admin-dashboard/api/adminDashboard.api";
import { getApiErrorMessage } from "@/lib/http";
import type { PerformanceComparisonItem } from "@/types/agent";
import { Dropdown } from "@/components/ui/dropdown";
import { Toast } from "@/components/ui";
import type { ToastKind } from "@/components/ui/toast";
import {
  Pagination,
  PAGINATION_PAGE_SIZES,
  DEFAULT_PAGINATION_PAGE_SIZE,
  type PaginationPageSize,
} from "@/components/ui/Pagination";

const PERIOD_FILTERS = ["all", "weekly", "monthly", "yearly"] as const;
type PeriodFilter = (typeof PERIOD_FILTERS)[number];

export function AdminViewRatePage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("agentDashboard");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageQuery = searchParams.get("page") ?? "1";
  const pageSizeRaw = Number.parseInt(
    searchParams.get("pageSize") ?? String(DEFAULT_PAGINATION_PAGE_SIZE),
    10,
  );
  const pageSize: PaginationPageSize = PAGINATION_PAGE_SIZES.includes(
    pageSizeRaw as PaginationPageSize,
  )
    ? (pageSizeRaw as PaginationPageSize)
    : DEFAULT_PAGINATION_PAGE_SIZE;

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  const requestedPage = Math.max(1, Number.parseInt(pageQuery, 10) || 1);

  const [items, setItems] = useState<PerformanceComparisonItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
  const errorToastSentRef = useRef(false);

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

  useEffect(() => {
    if (loading) {
      errorToastSentRef.current = false;
      return;
    }
    if (!loadError) {
      return;
    }
    if (errorToastSentRef.current) {
      return;
    }
    errorToastSentRef.current = true;
    setToast({ kind: "error", message: loadError });
  }, [loading, loadError]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setLoading(true);
    setToast(null);
    fetchAdminPropertyPerformance({
      page: requestedPage,
      pageSize,
      period: periodFilter,
    })
      .then((res) => {
        if (!cancelled) {
          setItems(res.items);
          setTotalCount(res.total);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          setTotalCount(0);
          setLoadError(getApiErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requestedPage, pageSize, periodFilter]);

  // If there is no data, drop the period filter (keep UI simple).
  useEffect(() => {
    if (loading || loadError) return;
    if (totalCount !== 0) return;
    if (periodFilter !== "all") {
      setPeriodFilter("all");
    }
  }, [loadError, loading, periodFilter, totalCount]);

  const tSearch = useTranslations("searchResult");

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      });
      // Never persist the period filter in the URL.
      params.delete("period");
      if (!Object.prototype.hasOwnProperty.call(updates, "page")) params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const processedData = useMemo(() => [...items].sort((a, b) => b.value - a.value), [items]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1;

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
    return <AdminViewRatePageSkeleton />;
  }

  if (loadError) {
    const fallbackMessage = loadError || t("loadDashboardError");
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin-dashboard`}
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
          <p className="mt-2 text-sm text-red-700" role="alert" aria-live="assertive">
            {fallbackMessage}
          </p>
        </div>
        {toast ? (
          <Toast
            kind={toast.kind}
            message={toast.message}
            duration={6000}
            onClose={() => setToast(null)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin-dashboard`}
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
        {!loading && !loadError && totalCount === 0 ? null : (
          <div className="flex flex-1 flex-col sm:flex-row sm:justify-end items-center gap-2">
            <Dropdown
              buttonId="admin-viewrate-period-filter"
              label={t("filterPeriodLabel")}
              value={periodFilter}
              onChange={(val) => {
                const normalized = String(val ?? "").trim().toLowerCase();
                const next: PeriodFilter = PERIOD_FILTERS.includes(normalized as PeriodFilter)
                  ? (normalized as PeriodFilter)
                  : "all";
                setPeriodFilter(next);
                // Reset to page 1 without storing period in URL.
                updateQueryParams({ page: "1" });
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

        <ul className="mt-4 space-y-3">
          {processedData.map((item, idx) => (
            <li
              key={`${currentPage}-${idx}-${item.label}`}
              className="flex items-center justify-between rounded-xl border border-subtle bg-surface px-4 py-3 text-sm"
            >
              <span className="font-medium text-charcoal truncate pr-2">{item.label}</span>
              <span className="text-charcoal/80 shrink-0">
                {item.value} {t("views")}
              </span>
            </li>
          ))}
        </ul>

        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-10 w-10 text-charcoal/40" />
            <p className="py-8 text-center text-sm text-charcoal/60">
              {t("noPropertiesWithViews")}
            </p>
          </div>
        ) : (
          <div className="border-t border-subtle mt-4 pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
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
    </div>
  );
}

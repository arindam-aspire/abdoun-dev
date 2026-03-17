"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { ArrowLeft, Eye, Filter, Building2 } from "lucide-react";
import { getPropertyViewCounts } from "@/services/agentDashboardMockService";
import type { PerformanceComparisonItem } from "@/types/agent";
import { Dropdown } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/Pagination";

const PERIOD_FILTERS = ["all", "weekly", "monthly", "yearly"] as const;
type PeriodFilter = (typeof PERIOD_FILTERS)[number];

function getScaledViews(value: number, period: PeriodFilter): number {
  if (period === "weekly") return Math.max(1, Math.ceil(value / 52));
  if (period === "monthly") return Math.max(1, Math.ceil(value / 12));
  return value; // yearly or all
}

export function AgentViewRatePage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("agentDashboard");
  const [data, setData] = useState<PerformanceComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPropertyViewCounts().then((list) => {
      if (!cancelled) {
        setData(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const periodParam = searchParams.get("period");
  const pageParam = Number(searchParams.get("page") ?? "1");
  const periodFilter: PeriodFilter =
    periodParam && PERIOD_FILTERS.includes(periodParam as PeriodFilter)
      ? (periodParam as PeriodFilter)
      : "all";

  const itemsPerPage = 8;
  const tSearch = useTranslations("searchResult");

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      });
      if (!updates.hasOwnProperty("page")) params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const processedData = useMemo(() => {
    return data
      .map((item) => ({ ...item, value: getScaledViews(item.value, periodFilter) }))
      .sort((a, b) => b.value - a.value);
  }, [data, periodFilter]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, totalPages) : 1;
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <p className="text-charcoal/70">{t("loading")}</p>
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
      <div className="px-1">
        <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
          {t("totalPropertyViewsPageTitle")}
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          {t("totalPropertyViewsPageSubtitle")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-1">
        <div className="flex items-center gap-2 text-xs font-medium text-charcoal/80">
          <Filter className="h-4 w-4" />
          {t("filter")}
        </div>
        <div className="hidden h-4 w-px bg-subtle sm:block" />
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
          <Dropdown
            buttonId="viewrate-period-filter"
            label={t("filterPeriodLabel")}
            value={periodFilter}
            onChange={(val) => updateQueryParams({ period: val })}
            options={periodOptions}
            align="left"
          />
        </div>
      </div>

      <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <Eye className="h-4 w-4 text-emerald-600" />
            {t("totalPropertyViewsListTitle")}
          </h2>
        </div>

        <ul className="mt-4 space-y-3">
          {paginatedData.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-subtle bg-surface px-4 py-3 text-sm"
            >
              <span className="font-medium text-charcoal truncate pr-2">{item.label}</span>
              <span className="text-charcoal/80 shrink-0">
                {item.value} {t("views")}
              </span>
            </li>
          ))}
        </ul>
        
        {processedData.length === 0 ? (
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
              totalItems={processedData.length}
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
        )}
      </article>
    </div>
  );
}

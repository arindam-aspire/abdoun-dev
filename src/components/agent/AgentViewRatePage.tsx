"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { ArrowLeft, Eye } from "lucide-react";
import { getPropertyViewCounts } from "@/services/agentDashboardMockService";
import type { PerformanceComparisonItem } from "@/types/agent";
import { PerformanceBarChart } from "@/components/agent/PerformanceBarChart";

export function AgentViewRatePage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("agentDashboard");
  const [data, setData] = useState<PerformanceComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getPropertyViewCounts().then((list) => {
      setData(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
          {t("viewRatePageTitle")}
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          {t("viewRatePageSubtitle")}
        </p>
      </div>

      <PerformanceBarChart
        data={data}
        title={t("viewRateChartTitle")}
        subtitle={t("viewRateChartSubtitle")}
        valueLabel={t("views")}
      />

      <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal">
          <Eye className="h-4 w-4 text-emerald-600" />
          {t("viewRateListTitle")}
        </h2>
        <ul className="mt-4 space-y-3">
          {data.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-subtle bg-surface px-4 py-3 text-sm"
            >
              <span className="font-medium text-charcoal">{item.label}</span>
              <span className="text-charcoal/80">
                {item.value} {t("views")}
              </span>
            </li>
          ))}
        </ul>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-charcoal/60">
            {t("noPropertiesWithViews")}
          </p>
        ) : null}
      </article>
    </div>
  );
}

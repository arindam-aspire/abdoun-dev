"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { ArrowLeft } from "lucide-react";
import {
  getInquiryTrendDaily,
  getInquiryTrendWeekly,
  getPerformanceComparison,
} from "@/services/agentDashboardMockService";
import { InquiryTrendLineChart } from "@/components/agent/InquiryTrendLineChart";
import { PerformanceBarChart } from "@/components/agent/PerformanceBarChart";
import { SparkBarsChart } from "@/components/agent/SparkBarsChart";

export function AgentTrendsPage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("agentDashboard");
  const [daily, setDaily] = useState<{ date: string; count: number }[]>([]);
  const [weekly, setWeekly] = useState<{ weekLabel: string; count: number }[]>([]);
  const [performance, setPerformance] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getInquiryTrendDaily(),
      getInquiryTrendWeekly(),
      getPerformanceComparison(),
    ]).then(([d, w, p]) => {
      setDaily(d);
      setWeekly(w);
      setPerformance(p);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-charcoal/70">{t("loadingTrends")}</p>
      </div>
    );
  }

  const dailyValues = daily.map((d) => d.count);

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
          {t("detailedTrendsTitle")}
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          {t("detailedTrendsSubtitle")}
        </p>
      </div>

      <InquiryTrendLineChart
        values={dailyValues}
        title={t("dailyInquiryVolume")}
        subtitle={t("dailyInquiryVolumeSubtitle")}
      />

      <SparkBarsChart
        values={weekly.map((w) => w.count)}
        title={t("weeklyAggregation")}
        subtitle={t("last4Weeks")}
        showSummary={true}
      />

      <PerformanceBarChart
        data={performance}
        title={t("performanceComparison")}
        subtitle={t("inquiriesByProperty")}
      />
    </div>
  );
}

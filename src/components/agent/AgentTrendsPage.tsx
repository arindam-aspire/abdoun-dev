"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { ArrowLeft } from "lucide-react";
import { getInquiryTrendWeekly } from "@/services/agentDashboardMockService";
import { SparkBarsChart } from "@/components/agent/SparkBarsChart";

export function AgentTrendsPage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("agentDashboard");
  const [weekly, setWeekly] = useState<{ weekLabel: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getInquiryTrendWeekly().then((w) => {
      if (!cancelled) {
        setWeekly(w);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-charcoal/70">{t("loadingTrends")}</p>
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
          {t("detailedTrendsTitle")}
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          {t("detailedTrendsSubtitle")}
        </p>
      </div>

      <SparkBarsChart
        values={weekly.map((w) => w.count)}
        labels={weekly.map((w) => w.weekLabel)}
        title={t("weeklyAggregation")}
        subtitle={t("last4Weeks")}
        showSummary={true}
        xAxisTitle={t("chartAxisWeek")}
        yAxisTitle={t("chartAxisInquiries")}
        summaryLatestLabel={t("summaryLatestWeek")}
        summaryTotalLabel={t("summaryTotalInquiries")}
        summaryDeltaLabel={t("summaryChangeFromPrevWeek")}
      />
    </div>
  );
}

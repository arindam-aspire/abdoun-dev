"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { ArrowLeft } from "lucide-react";
import { SparkBarsChart } from "@/features/admin-agents/components/shared-charts/SparkBarsChart";
import { useAgentDashboard } from "@/features/admin-agents/agent-dashboard/hooks/useAgentDashboard";
import { aggregateInquiryDailyToFourWeeks } from "@/features/admin-agents/agent-dashboard/utils/aggregateInquiryDailyToFourWeeks";
import { AgentTrendsPageSkeleton } from "@/features/admin-agents/agent-dashboard/components/AgentTrendsPageSkeleton";
import { Toast } from "@/components/ui";
import type { ToastKind } from "@/components/ui/toast";

export function AgentTrendsPage() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("agentDashboard");
  const { data, loading, error } = useAgentDashboard();
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
  const errorToastSentRef = useRef(false);

  const weekly = useMemo(() => {
    const daily = data?.inquiryTrendLast30Days;
    if (!daily?.length) {
      return [];
    }
    return aggregateInquiryDailyToFourWeeks(daily, locale);
  }, [data?.inquiryTrendLast30Days, locale]);

  useEffect(() => {
    if (loading) {
      errorToastSentRef.current = false;
      return;
    }
    if (!error) {
      return;
    }
    if (errorToastSentRef.current) {
      return;
    }
    errorToastSentRef.current = true;
    const message =
      error instanceof Error ? error.message : t("loadDashboardError");
    setToast({ kind: "error", message });
  }, [loading, error, t]);

  if (loading) {
    return <AgentTrendsPageSkeleton />;
  }

  if (error || !data) {
    const fallbackErrorMessage =
      error instanceof Error ? error.message : t("loadDashboardError");

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
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
          <p
            className="mt-1 text-size-sm text-red-700"
            role="alert"
            aria-live="assertive"
          >
            {fallbackErrorMessage}
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="mt-4 inline-flex items-center rounded-lg border border-subtle bg-white px-3 py-2 text-sm font-medium text-charcoal shadow-sm transition hover:bg-surface"
          >
            {t("trendsTryAgain")}
          </button>
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

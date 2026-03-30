"use client";

import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { useAgentDashboard } from "@/features/admin-agents/agent-dashboard/hooks/useAgentDashboard";
import { ChartContainer } from "@/features/admin-agents/components/ChartContainer";
import { InquiryTrendLineChart } from "@/features/admin-agents/components/shared-charts/InquiryTrendLineChart";
import { PerformanceBarChart } from "@/features/admin-agents/components/shared-charts/PerformanceBarChart";
import { useAppSelector } from "@/hooks/storeHooks";
import { useTranslations } from "@/hooks/useTranslations";
import type { AppLocale } from "@/i18n/routing";
import { selectCurrentUser } from "@/store/selectors";
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Eye,
  Handshake,
  Mail,
  Plus,
  ShieldCheck,
  UserSquare2,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";

export function AgentDashboardHome() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("dashboard");
  const tAgent = useTranslations("agentDashboard");
  const user = useAppSelector(selectCurrentUser);
  const { data, performanceData, loading } = useAgentDashboard();

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="px-1">
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            {tAgent("agentDashboardTitle")}
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">{tAgent("loading")}</p>
        </div>
      </div>
    );
  }

  const shortMonthParam = new Date().toISOString().slice(2, 7);

  const metricCards = [
    {
      label: tAgent("myListings"),
      value: String(data.totalProperties),
      deltaTrend: 2,
      icon: Building2,
      iconBgClassName:
        "bg-[var(--color-charcoal)]/8 ring-1 ring-[var(--color-charcoal)]/15",
      href: `/${locale}/agent-dashboard/listings`,
      subLine: null as string | null,
    },
    {
      label: tAgent("leadsThisMonth"),
      value: String(data.leadsThisMonth),
      deltaTrend: -1,
      icon: Mail,
      iconBgClassName:
        "bg-[var(--color-royal-blue)]/12 ring-1 ring-[var(--color-royal-blue)]/20",
      href: `/${locale}/agent-dashboard/leads?month=${encodeURIComponent(shortMonthParam)}`,
      subLine: null as string | null,
    },
    {
      label: tAgent("dealCloseCount"),
      value: String(data.dealCloseCount),
      deltaTrend: 3,
      icon: Handshake,
      iconBgClassName: "bg-amber-500/14 ring-1 ring-amber-500/20",
      href: `/${locale}/agent-dashboard/deals?status=closed`,
      subLine: `${tAgent("conversionRateLabel")}: ${data.conversionRate}%`,
      subLineClassName: "text-amber-700/80",
    },
    {
      label: tAgent("totalPropertyViews"),
      value: String(data.totalPropertyViews),
      deltaTrend: 0.5,
      icon: Eye,
      iconBgClassName: "bg-emerald-500/14 ring-1 ring-emerald-500/20",
      href: `/${locale}/agent-dashboard/view-rate`,
      subLine: null as string | null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
          {tAgent("agentDashboardTitle")}
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          {t("welcomeAgent")} · {user?.name ?? user?.email ?? "agent@abdoun.com"}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((item) => (
          <DashboardMetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ChartContainer href={`/${locale}/agent-dashboard/trends`}>
          <InquiryTrendLineChart
            values={data.inquiryTrendLast30Days}
            title={tAgent("inquiryTrendTitle")}
            viewDetailsLabel={tAgent("viewDetails")}
            xAxisTitle={tAgent("chartAxisDay")}
            yAxisTitle={tAgent("chartAxisInquiries")}
          />
        </ChartContainer>
        <ChartContainer href={`/${locale}/agent-dashboard/view-rate`}>
          <PerformanceBarChart
            data={performanceData}
            title={tAgent("propertyPerformance")}
            viewDetailsLabel={tAgent("viewDetails")}
            xAxisTitle={tAgent("chartAxisViews")}
            yAxisTitle={tAgent("chartAxisProperty")}
          />
        </ChartContainer>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            {tAgent("quickActions")}
          </h2>
          <div className="mt-4 space-y-2">
            <Link
              href={`/${locale}/agent-dashboard/add-property`}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>{tAgent("addNewProperty")}</span>
              <Plus className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/agent-dashboard/listings`}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>{tAgent("manageListings")}</span>
              <Building2 className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/agent-dashboard/inquiries`}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>{tAgent("inquiryInbox")}</span>
              <Mail className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/agent-dashboard/inquiries?view=deal-close&status=closed`}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>{tAgent("dealCloseQuickActionLabel") ?? "Deal closed"}</span>
              <Handshake className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/agent-dashboard`}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>{tAgent("editProfile")}</span>
              <UserSquare2 className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-semibold text-charcoal">{tAgent("recentActivity")}</h2>
          <div className="mt-4 space-y-2">
            {data.recentActivity.map((item) => (
              <div
                key={`${item.text}-${item.time}`}
                className="rounded-xl border border-subtle bg-surface px-3 py-2"
              >
                <div className="flex items-start gap-2">
                  {item.tone === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : item.tone === "warning" ? (
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  ) : (
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  )}
                  <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                    <p className="text-sm text-charcoal">{item.text}</p>
                    <span className="text-xs text-charcoal/65 shrink-0">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}


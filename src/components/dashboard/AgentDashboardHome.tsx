"use client";

import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Eye,
  Handshake,
  Mail,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserSquare2,
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/routing";
import { useTranslations } from "@/hooks/useTranslations";
import { useAppSelector } from "@/hooks/storeHooks";
import { useEffect, useState } from "react";
import {
  getDashboardData,
  getPerformanceComparison,
} from "@/services/agentDashboardMockService";
import type { AgentDashboardData, PerformanceComparisonItem } from "@/types/agent";
import { InquiryTrendLineChart } from "@/components/agent/InquiryTrendLineChart";
import { PerformanceBarChart } from "@/components/agent/PerformanceBarChart";

export function AgentDashboardHome() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("dashboard");
  const tAgent = useTranslations("agentDashboard");
  const user = useAppSelector((state) => state.auth.user);
  const [data, setData] = useState<AgentDashboardData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getDashboardData(), getPerformanceComparison()]).then(
      ([dashboard, performance]) => {
        if (!cancelled) {
          setData(dashboard);
          setPerformanceData(performance);
          setLoading(false);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

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

  const metricCards = [
    {
      label: tAgent("myListings"),
      value: String(data.totalProperties),
      delta: tAgent("myListingsDelta"),
      deltaTrend: 2,
      icon: Building2,
      iconBgClass:
        "bg-[var(--color-charcoal)]/8 ring-1 ring-[var(--color-charcoal)]/15",
      href: `/${locale}/agent-dashboard/listings`,
    },
    {
      label: tAgent("leadsThisMonth"),
      value: String(data.leadsThisMonth),
      delta: tAgent("leadsThisMonthDelta"),
      deltaTrend: -1,
      icon: Mail,
      iconBgClass:
        "bg-[var(--color-royal-blue)]/12 ring-1 ring-[var(--color-royal-blue)]/20",
      href: `/${locale}/agent-dashboard/inquiries`,
    },
    {
      label: tAgent("viewRate"),
      value: `${data.viewRate}%`,
      delta: tAgent("viewRateDelta"),
      deltaTrend: 0.5,
      icon: Eye,
      iconBgClass: "bg-emerald-500/14 ring-1 ring-emerald-500/20",
      href: `/${locale}/agent-dashboard/view-rate`,
    },
    {
      label: tAgent("dealCloseCount"),
      value: String(data.dealCloseCount),
      delta: tAgent("dealCloseCountDelta"),
      deltaTrend: 3,
      icon: Handshake,
      iconBgClass: "bg-amber-500/14 ring-1 ring-amber-500/20",
      href: `/${locale}/agent-dashboard/inquiries?status=closed`,
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
        {metricCards.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-charcoal/70">{item.label}</p>
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${item.iconBgClass}`}
                >
                  <Icon className="h-4 w-4 text-secondary" />
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-2xl font-semibold text-charcoal">{item.value}</p>
                {item.deltaTrend !== 0 && (
                  <span
                    className={`flex items-center gap-1.5 text-sm font-medium ${
                      item.deltaTrend > 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {item.deltaTrend > 0 && (
                      <TrendingUp className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    {item.deltaTrend < 0 && (
                      <TrendingDown className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    {item.deltaTrend > 0 ? `+${item.deltaTrend}%` : `${item.deltaTrend}%`}
                  </span>
                )}
              </div>
            </>
          );
          return (
            <article
              key={item.label}
              className="rounded-2xl border border-subtle bg-white p-4 shadow-sm"
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="block transition hover:bg-surface/50 rounded-xl -m-2 p-2"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Link
          href={`/${locale}/agent-dashboard/trends`}
          className="block transition hover:opacity-95"
        >
          <InquiryTrendLineChart
            values={data.inquiryTrendLast30Days}
            title={tAgent("inquiryTrendTitle")}
            subtitle={tAgent("inquiryTrendSubtitle")}
          />
        </Link>
        <PerformanceBarChart
          data={performanceData}
          title={tAgent("performanceComparison")}
          subtitle={tAgent("inquiriesByProperty")}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <CircleAlert className="h-4 w-4 text-amber-600" />
            {tAgent("inquiryOverview")}
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-subtle bg-surface p-3">
              <p className="text-xs font-semibold text-charcoal">{tAgent("allTime")}</p>
              <p className="mt-2 text-2xl font-semibold text-secondary">
                {data.inquiryVolumeAllTime}
              </p>
              <p className="mt-1 text-xs text-charcoal/70">{tAgent("totalInquiries")}</p>
            </div>
            <div className="rounded-xl border border-subtle bg-surface p-3">
              <p className="text-xs font-semibold text-charcoal">{tAgent("last7Days")}</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-700">
                {data.inquiryVolumeLast7Days}
              </p>
              <p className="mt-1 text-xs text-charcoal/70">{tAgent("newThisWeek")}</p>
            </div>
            <div className="rounded-xl border border-subtle bg-surface p-3">
              <p className="text-xs font-semibold text-charcoal">{tAgent("activeProperties")}</p>
              <p className="mt-2 text-2xl font-semibold text-charcoal">
                {data.activeProperties}
              </p>
              <p className="mt-1 text-xs text-charcoal/70">{tAgent("liveOnPlatform")}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            {tAgent("quickActions")}
          </h2>
          <div className="mt-4 space-y-2">
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
              href={`/${locale}/agent-dashboard`}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>{tAgent("editProfile")}</span>
              <UserSquare2 className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-charcoal">{tAgent("listingsSummary")}</h2>
            <Link
              href={`/${locale}/agent-dashboard/listings`}
              className="inline-flex items-center gap-1 rounded-full border border-subtle bg-surface px-2 py-1 text-[11px] text-charcoal/75 hover:bg-primary/5"
            >
              <Building2 className="h-3.5 w-3.5" />
              {data.totalProperties} total · {tAgent("manageListings")}
            </Link>
          </div>
          <div className="mt-4 rounded-xl border border-subtle bg-surface p-4">
            <p className="text-xs text-charcoal/65">{t("mockNotice")}</p>
            <p className="mt-2 text-sm text-charcoal">
              {tAgent("listingsSummaryNote", { active: data.activeProperties, draft: data.draftProperties })}
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-semibold text-charcoal">{tAgent("recentActivity")}</h2>
          <div className="mt-4 space-y-3">
            {data.recentActivity.map((item) => (
              <div
                key={`${item.text}-${item.time}`}
                className="rounded-xl border border-subtle bg-surface p-3"
              >
                <div className="flex items-start gap-2">
                  {item.tone === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : item.tone === "warning" ? (
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  ) : (
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  )}
                  <div>
                    <p className="text-sm text-charcoal">{item.text}</p>
                    <p className="mt-1 text-xs text-charcoal/65">{item.time}</p>
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

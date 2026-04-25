"use client";

import { useAdminDashboard } from "@/features/admin-agents/admin-dashboard/hooks/useAdminDashboard";
import { useAdminAgentsTotalForDashboard } from "@/features/admin-agents/admin-dashboard/hooks/useAdminAgentsTotalForDashboard";
import { AdminDashboardHomeSkeleton } from "@/features/admin-agents/admin-dashboard/components/AdminDashboardHomeSkeleton";
import { DotLineChart } from "@/features/admin-agents/components/shared-charts/DotLineChart";
import { InquiryTrendLineChart } from "@/features/admin-agents/components/shared-charts/InquiryTrendLineChart";
import { SparkBarsChart } from "@/features/admin-agents/components/shared-charts/SparkBarsChart";
import type { AppLocale } from "@/i18n/routing";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { Toast } from "@/components/ui";
import type { ToastKind } from "@/components/ui/toast";
import { useTranslations } from "@/hooks/useTranslations";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  UserPlus,
  Users
} from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import Link from "next/link";
import { PerformanceBarChart } from "../../components/shared-charts/PerformanceBarChart";

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

type KpiCard = {
  label: string;
  value: string;
  delta: string;
  deltaTrend?: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "neutral" | "info" | "warning" | "success";
};

type QueueItemStatus = "pending" | "review" | "approved";

type QueueItem = {
  ref: string;
  title: string;
  submittedBy: string;
  city: string;
  submittedAt: string;
  status: QueueItemStatus;
};

type LeadSource = {
  source: string;
  leads: number;
  conversionRate: string;
  share: number;
};

type ActivityItem = {
  text: string;
  time: string;
  tone: "neutral" | "success" | "warning";
};

type TopAgent = {
  name: string;
  closedDeals: number;
  responseRate: string;
  area: string;
};

/* ------------------------------------------------------------------ */
/*  Static mock data (non-KPI sections)                                */
/* ------------------------------------------------------------------ */
const RECENT_ACTIVITY: ActivityItem[] = [
  {
    text: "Agent profile approved for Sami Haddad.",
    time: "2 min ago",
    tone: "success",
  },
  {
    text: "Property PROP-4832 flagged for missing floor plan.",
    time: "9 min ago",
    tone: "warning",
  },
  {
    text: "New enterprise lead assigned to Sales Team A.",
    time: "18 min ago",
    tone: "neutral",
  },
  {
    text: "Weekly report exported by Admin User.",
    time: "35 min ago",
    tone: "neutral",
  },
];

const TOP_AGENTS: TopAgent[] = [
  { name: "Leen Khoury", closedDeals: 24, responseRate: "97%", area: "Abdoun" },
  {
    name: "Omar Shdeifat",
    closedDeals: 19,
    responseRate: "94%",
    area: "Dabouq",
  },
  {
    name: "Dana Abu-Taleb",
    closedDeals: 17,
    responseRate: "95%",
    area: "Khalda",
  },
];

/* ------------------------------------------------------------------ */
/*  Style helpers                                                      */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function statusPillClass(status: QueueItemStatus): string {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (status === "review") {
    return "bg-sky-100 text-sky-800 border-sky-200";
  }
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function kpiToneClass(tone: KpiCard["tone"]): {
  iconWrap: string;
  icon: string;
  value: string;
  delta: string;
} {
  if (tone === "warning") {
    return {
      iconWrap: "bg-amber-500/14 ring-1 ring-amber-500/20",
      icon: "text-amber-700",
      value: "text-amber-700",
      delta: "text-amber-700",
    };
  }
  if (tone === "info") {
    return {
      iconWrap:
        "bg-[var(--color-royal-blue)]/12 ring-1 ring-[var(--color-royal-blue)]/20",
      icon: "text-secondary",
      value: "text-secondary",
      delta: "text-secondary",
    };
  }
  if (tone === "success") {
    return {
      iconWrap: "bg-emerald-500/14 ring-1 ring-emerald-500/20",
      icon: "text-emerald-700",
      value: "text-emerald-700",
      delta: "text-emerald-700",
    };
  }
  return {
    iconWrap: "bg-[var(--color-charcoal)]/8 ring-1 ring-[var(--color-charcoal)]/15",
    icon: "text-[var(--color-charcoal)]/80",
    value: "text-[var(--color-charcoal)]",
    delta: "text-[var(--color-charcoal)]/70",
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatDelta(value: number, suffix = ""): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value}${suffix} vs last month`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminDashboardHome() {
  const locale = useLocale() as AppLocale;
  const tDashboard = useTranslations("dashboard");
  const { data, loading, error } = useAdminDashboard();
  const { valueLabel: totalAgentsLabel } = useAdminAgentsTotalForDashboard();
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
  const errorToastSentRef = useRef(false);

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
    setToast({
      kind: "error",
      message: error.message || tDashboard("loadAdminSummaryError"),
    });
  }, [loading, error, tDashboard]);

  if (loading) {
    return <AdminDashboardHomeSkeleton />;
  }

  if (error || !data) {
    const fallbackMessage = error?.message || tDashboard("loadAdminSummaryError");
    return (
      <div className="space-y-6">
        <div className="px-1">
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-size-sm text-red-700" role="alert" aria-live="assertive">
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

  const monthParam = data.month;
  const shortMonthParam = data.month.slice(2);

  const metricCards: Array<
    {
      id: "totalAgents" | "users" | "closedDeals" | "pendingApprovals" | "listings" | "leads";
    } & Omit<ComponentProps<typeof DashboardMetricCard>, "className">
  > = [
    (() => {
      const toneClass = kpiToneClass("info");
      return {
        id: "totalAgents",
        label: tDashboard("totalAgentsKpi"),
        value: totalAgentsLabel,
        icon: UserPlus,
        href: `/${locale}/agents`,
        iconBgClassName: toneClass.iconWrap,
        iconClassName: toneClass.icon,
        valueClassName: toneClass.value,
        deltaTrend: null,
        subLine: tDashboard("totalAgentsKpiSub"),
        subLineClassName: toneClass.delta,
      };
    })(),
    (() => {
      const toneClass = kpiToneClass("neutral");
      return {
        id: "users",
        label: "Users this Month",
        value: data.usersThisMonth.toLocaleString(),
        icon: Users,
        href: `/${locale}/users?month=${encodeURIComponent(monthParam)}`,
        iconBgClassName: toneClass.iconWrap,
        iconClassName: toneClass.icon,
        valueClassName: toneClass.value,
        deltaTrend: data.usersMoMDelta,
      };
    })(),
    (() => {
      const toneClass = kpiToneClass("success");
      const conversionRate =
        data.leadsThisMonth > 0
          ? ((data.closedDealsThisMonth / data.leadsThisMonth) * 100).toFixed(1)
          : "0.0";
      return {
        id: "closedDeals",
        label: "Deal Closed this Month",
        value: data.closedDealsThisMonth.toLocaleString(),
        icon: CheckCircle2,
        href: `/${locale}/deals?month=${encodeURIComponent(shortMonthParam)}`,
        iconBgClassName: toneClass.iconWrap,
        iconClassName: toneClass.icon,
        valueClassName: toneClass.value,
        deltaTrend: null,
        subLine: `Conversion Rate: ${conversionRate}%`,
        subLineClassName: toneClass.delta,
      };
    })(),
    (() => {
      const toneClass = kpiToneClass("warning");
      return {
        id: "pendingApprovals",
        label: "Pending Approvals",
        value: String(data.pendingApprovals),
        icon: Clock3,
        href: `/${locale}/listings?status=pending_approval`,
        iconBgClassName: toneClass.iconWrap,
        iconClassName: toneClass.icon,
        valueClassName: toneClass.value,
        subLine: `+${data.pendingApprovalsToday} today`,
        subLineClassName: toneClass.delta,
      };
    })(),
    (() => {
      const toneClass = kpiToneClass("info");
      return {
        id: "listings",
        label: "Listings this Month",
        value: data.listingsThisMonth.toLocaleString(),
        icon: Building2,
        href: `/${locale}/listings?month=${encodeURIComponent(shortMonthParam)}`,
        iconBgClassName: toneClass.iconWrap,
        iconClassName: toneClass.icon,
        valueClassName: toneClass.value,
        deltaTrend: data.listingsMoMDelta,
      };
    })(),
    (() => {
      const toneClass = kpiToneClass("success");
      return {
        id: "leads",
        label: "Leads this Month",
        value: data.leadsThisMonth.toLocaleString(),
        icon: BarChart3,
        href: `/${locale}/leads?month=${encodeURIComponent(shortMonthParam)}`,
        iconBgClassName: toneClass.iconWrap,
        iconClassName: toneClass.icon,
        valueClassName: toneClass.value,
        deltaTrend: data.leadsMoMDelta,
      };
    })(),
  ];

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          Monthly overview of platform growth and operations.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metricCards.map(({ id, ...card }) => (
          <DashboardMetricCard key={id} {...card} className="transition hover:shadow-md" useLink={false} />
        ))}
      </section>

      {/* ── Charts (Chart.js) ── */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link href={`/${locale}/admin-dashboard/user-growth`} className="block transition hover:opacity-95">
          <InquiryTrendLineChart
            labels={data.monthLabels}
            values={data.userGrowthSeries}
            title="User growth"
            subtitle="New user signups over the last 12 months"
            viewDetailsLabel="View details"
            xAxisTitle="Month"
            yAxisTitle="Users"
          />
        </Link>
        <Link
          href={`/${locale}/admin-dashboard/listing-activity`}
          className="block transition hover:opacity-95"
        >
          <SparkBarsChart
            labels={data.monthLabels}
            values={data.listingGrowthSeries}
            title="Listed Properties"
            subtitle="New listings created per month"
            viewDetailsLabel="View details"
          />
        </Link>
        <Link
          href={`/${locale}/admin-dashboard/lead-volume`}
          className="block transition hover:opacity-95"
        >
          <DotLineChart
            labels={data.monthLabels}
            values={data.leadGrowthSeries}
            title="Lead volume"
            subtitle="Total leads generated per month"
            viewDetailsLabel="View details"
          />
        </Link>
        <Link
          href={`/${locale}/admin-dashboard/view-rate`}
          className="block transition hover:opacity-95"
        >
          <PerformanceBarChart
            data={data.propertyPerformanceSeries}
            title="Property Performance"
            viewDetailsLabel="View details"
            xAxisTitle="Views"
            yAxisTitle="Property"
          />
        </Link>
      </section>
 
      {/* ── Quick actions + Recent activity ── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            Quick actions
          </h2>
          <div className="mt-4 space-y-2">
            <Link
              href={`/${locale}/agents`}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>Review agents</span>
              <UserPlus className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/users`}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>View users</span>
              <Users className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>Review listings</span>
              <Building2 className="h-4 w-4" />
            </button>
            <Link
              href={`/${locale}/leads`}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-charcoal transition hover:bg-primary/5"
            >
              <span>View leads</span>
              <BarChart3 className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-semibold text-charcoal">
            Recent activity
          </h2>
          <div className="mt-4 space-y-2">
            {RECENT_ACTIVITY.map((item) => (
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
            <div className="rounded-xl border border-dashed border-subtle bg-white px-3 py-2">
              <p className="flex items-center gap-2 text-xs text-charcoal/70">
                <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                Support line queue currently: 6 active tickets.
              </p>
            </div>
          </div>
        </article>
      </section>
           {/* ── Top agents ── */}
      <section className="grid gap-4">
        <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-semibold text-charcoal">Top agents this month</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {TOP_AGENTS.map((agent) => (
              <div key={agent.name} className="rounded-xl border border-subtle bg-surface p-3">
                <p className="text-sm font-semibold text-charcoal">{agent.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-charcoal/70">
                  <MapPin className="h-3.5 w-3.5" />
                  {agent.area}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-charcoal/65">Deals</p>
                    <p className="mt-1 text-sm font-semibold text-secondary">{agent.closedDeals}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-charcoal/65">Response</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">{agent.responseRate}</p>
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


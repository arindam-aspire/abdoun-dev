"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  UserSquare2,
} from "lucide-react";

type KpiCard = {
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
};

const KPI_CARDS: KpiCard[] = [
  { label: "Total users", value: "18,420", delta: "+4.2% MoM", icon: Users },
  { label: "Total agents", value: "642", delta: "+2.1% MoM", icon: UserSquare2 },
  { label: "Pending approvals", value: "56", delta: "+8 today", icon: Clock3 },
  { label: "Active listings", value: "1,248", delta: "+32 this week", icon: Building2 },
  { label: "Total leads", value: "3,904", delta: "+11.6% MoM", icon: BarChart3 },
];

const USERS_SERIES = [24, 28, 31, 34, 39, 45, 49, 58, 66, 71, 82, 93];
const LISTINGS_SERIES = [14, 18, 21, 19, 26, 30, 33, 37, 35, 42, 48, 52];
const LEADS_SERIES = [56, 61, 58, 72, 69, 81, 90, 97, 88, 102, 113, 126];

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

const APPROVAL_QUEUE: QueueItem[] = [
  {
    ref: "PROP-4832",
    title: "Modern Villa, Abdoun",
    submittedBy: "Nour Al-Hassan",
    city: "Amman",
    submittedAt: "08:45 AM",
    status: "pending",
  },
  {
    ref: "PROP-4821",
    title: "Commercial Office, Sweifieh",
    submittedBy: "Ahmad Darwish",
    city: "Amman",
    submittedAt: "09:10 AM",
    status: "review",
  },
  {
    ref: "PROP-4817",
    title: "Apartment, Dabouq",
    submittedBy: "Rana Majali",
    city: "Amman",
    submittedAt: "09:44 AM",
    status: "pending",
  },
  {
    ref: "PROP-4799",
    title: "Land Parcel, Airport Road",
    submittedBy: "Hadeel Naser",
    city: "Amman",
    submittedAt: "10:18 AM",
    status: "approved",
  },
];

const LEAD_SOURCES: LeadSource[] = [
  { source: "Organic Search", leads: 1264, conversionRate: "12.4%", share: 41 },
  { source: "WhatsApp", leads: 894, conversionRate: "16.8%", share: 29 },
  { source: "Meta Ads", leads: 621, conversionRate: "9.6%", share: 20 },
  { source: "Direct Referral", leads: 299, conversionRate: "18.1%", share: 10 },
];

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

function statusPillClass(status: QueueItemStatus): string {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (status === "review") {
    return "bg-sky-100 text-sky-800 border-sky-200";
  }
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function SparkBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-36 items-end gap-2">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex-1">
          <div
            className="w-full rounded-t-sm bg-[var(--brand-primary)]/80 transition-all"
            style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
            title={String(value)}
          />
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  values,
}: {
  title: string;
  subtitle: string;
  values: number[];
}) {
  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm md:p-5">
      <h3 className="text-sm font-semibold text-[var(--color-charcoal)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--color-charcoal)]/65">{subtitle}</p>
      <div className="mt-4">
        <SparkBars values={values} />
      </div>
    </section>
  );
}

export function AdminDashboardHome() {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
              Admin Console
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--color-charcoal)] md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-[var(--color-charcoal)]/70">
              Overview of platform growth, moderation queue, and operational actions.
            </p>
          </div>
          <div className="hidden rounded-xl bg-[var(--surface)] px-3 py-2 text-xs text-[var(--color-charcoal)]/70 md:block">
            Updated just now
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {KPI_CARDS.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[var(--color-charcoal)]/70">{item.label}</p>
                <Icon className="h-4 w-4 text-[var(--brand-secondary)]" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-[var(--color-charcoal)]">{item.value}</p>
              <p className="mt-1 text-xs text-emerald-700">{item.delta}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="New users over time"
          subtitle="Last 12 months user signups"
          values={USERS_SERIES}
        />
        <ChartCard
          title="New listings over time"
          subtitle="Last 12 months listing creation"
          values={LISTINGS_SERIES}
        />
        <ChartCard
          title="Leads / inquiries volume"
          subtitle="Last 12 months lead activity"
          values={LEADS_SERIES}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm md:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-charcoal)]">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Alerts panel
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
              <p className="text-xs font-semibold text-[var(--color-charcoal)]">Pending agent KYC approvals</p>
              <p className="mt-2 text-2xl font-semibold text-amber-700">21</p>
              <p className="mt-1 text-xs text-[var(--color-charcoal)]/70">Needs manual verification</p>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
              <p className="text-xs font-semibold text-[var(--color-charcoal)]">Pending property approvals</p>
              <p className="mt-2 text-2xl font-semibold text-amber-700">35</p>
              <p className="mt-1 text-xs text-[var(--color-charcoal)]/70">Awaiting moderation</p>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
              <p className="text-xs font-semibold text-[var(--color-charcoal)]">Subscription expiries</p>
              <p className="mt-2 text-2xl font-semibold text-rose-700">14</p>
              <p className="mt-1 text-xs text-[var(--color-charcoal)]/70">Expiring within 7 days</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm md:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-charcoal)]">
            <ShieldCheck className="h-4 w-4 text-[var(--brand-secondary)]" />
            Quick actions
          </h2>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--color-charcoal)] transition hover:bg-[var(--brand-primary)]/5"
            >
              <span>Review agents</span>
              <UserPlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--color-charcoal)] transition hover:bg-[var(--brand-primary)]/5"
            >
              <span>Review listings</span>
              <Building2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--color-charcoal)] transition hover:bg-[var(--brand-primary)]/5"
            >
              <span>View leads</span>
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--color-charcoal)]">
              Moderation queue
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--color-charcoal)]/75">
              <Clock3 className="h-3.5 w-3.5" />
              {APPROVAL_QUEUE.length} items
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--color-charcoal)]/65">
                  <th className="px-2 py-2 font-medium">Reference</th>
                  <th className="px-2 py-2 font-medium">Property</th>
                  <th className="px-2 py-2 font-medium">Submitted by</th>
                  <th className="px-2 py-2 font-medium">City</th>
                  <th className="px-2 py-2 font-medium">Time</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {APPROVAL_QUEUE.map((item) => (
                  <tr
                    key={item.ref}
                    className="border-b border-[var(--border-subtle)]/70 text-sm last:border-b-0"
                  >
                    <td className="px-2 py-3 font-medium text-[var(--brand-secondary)]">
                      {item.ref}
                    </td>
                    <td className="px-2 py-3 text-[var(--color-charcoal)]">
                      {item.title}
                    </td>
                    <td className="px-2 py-3 text-[var(--color-charcoal)]/80">
                      {item.submittedBy}
                    </td>
                    <td className="px-2 py-3 text-[var(--color-charcoal)]/80">
                      {item.city}
                    </td>
                    <td className="px-2 py-3 text-[var(--color-charcoal)]/70">
                      {item.submittedAt}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-medium capitalize ${statusPillClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm md:p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-charcoal)]">
            <TrendingUp className="h-4 w-4 text-[var(--brand-secondary)]" />
            Lead source quality
          </h2>
          <div className="mt-4 space-y-3">
            {LEAD_SOURCES.map((item) => (
              <div
                key={item.source}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-charcoal)]/80">
                  <span className="font-medium">{item.source}</span>
                  <span>{item.conversionRate} CVR</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-[var(--color-charcoal)]">
                  {item.leads.toLocaleString()} leads
                </p>
                <div className="mt-2 h-2 rounded-full bg-white">
                  <div
                    className="h-2 rounded-full bg-[var(--brand-primary)]"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-semibold text-[var(--color-charcoal)]">
            Top agents this month
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {TOP_AGENTS.map((agent) => (
              <div
                key={agent.name}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3"
              >
                <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                  {agent.name}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-charcoal)]/70">
                  <MapPin className="h-3.5 w-3.5" />
                  {agent.area}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-[var(--color-charcoal)]/65">Deals</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--brand-secondary)]">
                      {agent.closedDeals}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-[var(--color-charcoal)]/65">Response</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                      {agent.responseRate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm md:p-5">
          <h2 className="text-sm font-semibold text-[var(--color-charcoal)]">
            Recent activity
          </h2>
          <div className="mt-4 space-y-3">
            {RECENT_ACTIVITY.map((item) => (
              <div
                key={`${item.text}-${item.time}`}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3"
              >
                <div className="flex items-start gap-2">
                  {item.tone === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  ) : item.tone === "warning" ? (
                    <CircleAlert className="mt-0.5 h-4 w-4 text-amber-600" />
                  ) : (
                    <Mail className="mt-0.5 h-4 w-4 text-[var(--brand-secondary)]" />
                  )}
                  <div>
                    <p className="text-sm text-[var(--color-charcoal)]">{item.text}</p>
                    <p className="mt-1 text-xs text-[var(--color-charcoal)]/65">
                      {item.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-white p-3">
              <p className="flex items-center gap-2 text-xs text-[var(--color-charcoal)]/70">
                <PhoneCall className="h-3.5 w-3.5" />
                Support line queue currently: 6 active tickets.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

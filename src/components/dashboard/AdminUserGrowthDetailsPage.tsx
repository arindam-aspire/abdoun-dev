 "use client";


import type { AppLocale } from "@/i18n/routing";
import { getAdminDashboardData } from "@/services/adminDashboardMockService";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { SparkBarsChart } from "@/features/admin-agents/components/shared-charts/SparkBarsChart";

type Row = {
  label: string;
  value: number;
};

export function AdminUserGrowthDetailsPage() {
  const locale = useLocale() as AppLocale;
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAdminDashboardData().then((data) => {
      if (cancelled) return;
      setLabels(data.monthLabels);
      setValues(data.userGrowthSeries);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo<Row[]>(() => {
    return labels.map((label, idx) => ({
      label,
      value: values[idx] ?? 0,
    }));
  }, [labels, values]);

  const insights = useMemo(() => {
    const latest = values.at(-1) ?? 0;
    const prev = values.at(-2) ?? latest;
    const delta = latest - prev;
    const total = values.reduce((sum, v) => sum + v, 0);
    const avg = values.length > 0 ? total / values.length : 0;

    let best = { label: labels[0] ?? "-", value: values[0] ?? 0 };
    for (let i = 0; i < values.length; i++) {
      const v = values[i] ?? 0;
      if (v > best.value) best = { label: labels[i] ?? "-", value: v };
    }

    return { latest, prev, delta, total, avg, best };
  }, [labels, values]);

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-charcoal/70">Loading trends...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/80 hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="px-1">
        <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
          User growth details
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          Monthly signups over the last 12 months.
        </p>
      </div>

      <SparkBarsChart
        values={values}
        labels={labels}
        title="User growth"
        subtitle="New user signups over the last 12 months"
        showAllXTicks={true}
        showValueLabels={true}
        showSummary={false}
        xAxisTitle="Month"
        yAxisTitle="Users"
      />

      <section className="rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-charcoal">Monthly breakdown</h2>
            <p className="mt-1 text-xs text-charcoal/65">
              Quick insights and month-by-month totals.
            </p>
          </div>
          <p className="text-xs text-charcoal/60">Last 12 months</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-subtle bg-surface px-3 py-2">
            <p className="text-xs text-charcoal/65">Latest month</p>
            <p className="mt-0.5 text-sm font-semibold text-charcoal">
              {insights.latest.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-subtle bg-surface px-3 py-2">
            <p className="text-xs text-charcoal/65">Change vs previous</p>
            <p
              className={`mt-0.5 text-sm font-semibold ${
                insights.delta >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {insights.delta >= 0 ? `+${insights.delta}` : insights.delta}
            </p>
          </div>
          <div className="rounded-xl border border-subtle bg-surface px-3 py-2">
            <p className="text-xs text-charcoal/65">Average / month</p>
            <p className="mt-0.5 text-sm font-semibold text-charcoal">
              {Math.round(insights.avg).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-subtle bg-surface px-3 py-2">
            <p className="text-xs text-charcoal/65">Best month</p>
            <p className="mt-0.5 text-sm font-semibold text-charcoal">
              {insights.best.label} · {insights.best.value.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[520px] w-full border-collapse">
            <thead>
              <tr className="border-b border-subtle text-left text-xs text-charcoal/70">
                <th className="py-2 pr-4 font-medium">Month</th>
                <th className="py-2 pr-4 font-medium">New users</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isBest = row.label === insights.best.label;
                return (
                  <tr
                    key={row.label}
                    className={`border-b border-subtle/70 ${isBest ? "bg-primary/5" : ""}`}
                  >
                    <td className="py-2 pr-4 text-sm text-charcoal">
                      <span className="inline-flex items-center gap-2">
                        <span>{row.label}</span>
                        {isBest ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                            Best
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-sm font-semibold text-charcoal">
                      {row.value.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-subtle">
                <td className="py-2 pr-4 text-sm font-medium text-charcoal/70">Total</td>
                <td className="py-2 pr-4 text-sm font-semibold text-charcoal">
                  {insights.total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}


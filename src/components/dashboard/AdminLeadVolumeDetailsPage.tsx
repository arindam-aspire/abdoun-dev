"use client";

import type { AppLocale } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { InquiryTrendLineChart } from "@/features/admin-agents/components/shared-charts/InquiryTrendLineChart";
import { AdminLeadVolumeDetailsPageSkeleton } from "@/features/admin-agents/admin-dashboard/components/AdminLeadVolumeDetailsPageSkeleton";
import { Toast } from "@/components/ui";
import type { ToastKind } from "@/components/ui/toast";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  loadAdminDashboardSummary,
  selectAdminDashboardSummary,
} from "@/features/admin-agents/admin-dashboard/adminDashboardSummarySlice";

type Row = {
  label: string;
  value: number;
};

export function AdminLeadVolumeDetailsPage() {
  const locale = useLocale() as AppLocale;
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector(selectAdminDashboardSummary);
  const [toast, setToast] = useState<{ kind: ToastKind; message: string } | null>(null);
  const errorToastSentRef = useRef(false);

  useEffect(() => {
    void dispatch(loadAdminDashboardSummary());
  }, [dispatch]);

  const loading = status === "loading" || (status === "idle" && !data);

  useEffect(() => {
    if (loading) {
      errorToastSentRef.current = false;
      return;
    }
    if (status !== "failed" || !error) {
      return;
    }
    if (errorToastSentRef.current) {
      return;
    }
    errorToastSentRef.current = true;
    setToast({ kind: "error", message: error });
  }, [loading, status, error]);

  const labels = data?.monthLabels ?? [];
  const values = data?.leadGrowthSeries ?? [];

  const rows = useMemo<Row[]>(() => {
    return labels.map((label, idx) => ({ label, value: values[idx] ?? 0 }));
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

    return { latest, delta, total, avg, best };
  }, [labels, values]);

  if (loading) {
    return <AdminLeadVolumeDetailsPageSkeleton />;
  }

  if (status === "failed" || !data) {
    const fallbackMessage = error ?? "Unable to load lead volume.";
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin-dashboard`}
            className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/80 hover:text-charcoal"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        <div className="px-1">
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            Lead volume details
          </h1>
          <p className="mt-2 text-sm text-red-700" role="alert" aria-live="assertive">
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/admin-dashboard`}
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/80 hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="px-1">
        <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
          Lead volume details
        </h1>
        <p className="mt-1 text-size-sm text-charcoal/70">
          Total leads generated per month over the last 12 months.
        </p>
      </div>

      <InquiryTrendLineChart
        labels={labels}
        values={values}
        title="Lead volume"
        subtitle="Total leads generated per month"
        xAxisTitle="Month"
        yAxisTitle="Leads"
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
                <th className="py-2 pr-4 font-medium">Leads</th>
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

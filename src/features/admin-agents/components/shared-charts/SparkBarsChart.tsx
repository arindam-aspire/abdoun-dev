"use client";

import "@/features/admin-agents/components/shared-charts/chartJsRegister";
import { Bar } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";

export interface SparkBarsChartProps {
  values: number[];
  labels?: string[];
  title?: string;
  subtitle?: string;
  /** Optional "View details" action, shown top-right. */
  viewDetailsLabel?: string;
  /** When true, show every x-axis label (disable auto-skip). */
  showAllXTicks?: boolean;
  /** When true, draw value labels above each bar. */
  showValueLabels?: boolean;
  /** Show latest value, total, and change-from-previous summary below bars */
  showSummary?: boolean;
  xAxisTitle?: string;
  yAxisTitle?: string;
  summaryLatestLabel?: string;
  summaryTotalLabel?: string;
  summaryDeltaLabel?: string;
  className?: string;
}

const PRIMARY = "rgba(43, 91, 166, 0.8)";

export function SparkBarsChart({
  values,
  labels: customLabels,
  title,
  subtitle,
  viewDetailsLabel,
  showAllXTicks = false,
  showValueLabels = false,
  showSummary = true,
  xAxisTitle,
  yAxisTitle,
  summaryLatestLabel = "Latest",
  summaryTotalLabel = "Total",
  summaryDeltaLabel = "Change from previous",
  className = "",
}: Readonly<SparkBarsChartProps>) {
  const labels = customLabels ?? values.map((_, i) => (i + 1).toString());
  const latest = values.at(-1) ?? 0;
  const previous = values.at(-2) ?? latest;
  const delta = latest - previous;
  const total = values.reduce((sum, v) => sum + v, 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Count",
        data: values,
        backgroundColor: PRIMARY,
        borderRadius: 2,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) =>
            `${labels[ctx.dataIndex] ?? ""}: ${ctx.parsed.y ?? 0}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: showAllXTicks
          ? { autoSkip: false, maxRotation: 0, minRotation: 0, font: { size: 10 } }
          : { maxTicksLimit: 8, font: { size: 10 } },
        title: xAxisTitle ? { display: true, text: xAxisTitle, font: { size: 11 } } : undefined,
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { maxTicksLimit: 5, font: { size: 10 } },
        title: yAxisTitle
          ? { display: true, text: yAxisTitle, font: { size: 11 } }
          : undefined,
      },
    },
  };

  const valueLabelsPlugin = {
    id: "sparkBarsValueLabels",
    afterDatasetsDraw(chart: any) {
      if (!showValueLabels) return;
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta?.data?.length) return;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "rgba(17, 24, 39, 0.8)"; // near-charcoal
      ctx.font = "600 10px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

      meta.data.forEach((bar: any, i: number) => {
        const v = values[i];
        if (typeof v !== "number") return;
        const pos = bar.tooltipPosition();
        ctx.fillText(String(v), pos.x, pos.y - 4);
      });

      ctx.restore();
    },
  };

  return (
    <section
      className={`rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5 ${className}`}
    >
      {title ?? subtitle ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-sm font-semibold text-charcoal">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-xs text-charcoal/65">{subtitle}</p> : null}
          </div>
          <div className="flex flex-col items-end gap-2">
            {viewDetailsLabel ? (
              <button
                type="button"
                className="text-xs font-medium text-(--brand-secondary) hover:text-brand-secondary/80 transition shrink-0"
              >
                {viewDetailsLabel}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="h-36 w-full">
        <Bar data={chartData} options={options} plugins={showValueLabels ? [valueLabelsPlugin] : undefined} />
      </div>
      {showSummary ? (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-subtle bg-surface px-2.5 py-2">
            <p className="text-charcoal/65">{summaryTotalLabel}</p>
            <p className="mt-0.5 font-semibold text-charcoal">{total}</p>
          </div>
          <div className="rounded-lg border border-subtle bg-surface px-2.5 py-2">
            <p className="text-charcoal/65">{summaryDeltaLabel}</p>
            <p
              className={`mt-0.5 font-semibold ${
                delta >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {delta >= 0 ? `+${delta}` : delta}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}


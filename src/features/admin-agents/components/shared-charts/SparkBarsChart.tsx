"use client";

import "@/features/admin-agents/components/shared-charts/chartJsRegister";
import { Bar } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";

export interface SparkBarsChartProps {
  values: number[];
  labels?: string[];
  title?: string;
  subtitle?: string;
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
  showSummary = true,
  xAxisTitle,
  yAxisTitle,
  summaryLatestLabel = "Latest",
  summaryTotalLabel = "Total",
  summaryDeltaLabel = "Change from previous",
  className = "",
}: SparkBarsChartProps) {
  const labels = customLabels ?? values.map((_, i) => (i + 1).toString());
  const latest = values[values.length - 1] ?? 0;
  const previous = values[values.length - 2] ?? latest;
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
        ticks: { maxTicksLimit: 8, font: { size: 10 } },
        title: xAxisTitle
          ? { display: true, text: xAxisTitle, font: { size: 11 } }
          : undefined,
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
          {showSummary ? (
            <div className="rounded-lg bg-surface px-2.5 py-1.5 text-right">
              <p className="text-xs text-charcoal/65">{summaryLatestLabel}</p>
              <p className="text-sm font-semibold text-charcoal">{latest}</p>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="h-36 w-full">
        <Bar data={chartData} options={options} />
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


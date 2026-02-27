"use client";

import "@/components/agent/chartJsRegister";
import { Bar } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";

/**
 * Reusable spark/bar chart for numeric series (Chart.js). Data via props only.
 */
export interface SparkBarsChartProps {
  values: number[];
  title?: string;
  subtitle?: string;
  /** Show "Latest", "Total", "Delta" summary below bars */
  showSummary?: boolean;
  className?: string;
}

const PRIMARY = "rgba(43, 91, 166, 0.8)";

export function SparkBarsChart({
  values,
  title,
  subtitle,
  showSummary = true,
  className = "",
}: SparkBarsChartProps) {
  const labels = values.map((_, i) => (i + 1).toString());
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
          label: (ctx: TooltipItem<"bar">) => String(ctx.parsed.y ?? 0),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 8, font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { maxTicksLimit: 5, font: { size: 10 } },
      },
    },
  };

  return (
    <section
      className={`rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5 ${className}`}
    >
      {(title ?? subtitle) ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title ? (
              <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-xs text-charcoal/65">{subtitle}</p>
            ) : null}
          </div>
          {showSummary ? (
            <div className="rounded-lg bg-surface px-2.5 py-1.5 text-right">
              <p className="text-xs text-charcoal/65">Latest</p>
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
            <p className="text-charcoal/65">Total</p>
            <p className="mt-0.5 font-semibold text-charcoal">{total}</p>
          </div>
          <div className="rounded-lg border border-subtle bg-surface px-2.5 py-2">
            <p className="text-charcoal/65">MoM delta</p>
            <p
              className={`mt-0.5 font-semibold ${delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}
            >
              {delta >= 0 ? `+${delta}` : delta}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

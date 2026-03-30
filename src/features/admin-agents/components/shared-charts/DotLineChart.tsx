"use client";

import "@/features/admin-agents/components/shared-charts/chartJsRegister";
import { Line } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";

export interface DotLineChartProps {
  labels: string[];
  values: number[];
  title?: string;
  subtitle?: string;
  /** Optional "View details" action, shown top-right. */
  viewDetailsLabel?: string;
  className?: string;
}

const EMERALD = "#059669";

export function DotLineChart({
  labels,
  values,
  title,
  subtitle,
  viewDetailsLabel,
  className = "",
}: Readonly<DotLineChartProps>) {
  const safeLabels = labels ?? [];
  const safeValues = values ?? [];

  const data = {
    labels: safeLabels,
    datasets: [
      {
        label: "Leads",
        data: safeValues,
        borderColor: EMERALD,
        backgroundColor: EMERALD,
        fill: false,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: EMERALD,
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">) =>
            `${ctx.label}: ${(ctx.parsed.y ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
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
      {title ? (
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
            {viewDetailsLabel ? (
              <button
                type="button"
                className="text-xs font-medium text-(--brand-secondary) hover:text-brand-secondary/80 transition shrink-0"
              >
                {viewDetailsLabel}
              </button>
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-1 text-xs text-charcoal/65">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      <div className="h-[200px] w-full">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}


"use client";

import "@/components/agent/chartJsRegister";
import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

/**
 * Reusable doughnut chart (Chart.js). Data via props only.
 */
export interface DoughnutChartProps {
  labels: string[];
  values: number[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const COLORS = [
  "#2b5ba6",  // royal-blue / primary
  "#059669",  // emerald
  "#d97706",  // amber
  "#dc2626",  // rose
  "#7c3aed",  // violet
  "#0891b2",  // cyan
];

const COLORS_HOVER = [
  "#1e4a8a",
  "#047857",
  "#b45309",
  "#b91c1c",
  "#6d28d9",
  "#0e7490",
];

export function DoughnutChart({
  labels,
  values,
  title,
  subtitle,
  className = "",
}: DoughnutChartProps) {
  const safeValues = values ?? [];
  const safeLabels = labels ?? [];
  const total = safeValues.reduce((s, v) => s + v, 0);

  const data = {
    labels: safeLabels,
    datasets: [
      {
        data: safeValues,
        backgroundColor: COLORS.slice(0, safeValues.length),
        hoverBackgroundColor: COLORS_HOVER.slice(0, safeValues.length),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed ?? 0;
            const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0";
            return ` ${ctx.label}: ${v.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <section
      className={`rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5 ${className}`}
    >
      {title ? (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-charcoal/65">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      <div className="mx-auto h-[220px] w-full max-w-[280px]">
        <Doughnut data={data} options={options} />
      </div>
    </section>
  );
}

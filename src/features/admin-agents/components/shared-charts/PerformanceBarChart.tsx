"use client";

import "@/features/admin-agents/components/shared-charts/chartJsRegister";
import { Bar } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";
import type { PerformanceComparisonItem } from "@/types/agent";

export interface PerformanceBarChartProps {
  data: PerformanceComparisonItem[];
  title?: string;
  viewDetailsLabel?: string;
  valueLabel?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  className?: string;
}

const PRIMARY = "#2b5ba6";

export function PerformanceBarChart({
  data,
  title,
  viewDetailsLabel,
  valueLabel,
  xAxisTitle,
  yAxisTitle,
  className = "",
}: PerformanceBarChartProps) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: valueLabel ?? "Value",
        data: data.map((d) => d.value),
        backgroundColor: PRIMARY,
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) =>
            valueLabel ? `${ctx.parsed.x ?? 0} ${valueLabel}` : `${ctx.parsed.x ?? 0}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { maxTicksLimit: 6, font: { size: 10 } },
        title: xAxisTitle
          ? { display: true, text: xAxisTitle, font: { size: 11 } }
          : undefined,
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
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
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
          {viewDetailsLabel ? (
            <span className="text-xs font-medium text-[var(--brand-secondary)] hover:text-brand-secondary/80 transition shrink-0">
              {viewDetailsLabel}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="h-[200px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </section>
  );
}


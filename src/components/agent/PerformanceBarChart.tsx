"use client";

import "@/components/agent/chartJsRegister";
import { Bar } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";
import type { PerformanceComparisonItem } from "@/types/agent";

/**
 * Reusable performance comparison horizontal bar chart (Chart.js). Data via props only.
 */
export interface PerformanceBarChartProps {
  data: PerformanceComparisonItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const PRIMARY = "#2b5ba6";

export function PerformanceBarChart({
  data,
  title,
  subtitle,
  className = "",
}: PerformanceBarChartProps) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: "Inquiries",
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
          label: (ctx: TooltipItem<"bar">) => `${ctx.parsed.x ?? 0}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { maxTicksLimit: 6, font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <section
      className={`rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5 ${className}`}
    >
      {title ? (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-charcoal/65">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      <div className="h-[200px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </section>
  );
}

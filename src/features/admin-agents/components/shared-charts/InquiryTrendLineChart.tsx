"use client";

import "@/features/admin-agents/components/shared-charts/chartJsRegister";
import { Line } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";

export interface InquiryTrendLineChartProps {
  values: number[];
  /** Optional custom labels for each point (e.g. month names). */
  labels?: string[];
  title?: string;
  subtitle?: string;
  viewDetailsLabel?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  className?: string;
}

const PRIMARY = "#2b5ba6";
const PRIMARY_FILL = "rgba(43, 91, 166, 0.2)";

export function InquiryTrendLineChart({
  values,
  labels: customLabels,
  title,
  subtitle,
  viewDetailsLabel,
  xAxisTitle,
  yAxisTitle,
  className = "",
}: InquiryTrendLineChartProps) {
  const labels = customLabels ?? values.map((_, i) => (i + 1).toString());

  const data = {
    labels,
    datasets: [
      {
        label: "Inquiries",
        data: values,
        borderColor: PRIMARY,
        backgroundColor: PRIMARY_FILL,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
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
            `${labels[ctx.dataIndex] ?? `Point ${ctx.dataIndex + 1}`}: ${ctx.parsed.y ?? 0}`,
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
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            {title ? (
              <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
            ) : null}
            {viewDetailsLabel ? (
              <button
                type="button"
                className="text-xs font-medium text-(--brand-secondary) hover:text-brand-secondary/80 transition shrink-0"
              >
                {viewDetailsLabel}
              </button>
            ) : null}
          </div>
          {subtitle ? <p className="mt-1 text-xs text-charcoal/65">{subtitle}</p> : null}
        </div>
      ) : null}
      <div className="h-[208px] w-full">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}


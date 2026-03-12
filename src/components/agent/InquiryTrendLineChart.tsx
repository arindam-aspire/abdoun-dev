"use client";

import "@/components/agent/chartJsRegister";
import { Line } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";

/**
 * Reusable inquiry trend line chart (Chart.js). Data via props only.
 */
export interface InquiryTrendLineChartProps {
  /** Daily values (e.g. last 30 days). Length determines x-axis. */
  values: number[];
  title?: string;
  /** Optional description below the title. */
  subtitle?: string;
  /** Shown on the same line as title, right-aligned, secondary color (e.g. "View Details."). */
  viewDetailsLabel?: string;
  /** X-axis label (e.g. "Day (1–30)") */
  xAxisTitle?: string;
  /** Y-axis label (e.g. "Number of inquiries") */
  yAxisTitle?: string;
  className?: string;
}

const PRIMARY = "#2b5ba6";
const PRIMARY_FILL = "rgba(43, 91, 166, 0.2)";

export function InquiryTrendLineChart({
  values,
  title,
  subtitle,
  viewDetailsLabel,
  xAxisTitle,
  yAxisTitle,
  className = "",
}: InquiryTrendLineChartProps) {
  const labels = values.map((_, i) => (i + 1).toString());

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
            `Day ${ctx.dataIndex + 1}: ${ctx.parsed.y ?? 0}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 8, font: { size: 10 } },
        title: xAxisTitle ? { display: true, text: xAxisTitle, font: { size: 11 } } : undefined,
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { maxTicksLimit: 5, font: { size: 10 } },
        title: yAxisTitle ? { display: true, text: yAxisTitle, font: { size: 11 } } : undefined,
      },
    },
  };

  return (
    <section
      className={`rounded-2xl border border-subtle bg-white p-4 shadow-sm md:p-5 ${className}`}
    >
      {(title ?? subtitle) ? (
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            {title ? <h3 className="text-sm font-semibold text-charcoal">{title}</h3> : null}
            {viewDetailsLabel ? (
              <span className="text-xs font-medium text-[var(--brand-secondary)] hover:text-brand-secondary/80 transition shrink-0">{viewDetailsLabel}</span>
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

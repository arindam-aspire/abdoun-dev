import { cn } from "@/lib/cn";
import type { ComponentType } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

export type DashboardMetricCardProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  /** Optional URL wrapper. If provided, the card becomes clickable. */
  href?: string | null;
  /** Tailwind classes for icon bubble background/ring. */
  iconBgClassName?: string;
  /** Tailwind classes for icon color/size. */
  iconClassName?: string;
  /** Tailwind classes for the value text. */
  valueClassName?: string;
  /**
   * Percent change indicator. When non-zero, shows TrendingUp/TrendingDown with the value.
   * Keeps the same visual pattern as AgentDashboard.
   */
  deltaTrend?: number | null;
  /** Optional supporting line under the value (e.g. conversion rate or "+2 today"). */
  subLine?: string | null;
  /** Tailwind classes for subLine text. */
  subLineClassName?: string;
  className?: string;
};

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  href = null,
  iconBgClassName,
  iconClassName,
  valueClassName,
  deltaTrend = null,
  subLine = null,
  subLineClassName,
  className,
}: Readonly<DashboardMetricCardProps>) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-charcoal/70">{label}</p>
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full",
            iconBgClassName
          )}
        >
          <Icon className={cn("h-4 w-4 text-secondary", iconClassName)} />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className={cn("text-2xl font-semibold text-charcoal", valueClassName)}>{value}</p>
        {typeof deltaTrend === "number" && deltaTrend !== 0 ? (
          <span
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              deltaTrend > 0 ? "text-emerald-600" : "text-red-600"
            )}
          >
            {deltaTrend > 0 ? (
              <TrendingUp className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <TrendingDown className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {deltaTrend > 0 ? `+${deltaTrend}%` : `${deltaTrend}%`}
          </span>
        ) : null}
      </div>

      {subLine ? (
        <p className={cn("mt-1.5 text-xs font-medium text-charcoal/70", subLineClassName)}>
          {subLine}
        </p>
      ) : null}
    </>
  );

  return (
    <article className={cn("rounded-2xl border border-subtle bg-white p-4 shadow-sm", className)}>
      {href ? (
        <Link href={href} className="block rounded-xl -m-2 p-2 transition hover:bg-surface/50">
          {content}
        </Link>
      ) : (
        content
      )}
    </article>
  );
}

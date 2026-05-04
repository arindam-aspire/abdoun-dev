import { cn } from "@/lib/cn";
import type { ComponentType, MouseEventHandler } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

const interactiveWrapClass =
  "block w-full rounded-xl -m-2 p-2 text-left transition hover:bg-surface/50";

export type DashboardMetricCardProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  /** Optional URL. The card is only a link when `href` is set and `useLink` is true. */
  href?: string | null;
  /**
   * When `href` is set, the card uses Next.js `Link` by default.
   * Set to `false` to render a non-clickable card (no link; `href` is ignored for interaction).
   */
  useLink?: boolean;
  /** Fires on the `Link` wrapper only when `href` is set and `useLink` is true (e.g. analytics). */
  onCardClick?: MouseEventHandler<HTMLAnchorElement>;
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
  useLink = true,
  onCardClick,
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

  const wrapAsLink = Boolean(href) && useLink;

  return (
    <article className={cn("rounded-xl border border-subtle bg-white p-4 shadow-sm", className)}>
      {wrapAsLink ? (
        <Link href={href!} onClick={onCardClick} className={interactiveWrapClass}>
          {content}
        </Link>
      ) : (
        content
      )}
    </article>
  );
}

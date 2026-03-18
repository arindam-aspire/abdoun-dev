import type { ComponentType, ReactNode } from "react";
import Link from "next/link";

export type MetricCardProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconBgClass: string;
  href?: string;
  subLine?: string | null;
  deltaTrend?: number;
  deltaIconUp?: ReactNode;
  deltaIconDown?: ReactNode;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconBgClass,
  href,
  subLine,
  deltaTrend = 0,
  deltaIconUp,
  deltaIconDown,
}: MetricCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-charcoal/70">{label}</p>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${iconBgClass}`}
        >
          <Icon className="h-4 w-4 text-secondary" aria-hidden />
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-2xl font-semibold text-charcoal">{value}</p>
        {deltaTrend !== 0 && (
          <span
            className={`flex items-center gap-1.5 text-sm font-medium ${
              deltaTrend > 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {deltaTrend > 0 ? deltaIconUp : null}
            {deltaTrend < 0 ? deltaIconDown : null}
            {deltaTrend > 0 ? `+${deltaTrend}%` : `${deltaTrend}%`}
          </span>
        )}
      </div>
      {subLine ? (
        <p className="mt-1.5 text-xs font-medium text-amber-700/80">{subLine}</p>
      ) : null}
    </>
  );

  return (
    <article className="rounded-2xl border border-subtle bg-white p-4 shadow-sm">
      {href ? (
        <Link
          href={href}
          className="block transition hover:bg-surface/50 rounded-xl -m-2 p-2"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </article>
  );
}


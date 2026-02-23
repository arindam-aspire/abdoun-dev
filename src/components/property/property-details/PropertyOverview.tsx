import type { DetailedProperty } from "./types";

export interface PropertyOverviewProps {
  property: DetailedProperty;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  return (
    <section className="mt-8 md:mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal)]/70">
          Overview
        </p>
      </div>

      <div className="relative pl-4 border-l-2 border-[var(--brand-primary)]/40 md:pl-5">
        <p className="text-sm leading-relaxed text-[var(--color-charcoal)] md:text-[15px]">
          {property.description}
        </p>
      </div>
    </section>
  );
}

import type { DetailedProperty } from "./types";

export interface PropertyOverviewProps {
  property: DetailedProperty;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  return (
    <section className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-white/95 p-4 shadow-sm md:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal)]/70">
          Overview
        </p>
        <div className="inline-flex gap-2 rounded-full bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--color-charcoal)]/80">
          <span className="rounded-full bg-[var(--brand-accent)]/20 px-2 py-0.5 text-[var(--brand-secondary)]">
            Ready to move in
          </span>
          <span className="rounded-full bg-[var(--surface)] ring-1 ring-[var(--border-subtle)] px-2 py-0.5">
            Freehold
          </span>
        </div>
      </div>

      <div className="relative pl-3 md:pl-4">
        <div className="absolute inset-y-1 left-0 w-px rounded-full bg-gradient-to-b from-[var(--brand-primary)]/50 via-[var(--border-subtle)] to-transparent md:left-1" />
        <p className="text-sm leading-relaxed text-[var(--color-charcoal)] md:text-[15px]">
          {property.description}
        </p>
      </div>
    </section>
  );
}

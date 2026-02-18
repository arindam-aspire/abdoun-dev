import { Bath, BedDouble, Maximize2, Compass } from "lucide-react";
import type { DetailedProperty, PropertyStat } from "./types";

export interface PropertyHighlightsProps {
  property: DetailedProperty;
  stats: PropertyStat[];
}

export function PropertyHighlights({ property, stats }: PropertyHighlightsProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-white via-[var(--surface)] to-[var(--surface)] p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            Key highlights
          </p>
          <p className="mt-1 text-xs text-[var(--color-charcoal)]/70">
            A quick snapshot of what makes this home special.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-charcoal)]/80">
          {property.orientation && (
            <span className="rounded-full bg-white/70 px-3 py-1 shadow-xs ring-1 ring-[var(--border-subtle)]">
              Facing {property.orientation}
            </span>
          )}
          {property.floor && (
            <span className="rounded-full bg-white/70 px-3 py-1 shadow-xs ring-1 ring-[var(--border-subtle)]">
              {property.floor}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-[var(--color-charcoal)] sm:grid-cols-4">
        <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-[var(--border-subtle)]">
          <BedDouble className="h-4 w-4 text-[var(--brand-primary)]" />
          <div>
            <p className="text-[11px] text-[var(--color-charcoal)]/70">Bedrooms</p>
            <p className="text-sm font-semibold text-[var(--color-charcoal)]">
              {property.beds}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-[var(--border-subtle)]">
          <Bath className="h-4 w-4 text-[var(--brand-primary)]" />
          <div>
            <p className="text-[11px] text-[var(--color-charcoal)]/70">Bathrooms</p>
            <p className="text-sm font-semibold text-[var(--color-charcoal)]">
              {property.baths}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-[var(--border-subtle)]">
          <Maximize2 className="h-4 w-4 text-[var(--brand-primary)]" />
          <div>
            <p className="text-[11px] text-[var(--color-charcoal)]/70">Built-up area</p>
            <p className="text-sm font-semibold text-[var(--color-charcoal)]">
              {property.area}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-[var(--border-subtle)]">
          <Compass className="h-4 w-4 text-[var(--brand-primary)]" />
          <div>
            <p className="text-[11px] text-[var(--color-charcoal)]/70">Property type</p>
            <p className="text-sm font-semibold text-[var(--color-charcoal)]">Penthouse</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--color-charcoal)] sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-white/80 px-3 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.05)] ring-1 ring-[var(--border-subtle)] sm:px-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-charcoal)]/70">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-charcoal)]">
              {item.value}
            </p>
            {item.helper && (
              <p className="mt-0.5 text-[11px] text-[var(--color-charcoal)]/70">{item.helper}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

import { Bath, BedDouble, Maximize2, Compass } from "lucide-react";
import type { DetailedProperty, PropertyStat } from "./types";

export interface PropertyHighlightsProps {
  property: DetailedProperty;
  stats: PropertyStat[];
}

export function PropertyHighlights({ property, stats }: PropertyHighlightsProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm fw-bold uppercase tracking-[0.16em] text-primary">
            Key highlights
          </p>
          <p className="mt-1 text-size-xs fw-medium text-charcoal/75">
            A quick snapshot of what makes this home special.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-size-xs fw-medium text-charcoal/85">
          {property.orientation && (
            <span className="rounded-full bg-surface px-3 py-1 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
              Facing {property.orientation}
            </span>
          )}
          {property.floor && (
            <span className="rounded-full bg-surface px-3 py-1 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
              {property.floor}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-size-xs text-charcoal sm:grid-cols-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <BedDouble className="h-4 w-4 text-primary" />
          </span>
          <div>
            <p className="text-size-11 fw-medium text-charcoal/75">Bedrooms</p>
            <p className="text-size-sm fw-semibold text-charcoal">
              {property.beds}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bath className="h-4 w-4 text-primary" />
          </span>
          <div>
            <p className="text-size-11 fw-medium text-charcoal/75">Bathrooms</p>
            <p className="text-size-sm fw-semibold text-charcoal">
              {property.baths}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Maximize2 className="h-4 w-4 text-primary" />
          </span>
          <div>
            <p className="text-size-11 fw-medium text-charcoal/75">
              Built-up area
            </p>
            <p className="text-size-sm fw-semibold text-charcoal">
              {property.area}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Compass className="h-4 w-4 text-primary" />
          </span>
          <div>
            <p className="text-size-11 fw-medium text-charcoal/75">
              Property type
            </p>
            <p className="text-size-sm fw-semibold text-charcoal">
              {property.propertyType ?? "Property"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-subtle pt-5 text-size-xs text-charcoal sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-surface/70 px-3 py-2 shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
          >
            <p className="text-size-11 fw-semibold uppercase tracking-[0.14em] text-charcoal/75">
              {item.label}
            </p>
            <p className="mt-1 text-size-sm fw-semibold text-charcoal">
              {item.value}
            </p>
            {item.helper && (
              <p className="mt-0.5 text-size-11 fw-medium text-charcoal/75">
                {item.helper}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}



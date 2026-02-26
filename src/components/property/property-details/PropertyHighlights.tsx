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
          <p className="text-size-11 fw-semibold uppercase tracking-[0.18em] text-primary">
            Key highlights
          </p>
          <p className="mt-1 text-size-xs text-charcoal/70">
            A quick snapshot of what makes this home special.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-size-11 text-charcoal/80">
          {property.orientation && (
            <span className="rounded-full bg-surface/70 px-3 py-1">
              Facing {property.orientation}
            </span>
          )}
          {property.floor && (
            <span className="rounded-full bg-surface/70 px-3 py-1">
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
            <p className="text-size-11 text-charcoal/70">Bedrooms</p>
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
            <p className="text-size-11 text-charcoal/70">Bathrooms</p>
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
            <p className="text-size-11 text-charcoal/70">Built-up area</p>
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
            <p className="text-size-11 text-charcoal/70">Property type</p>
            <p className="text-size-sm fw-semibold text-charcoal">
              {property.propertyType ?? "Property"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-subtle pt-5 text-size-xs text-charcoal sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="py-1">
            <p className="text-size-11 fw-semibold uppercase tracking-[0.16em] text-charcoal/70">
              {item.label}
            </p>
            <p className="mt-1 text-size-sm fw-semibold text-charcoal">
              {item.value}
            </p>
            {item.helper && (
              <p className="mt-0.5 text-size-11 text-charcoal/70">{item.helper}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}



import { Bath, BedDouble, Maximize2, Compass } from "lucide-react";
import type { DetailedProperty, PropertyStat } from "@/features/property-details/types";

export interface PropertyHighlightsProps {
  property: DetailedProperty;
  stats: PropertyStat[];
}

export function PropertyHighlights({ property, stats }: PropertyHighlightsProps) {
  return (
    <section className="space-y-7">
      <div className="rounded-2xl border border-[#d9dee7] bg-[#f8f9fb] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm fw-bold uppercase tracking-[0.16em] text-[#1f2a3d]">
              Key highlights
            </p>
            <p className="mt-1 text-size-xs fw-medium text-[#667085]">
              A quick snapshot of what makes this home special.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-size-xs fw-medium text-[#4a5567]">
            {property.orientation && (
              <span className="rounded-full border border-[#d9dee7] bg-white px-3 py-1">
                Facing {property.orientation}
              </span>
            )}
            {property.floor && (
              <span className="rounded-full border border-[#d9dee7] bg-white px-3 py-1">
                {property.floor}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-size-xs text-charcoal sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#e7eaef] px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#dde4ee]">
              <BedDouble className="h-4 w-4 text-[#5f6b7c]" />
            </span>
            <div>
              <p className="text-size-11 fw-medium text-[#5f6b7c]">Bedrooms</p>
              <p className="text-xl fw-bold leading-none text-[#111827]">
                {property.beds}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#e7eaef] px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#dde4ee]">
              <Bath className="h-4 w-4 text-[#5f6b7c]" />
            </span>
            <div>
              <p className="text-size-11 fw-medium text-[#5f6b7c]">Bathrooms</p>
              <p className="text-xl fw-bold leading-none text-[#111827]">
                {property.baths}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#e7eaef] px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#dde4ee]">
              <Maximize2 className="h-4 w-4 text-[#5f6b7c]" />
            </span>
            <div>
              <p className="text-size-11 fw-medium text-[#5f6b7c]">
                Built-in area
              </p>
              <p className="text-xl fw-bold leading-none text-[#111827]">
                {property.area}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#e7eaef] px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#dde4ee]">
              <Compass className="h-4 w-4 text-[#5f6b7c]" />
            </span>
            <div>
              <p className="text-size-11 fw-medium text-[#5f6b7c]">
                Property type
              </p>
              <p className="text-xl fw-bold leading-none text-[#111827]">
                {property.propertyType ?? "Property"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 text-size-xs text-charcoal sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[#d9dee7] bg-[#f2f4f7] px-5 py-4"
          >
            <p className="text-size-11 fw-semibold uppercase tracking-[0.14em] text-[#667085]">
              {item.label}
            </p>
            <p className="mt-1 text-xl fw-bold leading-none text-">
              {item.value}
            </p>
            {item.description && (
              <p className="mt-2 text-size-xs fw-medium leading-snug text-[#4a5567]">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

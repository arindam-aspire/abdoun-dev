"use client";

import type { Property } from "./types";
import type { FeaturedTranslations } from "./types";
import { PropertyCard } from "./PropertyCard";

export interface FeaturedPropertiesSectionProps {
  translations: FeaturedTranslations;
  properties: Property[];
  isRtl?: boolean;
}

export function FeaturedPropertiesSection({
  translations: t,
  properties,
  isRtl,
}: FeaturedPropertiesSectionProps) {
  return (
    <section
      className="container mx-auto px-4 py-10 md:px-8 md:py-14"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={`mb-6 flex flex-col items-start justify-between gap-4 md:mb-8 md:flex-row md:items-end`}
      >
        <div className={isRtl ? "md:text-right" : ""}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
            {t.title}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 md:text-2xl">
            {t.subtitle}
          </h2>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-sky-700 hover:text-sky-800"
        >
          {t.viewAll}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}

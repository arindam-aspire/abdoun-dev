"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { MapPin } from "lucide-react";
import type { Property } from "@/components/home/types";
import { PropertyCard } from "@/components/home/PropertyCard";

const SIMILAR_PROPERTIES: Property[] = [
  {
    id: 2,
    title: "Skyline Terrace Residence",
    price: "980,000 JD",
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1743486780771-afd09eea3624?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0",
    location: "Dabouq, Amman",
    beds: 3,
    baths: 4,
    area: "4,200",
  },
  {
    id: 3,
    title: "Abdoun Garden Villa",
    price: "1,450,000 JD",
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0",
    location: "Abdoun, Amman",
    beds: 5,
    baths: 6,
    area: "9,100",
  },
];

export function PropertyDetailsSimilarProperties() {
  const [activeSimilar, setActiveSimilar] = useState(0);
  const total = SIMILAR_PROPERTIES.length;
  const current = SIMILAR_PROPERTIES[activeSimilar];
  const isRtl = useLocale() === "ar";

  const goTo = (index: number) => {
    const next = (index + total) % total;
    setActiveSimilar(next);
  };

  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 text-xs text-[var(--color-charcoal)] shadow-sm md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[var(--brand-primary)]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal)]/80">
            Similar properties
          </p>
        </div>
        <span className="text-[11px] text-[var(--color-charcoal)]/70">Curated for you</span>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)]">
        <PropertyCard property={current} agentLabel="Abdoun Real Estate" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div
          className={`flex items-center gap-1 text-[11px] text-[var(--color-charcoal)]/70 ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => goTo(activeSimilar - 1)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--color-charcoal)] hover:bg-[var(--surface)]"
            aria-label={isRtl ? "Next similar property" : "Previous similar property"}
          >
            {isRtl ? "›" : "‹"}
          </button>
          <button
            type="button"
            onClick={() => goTo(activeSimilar + 1)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--color-charcoal)] hover:bg-[var(--surface)]"
            aria-label={isRtl ? "Previous similar property" : "Next similar property"}
          >
            {isRtl ? "‹" : "›"}
          </button>
          <span className={isRtl ? "mr-1" : "ml-1"}>
            {activeSimilar + 1} / {total}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {SIMILAR_PROPERTIES.map((property, index) => (
            <button
              key={property.id}
              type="button"
              onClick={() => setActiveSimilar(index)}
              className={`h-1.5 w-3 rounded-full transition ${
                index === activeSimilar
                  ? "bg-[var(--brand-primary)]"
                  : "bg-[var(--border-subtle)] hover:opacity-80"
              }`}
              aria-label={`Go to similar property ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

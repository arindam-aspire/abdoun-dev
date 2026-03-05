"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <section
      className="rounded-2xl border border-subtle bg-white/95 py-5 text-charcoal shadow-[0_8px_24px_rgba(15,23,42,0.08)] md:py-6"
      aria-labelledby="similar-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-2 px-4 md:px-5">
        <h2
          id="similar-heading"
          className="text-size-sm fw-semibold uppercase tracking-[0.14em] text-charcoal/85"
        >
          Similar properties
        </h2>
        <span className="text-size-xs fw-medium text-charcoal/70">Curated for you</span>
      </div>

      <div className="px-4 md:px-5">
        <PropertyCard
          property={current}
          agentLabel="Abdoun Real Estate"
          variant="minimal"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 px-4 md:px-5">
        <div
          className={`flex items-center gap-1 text-size-11 text-charcoal/70 ${
            isRtl ? "flex-row-reverse" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => goTo(activeSimilar - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-on-primary hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            aria-label={
              isRtl ? "Next similar property" : "Previous similar property"
            }
          >
            {isRtl ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => goTo(activeSimilar + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-on-primary hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            aria-label={
              isRtl ? "Previous similar property" : "Next similar property"
            }
          >
            {isRtl ? (
              <ChevronLeft className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
          <span className={isRtl ? "mr-1" : "ml-1"}>
            {activeSimilar + 1} / {total}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1 px-4 md:px-5">
        {SIMILAR_PROPERTIES.map((property, index) => (
          <button
            key={property.id}
            type="button"
            onClick={() => setActiveSimilar(index)}
            className={`h-1.5 rounded-full transition ${
              index === activeSimilar
                ? "w-5 bg-secondary"
                : "w-3 bg-border-subtle hover:opacity-80"
            }`}
            aria-label={`Go to similar property ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}



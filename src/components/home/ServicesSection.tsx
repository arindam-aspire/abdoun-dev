"use client";

import type { ServicesTranslations } from "./types";
import { ServiceCard } from "./ServiceCard";

export interface ServicesSectionProps {
  translations: ServicesTranslations;
}

export function ServicesSection({ translations: t }: ServicesSectionProps) {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
            {t.title}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 md:text-2xl">
            {t.subtitle}
          </h2>
          <p className="mt-3 text-sm text-slate-500 md:text-base">
            {t.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {t.cards.map((card) => (
            <ServiceCard key={card.title} item={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import type { ServicesTranslations } from "./types";
import { ServiceCard } from "./ServiceCard";

export interface ServicesSectionProps {
  translations: ServicesTranslations;
}

export function ServicesSection({ translations: t }: ServicesSectionProps) {
  return (
    <section className="bg-slate-50/50">
      <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
        <header className="mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            {t.title}
          </p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-slate-900 md:text-3xl md:leading-snug">
            {t.subtitle}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 md:text-base">
            {t.description}
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
          {t.cards.map((card) => (
            <ServiceCard key={card.title} item={card} />
          ))}
        </div>
      </div>
    </section>
  );
}

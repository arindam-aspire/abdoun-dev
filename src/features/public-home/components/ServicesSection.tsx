"use client";

import type { ServicesTranslations } from "@/features/public-home/components/types";
import { ServiceCard } from "@/features/public-home/components/ServiceCard";

export interface ServicesSectionProps {
  translations: ServicesTranslations;
  isRtl?: boolean;
}

export function ServicesSection({
  translations: t,
  isRtl,
}: ServicesSectionProps) {
  return (
    <section className="bg-surface">
      <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
        <header className={`mx-auto text-center ${isRtl ? "md:text-right" : ""}`}>
          <p className="text-size-xs fw-semibold uppercase tracking-[0.2em] text-primary">
            {t.title}
          </p>
          <h2 className="mt-4 text-size-2xl fw-semibold leading-tight text-secondary md:text-size-3xl md:leading-snug">
            {t.subtitle}
          </h2>
          <p className="mt-4 text-size-sm leading-relaxed text-[rgba(51,51,51,0.8)] md:text-size-base">
            {t.description}
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
          {t.cards.map((card) => (
            <ServiceCard key={card.title} item={card} isRtl={isRtl} />
          ))}
        </div>
      </div>
    </section>
  );
}

